import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
	development: {
		client: 'mysql2',
		connection: {
			host: process.env.DB_HOST || 'localhost',
			port: parseInt(process.env.DB_PORT || '3306'),
			user: process.env.DB_USER || 'fundtran_dev',
			password: process.env.DB_PASSWORD || 'fundtran_dev',
			database: process.env.DB_NAME || 'fundtran_db_dev',
			charset: 'utf8mb4',
			timezone: 'UTC',
			pool: {
				min: 2,
				max: 10,
				acquireTimeoutMillis: 30000,
				idleTimeoutMillis: 30000,
			},
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: './migrations',
			extension: 'ts',
		},
		seeds: {
			directory: './seeds',
			extension: 'ts',
		},
		debug: process.env.KNEX_DEBUG === 'true',
	},

	test: {
		client: 'mysql2',
		connection: {
			host: process.env.TEST_DB_HOST || 'localhost',
			port: parseInt(process.env.TEST_DB_PORT || '3306'),
			user: process.env.TEST_DB_USER || 'fundtran_test',
			password: process.env.TEST_DB_PASSWORD || 'fundtran_test',
			database: process.env.TEST_DB_NAME || 'fundtran_db_test',
			charset: 'utf8mb4',
		},
		migrations: {
			directory: './migrations',
		},
		seeds: {
			directory: './seeds/test',
		},
		pool: {
			min: 1,
			max: 1, // Important for tests to run sequentially
		},
	},

	production: {
		client: 'mysql2',
		connection: {
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT || '3306'),
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
		},
		pool: {
			min: 2,
			max: 15,
			acquireTimeoutMillis: 60000,
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: './migrations',
		},
	},
};

export default config;
