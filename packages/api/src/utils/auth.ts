/*
 * © 2021 Thoughtworks, Inc.
 */
import { Logger } from '@cloud-carbon-footprint/common'
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken'
import jwksClient, { RsaSigningKey } from 'jwks-rsa'
import { authProvider } from '../auth/auth.provider'
import { AZURE_SERVICES_ENDPOINT } from '../authConfig'

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
  useJwtVerifier: boolean = true,
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

export const authSession = (req, res, next) => {
  if (!isAuthenticated(req, res, next)) {
    authLogger.warn(`Session not found or has expired`)
    res.status(401).send('Session not found or has expired')
    return
  }
  if (!req.user) {
    req.user = {}
  }
  const accessToken = req.session?.accessToken

  verifyTokenForGeneralAccess(accessToken)
    .then((verifiedToken) => {
      authLogger.info('Token verified successfully!')
      authLogger.info(
        `Verified token payload: ${JSON.stringify(verifiedToken, null, 2)}`,
      )

      if (!req.user) {
        req.user = {}
      }
      req.user.token = accessToken
      next() // Continue to the next middleware
    })
    .catch((error) => {
      authLogger.error(`Error in auth middleware: `, error)
      res.status(403).send('Failed to authenticate token')
    })

  // Define a new async function for token verification
  async function verifyTokenForGeneralAccess(
    accessToken: string,
  ): Promise<JwtPayload | void> {
    try {
      // Decode the token without verification to get the header
      const decodedToken = jwt.decode(accessToken, { complete: true })
      if (!decodedToken || typeof decodedToken === 'string') {
        authLogger.warn('Invalid token structure')
        res.status(400).send('Invalid token structure')
        return
      }

      // Retrieve the RSA public key
      const kid = decodedToken.header.kid
      if (!kid) {
        res.status(400).send('No "kid" found in token header')
        return
      }
      authLogger.info(`Using kid from token: ${kid}`)

      // Attempt token verification
      return getPublicKey(kid)
        .then(async (publicKey) => {
          return await verifyToken(accessToken, publicKey, false)
        }) 
        .catch((error) => {
          authLogger.error(`Error in auth middleware: `, error)
        })
    } catch (error) {
      authLogger.error(`Error in auth middleware: `, error)
    }
  }
}

export const cloudAccessTokenValidator = (req, res, next) => {
  if (!isAuthenticated(req, res, next)) {
    authLogger.warn(`Session not found or has expired`)
    res.status(401).send('Session not found or has expired')
    return
  }
  const accessToken = req.session?.accessTokenToCloud
  if (!accessToken) {
    authLogger.warn(`Cloud access token not found or has expired`)
    res.status(401).send('Cloud access token not found or has expired')
    return
  }

  verifyTokenForCloudAccess(accessToken)
    .then((verifiedToken) => {
      authLogger.info('Token verified successfully!')
      authLogger.info(
        `Verified token payload: ${JSON.stringify(verifiedToken, null, 2)}`,
      )

      if (!req.user) {
        req.user = {}
      }
      req.user.token = accessToken
      next() // Continue to the next middleware
    })
    .catch((error) => {
      authLogger.error(`Error in auth middleware: `, error)
      res.status(403).send('Failed to authenticate token')
    })

  // Define a new async function for token verification
  async function verifyTokenForCloudAccess(
    accessToken: string,
  ): Promise<JwtPayload | void> {
    try {
      // Decode the token without verification to get the header
      const decodedToken = jwt.decode(accessToken, { complete: true })
      if (!decodedToken || typeof decodedToken === 'string') {
        authLogger.warn('Invalid token structure')
        res.status(400).send('Invalid token structure')
        return
      }

      // Retrieve the RSA public key
      const kid = decodedToken.header.kid
      if (!kid) {
        res.status(400).send('No "kid" found in token header')
        return
      }
      authLogger.info(`Using kid from token: ${kid}`)

      // Attempt RS256 verification
      return getPublicKey(kid)
        .then(async (rsaPublicKey) => {
          return await verifyToken(accessToken, rsaPublicKey, true)
        })
        .catch(handleVerifyTokenError)
    } catch (error) {
      handleVerifyTokenError(error)
    }
  }

  async function handleVerifyTokenError(error: any) {
    authLogger.error(`Error in auth middleware: `, error)
    if (error.name === 'TokenExpiredError') {
      // acquire token silently
      try {
        const tokenResponse = await authProvider.acquireTokenForConsumptionMgmt(
          req,
          res,
          next,
          { scopes: [AZURE_SERVICES_ENDPOINT] },
        )
        req.session.accessTokenToCloud = tokenResponse.accessToken
        if (!req.user) {
          req.user = {}
        }
        req.user.token = accessToken
        next()
      } catch (error) {
        // res.status(401).send('Token has expired')
        authLogger.error(
          `Error acquiring token silently `,
          new Error('Failed to acquire token silently'),
        )
      }
    } else {
      res.status(403).send('Failed to authenticate token')
    }
  }
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return true
  }

  return false
}
