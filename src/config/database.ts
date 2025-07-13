
import knex, { Knex } from 'knex';
import config from './knexfile';

const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment as keyof typeof config];
if (!environmentConfig) {
  throw new Error(`Database configuration for environment '${environment}' is missing.`);
}
const connection: Knex = knex(environmentConfig);

export default connection;