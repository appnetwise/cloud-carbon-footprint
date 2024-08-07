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
import { SESSION_COOKIE_NAME, SESSION_COLLECTION_NAME } from './authConfig'
import session from 'express-session'
import connectMongoDBSession from 'connect-mongodb-session'

const serverLogger = new Logger('Server')
const port = process.env.PORT || 4000
const MongoDBStore = connectMongoDBSession(session)
const mongoOptions = {
  uri: process.env.MONGODB_URI,
  databaseName: process.env.MONGODB_DATABASE,
  collection: SESSION_COLLECTION_NAME,
}
const mongoStore = new MongoDBStore(mongoOptions)

// initialize the mongo store and log errors, if any
mongoStore.on('error', function (error) {
  serverLogger.error(`error connecting to mongo store ${mongoOptions}`, error)
})

// Establish Mongo Connection if cache method selected
if (configLoader()?.CACHE_MODE === 'MONGODB') {
  MongoDbCacheManager.createDbConnection()
}

const isProd = process.env.NODE_ENV === 'production'
const sessionConfig = {
  name: SESSION_COOKIE_NAME,
  secret: process.env.SESSION_COOKIE_SECRET, // replace with your own secret
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    sameSite: isProd ? 'none' : 'Strict',
    httpOnly: true,
    secure: isProd, // set this to true on production
    maxAge: 30 * 60 * 1000, // Session expires after 30 minutes of inactivity
  },
  store: mongoStore,
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
httpApp.use(session(sessionConfig))
// httpApp.use(
//   csrf({
//     blocklist: [
//       new URL(REDIRECT_URI).pathname,
//       new URL(REDIRECT_CONNECT_URI).pathname,
//     ],
//   }),
// )
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
