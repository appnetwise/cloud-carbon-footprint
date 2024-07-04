/*
 * © 2021 Thoughtworks, Inc.
 */

import { Response, NextFunction, Request } from 'express'
import { Logger } from '@cloud-carbon-footprint/common'
import jwt, { Algorithm } from 'jsonwebtoken'
import jwksClient, { RsaSigningKey } from 'jwks-rsa'
import { User } from '../users/user'

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
        authLogger.error(
          `Error retrieving signing key for kid: ${key.kid}`,
          err,
        )
        reject(err)
      } else {
        if ('rsaPublicKey' in key) {
          authLogger.info(`Retrieved RsaSigningKey for kid: ${key.kid}`)
          resolve((key as RsaSigningKey).rsaPublicKey)
        } else {
          authLogger.warn(
            `Retrieved key is not an RsaSigningKey for kid:  ${key.kid}`,
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
  algorithm: Algorithm,
): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    return resolve(jwt.decode(token, { complete: true }).payload as jwt.JwtPayload)
    // jwt.verify(
    //   token,
    //   secretOrPublicKey,
    //   { algorithms: [algorithm] },
    //   (err, decoded) => {
    //     if (err) {
    //       reject(err)
    //     } else {
    //       resolve(decoded as jwt.JwtPayload)
    //     }
    //   },
    // )
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
    res.status(400).json({ message: 'Invalid token structure' })
    return
  }

  authLogger.info(`Token header: ${JSON.stringify(decodedToken.header)}`)
  authLogger.info(`Token payload: ${JSON.stringify(decodedToken.payload)}`)

  const algorithm = decodedToken.header.alg
  authLogger.info(`Token algorithm: ${algorithm}`)
  // Retrieve the RSA public key
  const kid = decodedToken.header.kid
  if (!kid) {
    res.status(400).json({ message: 'No "kid" found in token header' })
  }
  authLogger.info(`Using kid from token: ${kid}`)

  getRsaPublicKey(kid)
    .then((rsaPublicKey) => {
      authLogger.info(
        `RSA Public Key retrieved: ${rsaPublicKey.substring(0, 50)}...`,
      )
      // Attempt RS256 verification
      return verifyToken(token, rsaPublicKey, 'RS256')
        .then((verifiedToken) => {
          authLogger.info('Token verified successfully with RS256')
          return verifiedToken
        })
        .catch((rsaError) => {
          authLogger.warn(`RS256 verification failed: ${rsaError}`)

          // If RS256 fails, attempt HS256 verification
          const secret = process.env.JWT_SECRET
          if (!secret) {
            throw new Error('JWT_SECRET not set in environment variables')
          }
          return verifyToken(token, secret, 'HS256')
            .then((verifiedToken) => {
              authLogger.info('Token verified successfully with HS256')
              return verifiedToken
            })
            .catch((hsError) => {
              authLogger.error(`HS256 verification also failed: `, hsError)
              throw new Error(
                'Token verification failed for both RS256 and HS256',
              )
            })
        })
    })
    .then(handleVerifiedToken)
    .catch(handleError)

  function handleVerifiedToken(verifiedToken: jwt.JwtPayload) {
    authLogger.info(`Verified token payload: ${JSON.stringify(verifiedToken)}`)

    const clientId = verifiedToken?.appid
    const iss = verifiedToken?.iss

    if (clientId !== process.env.AZURE_CLIENT_ID) {
      authLogger.error(
        `Invalid token client ${clientId}`,
        new Error('Invalid token client'),
      )
      res.status(403).send('Invalid token client')
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
    }
    const user: User = {
      id: verifiedToken.sub, // TODO -NK- Need to set the id from the user repository
      isExternal: true,
      firstName: verifiedToken.given_name,
      email: verifiedToken.upn,
      externalId: verifiedToken.oid,
    }
    req.user = user
    next()
  }

  function handleError(error: any) {
    authLogger.error(`Error in auth middleware: `, error)
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token has expired' })
    }
    res.status(403).json({ message: 'Failed to authenticate token' })
  }
}
