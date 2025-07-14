import request from 'supertest';
import app from '../src/app';
import db from '../src/config/database';

describe('Server health', () => {
	test('Teset server health', async () => {
		const response = await request(app).get('/api/health');

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('status');
		expect(response.body).toHaveProperty('database');
		expect(response.body).toHaveProperty('system');
		expect(response.body).toHaveProperty('timestamp');
	});

	afterAll(async () => {
		await db.destroy();
	});
});
