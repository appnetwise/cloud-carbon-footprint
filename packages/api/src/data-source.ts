import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { configLoader } from '@cloud-carbon-footprint/common'

import * as dotenv from 'dotenv'

dotenv.config()

const { NODE_ENV } = process.env
export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: configLoader()?.MONGODB.URI,
  database: configLoader()?.MONGODB.DATABASE,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: NODE_ENV === 'dev' ? false : false,
  logging: NODE_ENV === 'dev' ? false : false,
  entities: ['src/**/*.entity{.ts,.js}'],
  // migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
})
