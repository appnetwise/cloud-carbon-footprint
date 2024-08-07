/*
 * © 2021 Thoughtworks, Inc.
 */
import { Logger } from '@cloud-carbon-footprint/common'
import jwt from 'jsonwebtoken'

const authLogger = new Logger('keycloak-auth')

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    authLogger.warn(`Authorization header is required`)
    res.status(401).send('Authorization header is required.')
    return
  }
  authLogger.info('Verifying Authentication token received')
  const accessToken = authHeader.split(' ')[1]

  // Decode the token without verification to get the header
  const decodedToken: any = jwt.decode(accessToken, { complete: true })
  if (!decodedToken || typeof decodedToken === 'string') {
    authLogger.warn('Invalid token structure')
    throw new Error('Invalid token structure')
  }

  authLogger.info('Token verified successfully!')
  authLogger.info(
    `Verified token payload: ${JSON.stringify(decodedToken, null, 2)}`,
  )

  if (!req.user) {
    req.user = {}
  }
  req.user.externalId = decodedToken.payload?.sub
  next() // Continue to the next middleware
}
