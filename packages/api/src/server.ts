/*
 * © 2021 Thoughtworks, Inc.
 */

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createRouter } from './api'
import { userRouter } from './users/user.router'
import { Logger, configLoader } from '@cloud-carbon-footprint/common'
import { MongoDbCacheManager } from '@cloud-carbon-footprint/app'
import swaggerDocs from './utils/swagger'
import { AppDataSource } from './data-source'
import { authRouter } from './auth/auth.router'

const serverLogger = new Logger('Server')
const port = process.env.PORT || 4000

// Establish Mongo Connection if cache method selected
if (configLoader()?.CACHE_MODE === 'MONGODB') {
  MongoDbCacheManager.createDbConnection()
}

// Enable CORS for all routes
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Create an express application
const httpApp = express()
httpApp.use(helmet())
httpApp.use(express.json())
httpApp.use(cookieParser())
httpApp.use(express.urlencoded({ extended: false }))
httpApp.use(cors(corsOptions))

// controllers(routers)
httpApp.use('/api', createRouter())
httpApp.use('/api/auth', authRouter())
httpApp.use('/api/users', userRouter)

if (process.env.NODE_ENV === 'production') {
  httpApp.set('trust proxy', 1) // trust first proxy e.g. App Service
}

// Connect to MongoDB and start the server
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

// Listen for shutdown signals
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Function to handle server shutdown
async function shutdown() {
  if (configLoader()?.CACHE_MODE === 'MONGODB') {
    await MongoDbCacheManager.mongoClient.close()
    serverLogger.info('\nMongoDB connection closed')
  }
  await AppDataSource.destroy()
  serverLogger.info('\nApp datasource has been closed')
  serverLogger.info('Cloud Carbon Footprint Server shutting down...')
  process.exit(0)
}
