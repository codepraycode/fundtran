import knex from 'knex';
import config from './knexfile';

const testConfig = {
	...config.test,
	connection: {
		...(config.test?.connection || ({} as any)),
		database: 'money_transfer_test',
	},
};

export default knex(testConfig);
