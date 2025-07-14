import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { webhookSchema } from '../validations/account.validation';

const router = Router();

// Generate new bank account (protected)
// router.post('/', authenticate, validate(generateAccountSchema), accountController.generateAccount);
router.post('/', authenticate, accountController.generateAccount);

// Webhook for bank transfer notifications (public)
router.post('/webhook', validate(webhookSchema), accountController.handleWebhook);

// Get account details (protected)
router.get('/:accountNumber', authenticate, accountController.getAccount);

// Get all accounts for user (protected)
router.get('/', authenticate, accountController.getAllAccounts);

export default router;
