import { Router } from 'express';
import WebhookController from '../controllers/webhook.controller';

const router = Router();

router.post(
	'/',
	// express.raw({ type: 'application/json' }), // Important for signature verification
	WebhookController.handleWebhook,
);

export default router;
