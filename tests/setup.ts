import db from '../src/config/test-database';

beforeEach(async () => {
	await db.migrate.rollback();
	await db.migrate.latest();
	await db.seed.run();
});

afterAll(async () => {
	await db.destroy();
});
