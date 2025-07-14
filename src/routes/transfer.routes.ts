import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { ravenTransferSchema } from '../validations/transfer.validation';

const router = Router();

// Create a new transfer (protected)
router.post('/', authenticate, validate(ravenTransferSchema), transferController.createTransfer);

// Get transfer details (protected)
router.get('/:transferRef', authenticate, transferController.getTransfer);

export default router;
