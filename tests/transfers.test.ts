import request from 'supertest';
import app from '../src/app';
import db from '../src/config/database';

describe('Transfer API', () => {
  let authToken: string;
  let testAccountId: string;

  beforeAll(async () => {
    // Setup test data
    await db.seed.run();
    
    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@fintech.com',
        password: 'test123'
      });
    authToken = res.body.data.token;
  });

  test('Create account transfer', async () => {
    const response = await request(app)
      .post('/api/transfers/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        sender_account_id: 'acct_123',
        recipient_account_id: 'acct_456',
        amount: 1000,
        currency: 'NGN'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('reference');
    expect(response.body.data.amount).toBe(1000);
  });

  afterAll(async () => {
    await db.destroy();
  });
});