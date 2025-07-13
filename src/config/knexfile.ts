
import { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'your_username',
            password: process.env.DB_PASSWORD || 'your_password',
            database: process.env.DB_NAME || 'money_transfer_dev'
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        }
    },
};

export default config;