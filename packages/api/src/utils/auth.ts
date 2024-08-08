/*
 * © 2021 Thoughtworks, Inc.
 */
import { Logger } from '@cloud-carbon-footprint/common'
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken'
import jwksClient, { RsaSigningKey } from 'jwks-rsa'
import { authProvider } from '../auth/auth.provider'
import { AZURE_SERVICES_ENDPOINT } from '../authConfig'
import { UserEntity } from '../users/entity/user.entity'
import * as userService from '../users/user.service'

const authLogger = new Logger('auth')

const client = jwksClient({
  jwksUri:
    'https://login.microsoftonline.com/organizations/discovery/v2.0/keys',
})

function getPublicKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        authLogger.error(`Error retrieving signing key for kid: ${kid}`, err)
        reject(err)
      } else {
        if ('rsaPublicKey' in key) {
          authLogger.info(
            `Retrieved RsaSigningKey for kid: ${
              (key as RsaSigningKey).rsaPublicKey
            }`,
          )
          resolve((key as RsaSigningKey).rsaPublicKey)
        } else {
          authLogger.warn(
            `Retrieved key is not an RsaSigningKey for kid: ${kid}`,
          )
          reject(new Error('Retrieved key is not an RsaSigningKey'))
        }
      }
    })
  })
}

function verifyToken(
  token: string,
  secretOrPublicKey: string,
  useJwtVerifier = true,
  verifyOptions?: VerifyOptions,
): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    if (useJwtVerifier) {
      jwt.verify(token, secretOrPublicKey, verifyOptions, (err, decoded) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded as JwtPayload)
        }
      })
    } else {
      resolve(jwt.decode(token, { complete: true }).payload as JwtPayload)
    }
  })
}

export const cloudAccessTokenValidator = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    authLogger.warn(`Authorization header is required`)
    res.status(401).send('Authorization header is required.')
    return
  }
  const token = authHeader.split(' ')[1]

  // Decode the token without verification to get the header
  const decodedToken: any = jwt.decode(token, { complete: true })
  if (!decodedToken || typeof decodedToken === 'string') {
    authLogger.warn('Invalid token structure')
    throw new Error('Invalid token structure')
  }

  authLogger.info(`Token payload: ${JSON.stringify(decodedToken, null, 2)}`)

  if (!req.user) {
    req.user = {}
  }
  const externalId = decodedToken.payload?.sub
  userService
    .getUserByExternalId(externalId)
    .then((user: UserEntity) => {
      if (!user) {
        authLogger.warn(`User not found for externalId: ${externalId}`)
        throw new Error(`User not found for externalId: ${externalId}`)
      }
      req.user.accessTokenToCloud = user.cloudConnections?.azure?.accessToken
    })
    .catch((error) => {
      // Handle the error appropriately
      console.error(error)
    })

  const getUserByExternalIdPromise = userService
    .getUserByExternalId(externalId)
    .then((user: UserEntity) => {
      if (!user) {
        authLogger.warn(`User not found for externalId: ${externalId}`)
        throw new Error(`User not found for externalId: ${externalId}`)
      }
      req.user.id = user.id
      req.user.accessTokenToCloud = user.cloudConnections?.azure?.accessToken
    })
    .catch((error) => {
      // Handle the error appropriately
      res.status(401).send('Cloud access token not found or has expired')
      return error
    })

  Promise.all([getUserByExternalIdPromise]).then(() => {
    const accessToken = req.user.accessTokenToCloud
    if (!accessToken) {
      authLogger.warn(`Cloud access token not found or has expired`)
      res.status(401).send('Cloud access token not found or has expired')
      return
    }

    verifyTokenExpiryForCloudAccess(accessToken)
      .then((verifiedAcessToken) => {
        if (!req.user) {
          req.user = {}
        }
        authLogger.info(
          `Cloud Access Token Payload: ${JSON.stringify(
            jwt.decode(verifiedAcessToken),
            null,
            2,
          )}`,
        )

        req.user.token = verifiedAcessToken
        next() // Continue to the next middleware
      })
      .catch((error) => {
        authLogger.error(`Error in auth middleware: `, error)
        res.status(403).send('Failed to authenticate token')
      })

    // If the token has not expired, Returns the same token if its valid and verified successfully
    // If the token has expired, Returns the new access token if it can be acquired silently
    // Returns an error if the token is invalid and cannot be acquired silently
    async function verifyTokenExpiryForCloudAccess(
      accessToken: string,
    ): Promise<string> {
      try {
        // Decode the token without verification to get the header
        const decodedToken = jwt.decode(accessToken, { complete: true })
        if (!decodedToken || typeof decodedToken === 'string') {
          authLogger.warn('Invalid token structure')
          throw new Error('Invalid token structure')
        }

        // Retrieve the public key
        const kid = decodedToken.header.kid
        if (!kid) {
          authLogger.warn('No "kid" found in token header')
          throw new Error('No "kid" found in token header')
        }
        authLogger.info(`Using kid from token: ${kid}`)

        // Attempt verification
        return getPublicKey(kid)
          .then(async (publicKey) => {
            try {
              await verifyToken(accessToken, publicKey, true)
              authLogger.info(`Token verified successfully!`)
              return accessToken
            } catch (error) {
              authLogger.info(
                `Error in auth middleware, attempting to acquire new access token siliently`,
              )
              if (error.name === 'TokenExpiredError') {
                // acquire token silently
                const accessToken =
                  await authProvider.acquireTokenForConsumptionMgmt(req, {
                    scopes: [AZURE_SERVICES_ENDPOINT],
                  })
                authLogger.info('Acquired token silently!')
                return accessToken
              } else {
                authLogger.warn(
                  'Attempt to acquire token silently failed, user is disconnected from the cloud!',
                )
                throw error
              }
            }
          })
          .catch(async (error) => {
            throw error
          })
      } catch (error) {
        throw error
      }
    }
  })
}
