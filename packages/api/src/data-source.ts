import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Logger, configLoader } from '@cloud-carbon-footprint/common'

const serverLogger = new Logger('Data Source')
serverLogger.info(`Mongo URI: ${configLoader()?.MONGODB.URI}`)
serverLogger.info(`Mongo Database: ${configLoader()?.MONGODB.DATABASE}`)
export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: configLoader()?.MONGODB.URI,
  database: configLoader()?.MONGODB.DATABASE,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: false,
  logging: false,
  entities: ['src/**/*.entity{.ts,.js}'],
  // migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
})
