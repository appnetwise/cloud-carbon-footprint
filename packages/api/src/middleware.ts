/*
 * © 2023 Thoughtworks, Inc.
 */

import express, { raw } from 'express'

import {
  App,
  createValidFootprintRequest,
  createValidRecommendationsRequest,
  FootprintEstimatesRawRequest,
  RecommendationsRawRequest,
  Tags,
} from '@cloud-carbon-footprint/app'

import {
  EstimationRequestValidationError,
  Logger,
  PartialDataError,
  RecommendationsRequestValidationError,
} from '@cloud-carbon-footprint/common'
import getGraphClient from './utils/graphClient'

const jwt = require('jsonwebtoken')
const apiLogger = new Logger('api')
const X_TENANT_ID = 'x-tenant-id'

/**
 * Handles the fetching and calculations of cloud footprint estimates for a given date range.
 *
 * @async
 * @param {express.Request} req - The Express request object containing the request parameters.
 * @returns A response object with the calculated raw footprint estimates.
 */
export const FootprintApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  // Set the request time out to 10 minutes to allow the request enough time to complete.
  req.socket.setTimeout(1000 * 60 * 10)
  const token = req.headers.authorization?.split(' ')[1];
  const rawRequest: FootprintEstimatesRawRequest = {
    startDate: req.query.start?.toString(),
    endDate: req.query.end?.toString(),
    ignoreCache: req.query.ignoreCache?.toString(),
    groupBy: req.query.groupBy?.toString(),
    limit: req.query.limit?.toString(),
    skip: req.query.skip?.toString(),
    cloudProviders: req.query.cloudProviders as string[],
    accounts: req.query.accounts as string[],
    services: req.query.services as string[],
    regions: req.query.regions as string[],
    tags: req.query.tags as Tags,
    tenantId: req.headers[X_TENANT_ID]?.toString(),
    accessToken: token   
  }
  if(token && !rawRequest.tenantId) {
    rawRequest.tenantId = jwt.decode(token).tid;
  }

  apiLogger.info(`Footprint API request started.`)
  if (!rawRequest.groupBy) {
    apiLogger.warn('GroupBy parameter not specified, adopting default "day"')
    rawRequest.groupBy = 'day'
  }
  const footprintApp = new App()
  try {
    const estimationRequest = createValidFootprintRequest(rawRequest)
    const estimationResults = await footprintApp.getCostAndEstimates(
      estimationRequest,
    )
    res.json(estimationResults)
  } catch (e) {
    apiLogger.error(`Unable to process footprint request.`, e)
    if (
      e.constructor.name ===
      EstimationRequestValidationError.prototype.constructor.name
    ) {
      res.status(400).send(e.message)
    } else if (
      e.constructor.name === PartialDataError.prototype.constructor.name
    ) {
      res.status(416).send(e.message)
    } else res.status(500).send('Internal Server Error')
  }
}

/**
 * Handles the fetching of emissions factors for all regions.
 *
 * @async
 * @returns A response object with the mapped emissions factors for each supported cloud provider region.
 */
export const EmissionsApiMiddleware = async function (
  _req: express.Request,
  res: express.Response,
): Promise<void> {
  apiLogger.info(`Regions emissions factors API request started`)
  const footprintApp = new App()
  try {
    const emissionsResults = await footprintApp.getEmissionsFactors()
    res.json(emissionsResults)
  } catch (e) {
    apiLogger.error(`Unable to process regions emissions factors request.`, e)
    res.status(500).send('Internal Server Error')
  }
}

/**
 * Handles the fetching of cost saving recommendations along with their calculated carbon and energy savings.
 *
 * @async
 * @param {express.Request} req - The Express request object containing the request parameters.
 * @returns A response object with the fetched recommendations and their calculated carbon and energy savings.
 */
export const RecommendationsApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const rawRequest: RecommendationsRawRequest = {
    awsRecommendationTarget: req.query.awsRecommendationTarget?.toString(),
    tenantId: req.headers[X_TENANT_ID]?.toString()
  }
  
  const token = req.headers.authorization?.split(' ')[1];
  if(token && !rawRequest.tenantId) {
    rawRequest.tenantId = jwt.decode(token).tid;
  }

  apiLogger.info(`Recommendations API request started`)
  const footprintApp = new App()
  try {
    const estimationRequest = createValidRecommendationsRequest(rawRequest)
    const recommendations = await footprintApp.getRecommendations(
      estimationRequest,
    )
    res.json(recommendations)
  } catch (e) {
    apiLogger.error(`Unable to process recommendations request.`, e)
    if (
      e.constructor.name ===
      RecommendationsRequestValidationError.prototype.constructor.name
    ) {
      res.status(400).send(e.message)
    } else {
      res.status(500).send('Internal Server Error')
    }
  }
}

export const ProfileDataApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  apiLogger.info(`Profile API request started`)

  try {
    const accessToken = req.headers.authorization.split(' ')[1]
    const graphData = await getGraphClient(accessToken)
      .api('/me')
      // .responseType('json')
      .get()
    res.json(graphData)
  } catch (e) {
    apiLogger.error(`Unable to process profile data request.`, e)
    res.status(500).send('Internal Server Error')
  }
}
