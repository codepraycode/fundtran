import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createTransferSchema,
  getTransferSchema,
  accountTransferSchema,
  bankTransferSchema,
  bulkTransferSchema
} from '../validations/transfer.validation';

const router = Router();

// Create a new transfer (protected)
router.post(
  '/',
  authenticate,
  validate(createTransferSchema),
  transferController.createTransfer
);

// Get transfer details (protected)
router.get(
  '/:transferId',
  authenticate,
  validate(getTransferSchema),
  transferController.getTransfer
);

// Account-to-account transfer (protected)
router.post(
  '/account',
  authenticate,
  validate(accountTransferSchema),
  transferController.accountTransfer
);

// Bank transfer (protected) - Uses Raven API
router.post(
  '/bank',
  authenticate,
  validate(bankTransferSchema),
  transferController.bankTransfer
);

// Bulk transfers (protected)
router.post(
  '/bulk',
  authenticate,
  validate(bulkTransferSchema),
  transferController.bulkTransfer
);

// Get all transfers for user (protected)
router.get(
  '/',
  authenticate,
  transferController.getUserTransfers
);

export default router;