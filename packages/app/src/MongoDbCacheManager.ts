/*
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment } from 'moment'
import { MongoClient, ServerApiVersion } from 'mongodb'
import {
  configLoader,
  EstimationResult,
  Logger,
} from '@cloud-carbon-footprint/common'
import CacheManager from './CacheManager'
import { EstimationRequest } from './CreateValidRequest'
import { getDatesWithinRequestTimeFrame } from './common/helpers'

export default class MongoDbCacheManager extends CacheManager {
  static mongoClient: MongoClient
  mongoDbName: string

  constructor() {
    super()
    this.mongoDbName = 'ccf'
  }

  /**
   * Creates a connection to the MongoDB client using the provided URI and any credentials.
   * If no credentials are provided, the connection will be made without SSL.
   * This function needs to be invoked before using this MongoDbCacheManager and making any requests to the MongoDB client.
   * @returns {Promise<void>} A Promise that resolves when the connection is established.
   */
  static async createDbConnection() {
    const logger = new Logger('MongoDB')
    const mongoURI = configLoader().MONGODB.URI
    const mongoCredentials = configLoader().MONGODB.CREDENTIALS

    if (mongoCredentials && mongoURI) {
      MongoDbCacheManager.mongoClient = new MongoClient(mongoURI, {
        sslKey: mongoCredentials,
        sslCert: mongoCredentials,
        serverApi: ServerApiVersion.v1,
      })
    } else if (mongoURI) {
      MongoDbCacheManager.mongoClient = new MongoClient(mongoURI)
    } else {
      logger.error(
        'There was an error connecting to the MongoDB client',
        new Error('Please provide a valid URI'),
      )
    }

    try {
      await MongoDbCacheManager.mongoClient.connect()
      logger.info('Successfully connected to the MongoDB client')
    } catch (error) {
      logger.error('There was an error connecting to the MongoDB client', error)
    }
  }

  async loadEstimates(
    db: any,
    collectionName: string,
    request: EstimationRequest,
  ): Promise<EstimationResult[]> {
    const unitOfTime =
      request.groupBy === 'week'
        ? 'isoWeek'
        : (request.groupBy as moment.unitOfTime.StartOf)
    const startDate = new Date(
      moment.utc(request.startDate).startOf(unitOfTime).toDate(),
    )
    const endDate = new Date(request.endDate)

    const filters = this.createAggregationFilters(request, startDate, endDate)
    const aggregationStages = this.createAggregationStages(request, filters)

    try {
      const collections = await db
        .listCollections({ name: collectionName })
        .toArray()

      if (collections.length > 0) {
        const estimates = db.collection(collectionName)

        // Set a reasonable timeout for the aggregation
        const maxTimeMS = 30000 // 30 seconds, adjust as needed

        const result = await estimates
          .aggregate(aggregationStages, {
            allowDiskUse: true,
            maxTimeMS: maxTimeMS,
          })
          .toArray()

        return result as EstimationResult[]
      } else {
        // The collection does not exist - so we create it
        await db.createCollection(collectionName)
        return []
      }
    } catch (error) {
      console.error('Error in loadEstimates:', error)
      throw error
    }
  }

  async getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]> {
    let savedEstimates: EstimationResult[] = []
    try {
      // Specify a database to query

      const collectionName = request.tenantId
        ? `${request.tenantId}-estimates-by-${grouping}`
        : `estimates-by-${grouping}`
      const database = MongoDbCacheManager.mongoClient.db(this.mongoDbName)

      const estimates = await this.loadEstimates(
        database,
        collectionName,
        request,
      )

      savedEstimates = estimates ?? []
    } catch (e) {
      this.cacheLogger.warn(
        `There was an error getting estimates from MongoDB: ${e.message}`,
      )
    }
    return savedEstimates
  }

  async setEstimates(
    estimates: EstimationResult[],
    grouping: string,
    tenantId?: string,
  ): Promise<void> {
    try {
      const collectionName = tenantId
        ? `${tenantId}-estimates-by-${grouping}`
        : `estimates-by-${grouping}`
      const database = MongoDbCacheManager.mongoClient.db(this.mongoDbName)
      const collection = database.collection(collectionName)

      const newEstimates: any[] = []
      estimates.forEach((estimate) => {
        estimate.serviceEstimates.forEach((serviceEstimate) => {
          const newDocument = {
            ...serviceEstimate,
            timestamp: estimate['timestamp'],
            groupBy: estimate['groupBy'],
          }
          newEstimates.push(newDocument)
        })
      })

      await collection.insertMany(newEstimates)
    } catch (e) {
      this.cacheLogger.warn(
        `There was an error setting estimates from MongoDB: ${e.message}`,
      )
    }
  }

  async getMissingDates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<Moment[]> {
    this.cacheLogger.info('Using mongo database...')
    const requestedDates = getDatesWithinRequestTimeFrame(grouping, request)

    if (request.ignoreCache) {
      return requestedDates
    }

    try {
      const collectionName = request.tenantId
        ? `${request.tenantId}-estimates-by-${grouping}`
        : `estimates-by-${grouping}`
      const database = MongoDbCacheManager.mongoClient.db(this.mongoDbName)

      const aggResult: any = await new Promise((resolve, reject) => {
        database
          .listCollections({ name: collectionName })
          .next()
          .then(async (collectionInfo: any) => {
            if (!collectionInfo) {
              resolve([{ dates: [] }])
              return
            }

            const estimates = database.collection(collectionName)
            const count = await estimates.countDocuments()
            if (count === 0) {
              resolve([{ dates: [] }])
              return
            }

            let addToSet: unknown = {
              $dateToString: {
                date: '$timestamp',
                format: '%Y-%m-%d',
              },
            }

            if (request.cloudProviderToSeed) {
              addToSet = {
                $cond: {
                  if: {
                    $eq: ['$cloudProvider', request.cloudProviderToSeed],
                  },
                  then: '$timestamp',
                  else: '$$REMOVE',
                },
              }
            }

            const result = await estimates
              .aggregate(
                [
                  {
                    $group: {
                      _id: null,
                      dates: {
                        $addToSet: addToSet,
                      },
                    },
                  },
                ],
                { allowDiskUse: true },
              )
              .toArray()

            resolve(result)
          })
          .catch(reject)
      })

      const cachedDates = aggResult[0].dates
      const missingDates = requestedDates.filter((a) => {
        const index = cachedDates.findIndex((cachedDate: string) =>
          moment.utc(cachedDate).isSame(a),
        )
        return index < 0
      })

      return missingDates.map((date: Moment) => {
        return date
      })
    } catch (e) {
      this.cacheLogger.warn(
        `There was an error getting missing dates from MongoDB: ${e.message}`,
      )
      return []
    }
  }
  private createAggregationFilters(
    request: EstimationRequest,
    startDate: Date,
    endDate: Date,
  ) {
    const { cloudProviders, accounts, services, regions, tags } = request
    const filterTable = {
      cloudProvider: cloudProviders,
      accountId: accounts,
      serviceName: services,
      region: regions,
    }
    let aggregationFilters = {
      timestamp: { $gte: startDate, $lte: endDate },
    }

    for (const [key, value] of Object.entries(filterTable)) {
      if (value && value.length > 0) {
        aggregationFilters = {
          [key]: { $in: value },
          ...aggregationFilters,
        }
      }
    }

    if (tags && Object.entries(tags)[0])
      for (const [key, value] of Object.entries(tags)) {
        aggregationFilters = {
          [`tags.${key}`]: { $eq: value },
          ...aggregationFilters,
        }
      }

    return aggregationFilters
  }

  private createAggregationStages(
    request: EstimationRequest,
    filters: unknown,
  ) {
    // Init with pre-query stages
    const aggregationStages: unknown[] = [
      {
        $match: filters,
      },
    ]

    // Optionally build pagination stage
    if (!isNaN(request.skip)) aggregationStages.push({ $skip: request.skip })

    if (request.skip || request.limit) {
      const skip = request.skip || 0
      const limitMsg = request.skip + request.limit || request.limit || 'end'
      this.cacheLogger.info(`Paginating documents: ${skip} to ${limitMsg}`)
    }

    // Add remaining post-query stages
    aggregationStages.push(
      {
        $limit: isNaN(request.limit) ? 50000 : request.limit,
      },
      {
        $sort: {
          timestamp: 1,
          _id: 1,
        },
      },
      {
        $group: {
          _id: '$timestamp',
          timestamp: { $first: '$timestamp' },
          serviceEstimates: { $push: '$$ROOT' },
          groupBy: { $first: '$groupBy' },
        },
      },
      {
        $unset: [
          '_id',
          'serviceEstimates._id',
          'serviceEstimates.timestamp',
          'serviceEstimates.groupBy',
        ],
      },
    )

    return aggregationStages
  }
}
