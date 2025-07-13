
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {errorHandler} from './src/middlewares/error.middleware';

import authRoutes from './src/routes/auth.routes';
import accountRoute from './src/routes/account.routes';
import transferRoutes from './src/routes/transfer.routes';
import transactionRoutes from './src/routes/transaction.routes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoute);
// app.use('/api/transfers', transferRoutes);
// app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;