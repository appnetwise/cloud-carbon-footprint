/*
 * © 2021 Thoughtworks, Inc.
 */

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

import express from 'express'
import helmet from 'helmet'
import cors, { CorsOptions } from 'cors'

import { createRouter } from './api'
import { userRouter } from './users/user.router'
import { Logger, configLoader } from '@cloud-carbon-footprint/common'
import { MongoDbCacheManager } from '@cloud-carbon-footprint/app'
import swaggerDocs from './utils/swagger'
import { AppDataSource } from './data-source'
import bodyParser from 'body-parser';

const port = process.env.PORT || 4000
const httpApp = express()
httpApp.use(express.json())

const serverLogger = new Logger('Server')

if (process.env.NODE_ENV === 'production') {
  // httpApp.use(auth)
}
httpApp.use(bodyParser.json());
httpApp.use(helmet())

// Enable CORS for all routes
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}
httpApp.use(cors(corsOptions))

// Establish Mongo Connection if cache method selected
if (configLoader()?.CACHE_MODE === 'MONGODB') {
  MongoDbCacheManager.createDbConnection()
}

if (process.env.ENABLE_CORS) {
  const corsOptions: CorsOptions = {
    optionsSuccessStatus: 200,
  }

  if (process.env.CORS_ALLOW_ORIGIN) {
    serverLogger.info(
      'Allowing CORS requests from origin(s) ' + process.env.CORS_ALLOW_ORIGIN,
    )
    corsOptions.origin = process.env.CORS_ALLOW_ORIGIN.split(',')
  }

  httpApp.use(cors(corsOptions))
}

// controllers(routers)
httpApp.use('/api', createRouter())
httpApp.use('/api/users', userRouter)

// Connect to MongoDB
AppDataSource.initialize()
  .then(async () => {
    httpApp.listen(port, () => {
      serverLogger.info(
        `Cloud Carbon Footprint Server listening at http://localhost:${port}`,
      )
      swaggerDocs(httpApp, Number(port))
    })
    serverLogger.info('App Data Source has been initialized!')
  })
  .catch((error) => serverLogger.error('Server could not be started', error))

// Instructions for graceful shutdown
process.on('SIGINT', async () => {
  if (configLoader()?.CACHE_MODE === 'MONGODB') {
    await MongoDbCacheManager.mongoClient.close()
    serverLogger.info('\nMongoDB connection closed')
  }
  await AppDataSource.destroy()
  serverLogger.info('\nApp datasource has been closed')
  serverLogger.info('Cloud Carbon Footprint Server shutting down...')
  process.exit()
})
