/*
 * © 2021 Thoughtworks, Inc.
 */

import express from 'express'

import { Logger } from '@cloud-carbon-footprint/common'

const authLogger = new Logger('auth')

export default async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): Promise<void> {
  try {
    if(!req.headers.authorization) {
      throw new Error('Authorization header is required.');
    }
    const token = req.headers.authorization.split(' ')[1];
    authLogger.info('Authentication token received')
    // authLogger.info('Authentication successful')
    next()
  } catch (e) {
    authLogger.error(`Authentication failed. Error: ${e.message}`, e)
    res.status(401).send('Unauthorized')
  }
}
