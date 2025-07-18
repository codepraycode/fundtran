import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes from './routes/auth.routes';
import accountRoute from './routes/account.routes';
import transferRoutes from './routes/transfer.routes';
import transactionRoutes from './routes/transaction.routes';
import healthRoutes from './routes/health.routes';
import webhookRoutes from './routes/webhook.routes';
import { initRavenAtlasClient } from './lib/ravenAtlas/ravenAtlas.client';

const app: Application = express();

initRavenAtlasClient({
	apiKey: process.env.RAVEN_ATLAS_API_KEY!,
	baseURL: process.env.RAVEN_ATLAS_BASE_URL,
	timeout: 15000,
	maxRetries: 3,
});

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoute);
app.use('/api/transfers', transferRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
