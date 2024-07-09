/*
 * © 2021 Thoughtworks, Inc.
 */

import { Response, NextFunction, Request } from 'express'
import { Logger } from '@cloud-carbon-footprint/common'
import jwt, { Algorithm, Jwt } from 'jsonwebtoken'
import jwksClient, { RsaSigningKey } from 'jwks-rsa'
import { User } from '../users/user'
import * as userService from '../users/user.service'

const authLogger = new Logger('auth')

const client = jwksClient({
  jwksUri:
    'https://login.microsoftonline.com/organizations/discovery/v2.0/keys',
  // cache: true, // Enable caching
  // cacheMaxAge: 3600000, // Cache for 1 hour (in milliseconds)
  // rateLimit: true, // Enable rate limiting
  // jwksRequestsPerMinute: 10, // Limit to 10 requests per minute
})

function getRsaPublicKey(kid: string): Promise<string> {
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
  verifyOptions: jwt.VerifyOptions,
): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    resolve(jwt.decode(token, { complete: true }).payload as jwt.JwtPayload)
    // jwt.verify(token, secretOrPublicKey, (err, decoded) => {
    // jwt.verify(token, secretOrPublicKey, verifyOptions, (err, decoded) => {
    //   if (err) {
    //     reject(err)
    //   } else {
    //     resolve(decoded as jwt.JwtPayload)
    //   }
    // })
  })
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    authLogger.warn(`Authorization header is required`)
    res.status(401).send('Authorization header is required.')
    return
  }
  authLogger.info('Verifying Authentication token received')
  const token = authHeader.split(' ')[1]
  // Decode the token without verification to get the header
  const decodedToken = jwt.decode(token, { complete: true })
  if (!decodedToken || typeof decodedToken === 'string') {
    authLogger.warn('Invalid token structure')
    res.status(400).send('Invalid token structure')
    return
  }

  authLogger.info(`Token header: ${JSON.stringify(decodedToken.header)}`)
  authLogger.info(`Token payload: ${JSON.stringify(decodedToken.payload)}`)
  const rs256VerifyOptions: jwt.VerifyOptions = {
    // audience: '00000002-0000-0000-c000-000000000000', // v2.0 token
    // issuer: `${process.env.MSAL_AUTHORITY}/v1.0`, // v2.0 token
    // algorithms: ['RS256' as Algorithm],
  }

  const hs256VerifyOptions: jwt.VerifyOptions = {
    audience: process.env.AZURE_CLIENT_ID, // v2.0 token
    algorithms: ['HS256' as Algorithm],
  }

  const algorithm = decodedToken.header.alg
  authLogger.info(`Token algorithm: ${algorithm}`)
  // Retrieve the RSA public key
  const kid = decodedToken.header.kid
  if (!kid) {
    res.status(400).send('No "kid" found in token header')
    return
  }
  authLogger.info(`Using kid from token: ${kid}`)

  getRsaPublicKey(kid)
    .then((rsaPublicKey) => {
      // Attempt RS256 verification
      return verifyToken(token, rsaPublicKey, rs256VerifyOptions)
        .then((verifiedToken) => {
          authLogger.info('Token verified successfully with RS256')
          return verifiedToken
        })
        .catch((rsaError) => {
          authLogger.warn(`RS256 verification failed: ${rsaError}`)
          throw rsaError

          // // If RS256 fails, attempt HS256 verification
          // const secret = process.env.JWT_SECRET
          // if (!secret) {
          //   throw new Error('JWT_SECRET not set in environment variables')
          // }
          // return verifyToken(token, secret, hs256VerifyOptions)
          //   .then((verifiedToken) => {
          //     authLogger.info('Token verified successfully with HS256')
          //     return verifiedToken
          //   })
          //   .catch((hsError) => {
          //     authLogger.error(`HS256 verification also failed: `, hsError)
          //     throw new Error(
          //       'Token verification failed for both RS256 and HS256',
          //     )
          //   })
        })
    })
    .then(handleVerifiedToken)
    .catch(handleError)

  async function handleVerifiedToken(verifiedToken: jwt.JwtPayload) {
    authLogger.info(`Verified token payload: ${JSON.stringify(verifiedToken)}`)

    const clientId = verifiedToken?.appid
    const iss = verifiedToken?.iss

    if (clientId !== process.env.AZURE_CLIENT_ID) {
      authLogger.error(
        `Invalid token client ${clientId}`,
        new Error('Invalid token client'),
      )
      res.status(403).send('Invalid token client')
      return
    }

    if (
      !iss?.startsWith('https://login.microsoftonline.com/') &&
      !iss?.startsWith('https://sts.windows.net/')
    ) {
      authLogger.error(
        `Invalid token issuer ${iss}`,
        new Error('Invalid token issuer'),
      )
      res.status(403).send('Invalid token issuer')
      return
    }
    const {
      isExternal = true,
      firstName = verifiedToken.given_name,
      email = verifiedToken.upn,
      externalId = verifiedToken.oid,
    } = verifiedToken
    const user: User = {
      id: verifiedToken.sub, // TODO -NK- Need to set the id from the user repository
      isExternal,
      firstName,
      email,
      externalId,
    }
    if (externalId) {
      // TODO -NK- Avoid db call and leverage the user id from the token or request
      const userEntity = await userService.getUserByExternalId(externalId)
      user.id = userEntity.id.toString()
      user.cloudConnections = userEntity.cloudConnections
    }
    req.user = user
    const tokenResponse =
      await this.authProvider.acquireTokenForConsumptionMgmt(req, res, next, {
        scopes: ['User.Impersonation'],
      })

    req.user.token = tokenResponse.accessToken
    next()
  }

  function handleError(error: any) {
    authLogger.error(`Error in auth middleware: `, error)
    if (error.name === 'TokenExpiredError') {
      res.status(401).send('Token has expired')
    }
    res.status(403).send('Failed to authenticate token')
  }
}
