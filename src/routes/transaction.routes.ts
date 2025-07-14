import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  getTransactionSchema,
  listTransactionsSchema,
  exportTransactionsSchema
} from '../validations/transaction.validation';

const router = Router();

// Get transaction details (protected)
router.get(
  '/:transactionId',
  authenticate,
  validate(getTransactionSchema, 'params'),
  transactionController.getTransaction
);

// List all transactions (protected)
router.get(
  '/',
  authenticate,
  validate(listTransactionsSchema, 'query'),
  transactionController.listTransactions
);

// Export transactions (protected)
router.get(
  '/export',
  authenticate,
  validate(exportTransactionsSchema, 'query'),
  transactionController.exportTransactions
);

// Get transaction summary (protected)
router.get(
  '/summary',
  authenticate,
  transactionController.getTransactionSummary
);

export default router;