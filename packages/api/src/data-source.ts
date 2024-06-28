import 'reflect-metadata'
import { DataSource } from 'typeorm'

import * as dotenv from 'dotenv'

dotenv.config()

const { MONGODB_URI, MONGODB_DATABASE, NODE_ENV } = process.env

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: MONGODB_URI,
  database: MONGODB_DATABASE,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: NODE_ENV === 'dev' ? false : false,
  logging: NODE_ENV === 'dev' ? false : false,
  entities: ['src/**/*.entity{.ts,.js}'],
  // migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
})
