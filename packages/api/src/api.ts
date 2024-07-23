/*
 * © 2021 Thoughtworks, Inc.
 */

import express from 'express'
import { setConfig, CCFConfig } from '@cloud-carbon-footprint/common'
import {
  FootprintApiMiddleware,
  EmissionsApiMiddleware,
  RecommendationsApiMiddleware,
  ProfileDataApiMiddleware,
} from './middleware'
import { authSession, cloudAccessTokenValidator } from './utils/auth'

export const createRouter = (config?: CCFConfig) => {
  setConfig(config)

  /**
   * @openapi
   * components:
   *   securitySchemes:
   *     bearerAuth:
   *       type: http
   *       scheme: bearer
   *       bearerFormat: JWT
   */
  const router = express.Router()

  /**
   * @openapi
   * /api/footprint:
   *  get:
   *     tags:
   *     - Footprint
   *     summary: Gets calculated energy and carbon estimates
   *     description: Gets calculated energy and carbon estimates for a given date range
   *     security:
   *     - bearerAuth: []
   *     produces:
   *       - application/json
   *     parameters:
   *      - name: start
   *        in: query
   *        description: The start date for the footprint; e.g. 2022-10-18
   *        schema:
   *          type: string
   *        required: true
   *      - name: end
   *        in: query
   *        schema:
   *          type: string
   *        description: The end date for the footprint
   *        required: true
   *      - name: ignoreCache
   *        in: query
   *        schema:
   *          type: boolean
   *          default: false
   *        required: false
   *      - name: groupBy
   *        in: query
   *        schema:
   *          type: string
   *          default: day
   *        required: false
   *      - name: limit
   *        in: query
   *        schema:
   *          type: number
   *          default: 50000
   *        description: The maximum number of estimates to return (MongoDB only, ignoreCache=false)
   *        required: false
   *      - name: skip
   *        in: query
   *        schema:
   *          type: number
   *          default: 0
   *        description: The maximum number of estimates to skip over (MongoDB only, ignoreCache=false)
   *        required: false
   *      - name: cloudProviders
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        description: List of Cloud Providers to include in estimates (MongoDB only, Filter)
   *        required: false
   *      - name: accounts
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        description: List of accounts to include in estimates (MongoDB only, Filter)
   *        required: false
   *      - name: services
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        description: List of services to include in estimates (MongoDB only, Filter)
   *        required: false
   *      - name: regions
   *        in: query
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        description: List of regions to include in estimates (MongoDB only, Filter)
   *        required: false
   *      - name: tags
   *        in: query
   *        schema:
   *          type: object
   *          additionalProperties:
   *            type: string
   *        description: List of resource tags to include in estimates (MongoDB only, Filter)
   *        required: false
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/FootprintResponse'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       416:
   *         description: Partial Data Error
   *       500:
   *         description: Internal Server Error
   */
  router.get('/footprint', cloudAccessTokenValidator, FootprintApiMiddleware)

  /**
   * @openapi
   * /api/regions/emissions-factors:
   *  get:
   *     security:
   *     - bearerAuth: []
   *     tags:
   *     - Emissions Factors
   *     summary: Gets the carbon intensity (co2e/kWh)
   *     description: Gets the carbon intensity (co2e/kWh) of all cloud provider regions
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/EmissionResponse'
   *       401:
   *         description: Unauthorized
   */
  router.get(
    '/regions/emissions-factors',
    cloudAccessTokenValidator,
    EmissionsApiMiddleware,
  )

  /**
   * @openapi
   * /api/recommendations:
   *  get:
   *     security:
   *     - bearerAuth: []
   *     tags:
   *     - Recommendations
   *     summary: Gets recommendations from cloud providers
   *     description: Gets recommendations from cloud providers and their estimated carbon and energy impact
   *     produces:
   *       - application/json
   *     parameters:
   *      - name: awsRecommendationTarget
   *        in: query
   *        description: Defines whether targeted AWS recommendations should be within the same family
   *        schema:
   *          type: string
   *          enum: [SAME_INSTANCE_FAMILY, CROSS_INSTANCE_FAMILY]
   *        required: true
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/RecommendationsResponse'
   *       401:
   *         description: Unauthorized
   */
  router.get(
    '/recommendations',
    cloudAccessTokenValidator,
    RecommendationsApiMiddleware,
  )

  /**
   * @openapi
   * /api/healthz:
   *  get:
   *     tags:
   *     - Healthcheck
   *     summary: Responds if the app is up and running
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: Responds "OK" if app is up and running
   */
  router.get('/healthz', (req: express.Request, res: express.Response) => {
    res.status(200).send('OK')
  })

  /**
   * @openapi
   * /api/profile:
   *
   *  get:
   *     tags: [Profile]
   *     summary: Return the user profile data
   *     description: Return the user profile data
   *     security:
   *     - bearerAuth: []
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *              type: object
   *              items:
   *                $ref: '#/components/schemas/ProfileResponse'
   *       401:
   *         description: Unauthorized
   *       500:
   *        description: Internal Server Error
   */
  router.get('/profile', authSession, ProfileDataApiMiddleware)

  return router
}
