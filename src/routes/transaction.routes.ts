import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
	listTransactionsSchema,
	exportTransactionsSchema,
} from '../validations/transaction.validation';

const router = Router();

// List all transactions (protected)
router.get(
	'/',
	authenticate,
	validate(listTransactionsSchema, 'query'),
	transactionController.listTransactions,
);

// Export transactions (protected)
router.get(
	'/export',
	authenticate,
	validate(exportTransactionsSchema, 'query'),
	transactionController.exportTransactions,
);

export default router;
