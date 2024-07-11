/*
 * © 2021 Thoughtworks, Inc.
 */

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register')
}

import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'
import { createRouter } from './api'
import { userRouter } from './users/user.router'
import { Logger, configLoader } from '@cloud-carbon-footprint/common'
import { MongoDbCacheManager } from '@cloud-carbon-footprint/app'
import swaggerDocs from './utils/swagger'
import { AppDataSource } from './data-source'
import { authRouter } from './auth/auth.router'
import { SESSION_COOKIE_NAME, REDIRECT_URI } from './authConfig'
import session from 'express-session'

const port = process.env.PORT || 4000
const csrf = require('lusca').csrf
const httpApp = express()
httpApp.use(helmet())
httpApp.use(express.json())
httpApp.use(cookieParser())
httpApp.use(express.urlencoded({ extended: false }))
// httpApp.use(express.static(path.join(__dirname, 'client/build')));

const serverLogger = new Logger('Server')

const sessionConfig = {
  name: SESSION_COOKIE_NAME,
  secret: process.env.SESSION_COOKIE_SECRET, // replace with your own secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'strict',
    httpOnly: true,
    secure: false, // set this to true on production
    maxAge: 30 * 60 * 1000, // Session expires after 30 minutes of inactivity
    rolling: true // Resets maxAge on every response
  },
}

if (process.env.NODE_ENV === 'production') {
  httpApp.set('trust proxy', 1) // trust first proxy e.g. App Service
  sessionConfig.cookie.secure = true // serve secure cookies on production
  // httpApp.use(auth)
}

httpApp.use(session(sessionConfig))
httpApp.use(
  csrf({
    blocklist: [new URL(REDIRECT_URI).pathname],
  }),
)

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
httpApp.use('/api/auth', authRouter())
httpApp.use('/api/users', userRouter)
// httpApp.use('/api/connect', connectRouter)

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
