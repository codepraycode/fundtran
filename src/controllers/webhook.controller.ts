import type { Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';
import db from '../config/database';

export default class WebhookController {
	private static verifySignature(payload: any, signature: string, secret: string): boolean {
		const hmac = crypto.createHmac('sha256', secret);
		const digest = hmac.update(JSON.stringify(payload)).digest('hex');
		return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
	}

	public static async handleWebhook(req: Request, res: Response): Promise<void> {
		try {
			// 1. Verify signature
			const signature = req.headers['x-raven-signature'] as string;
			const secret = process.env.RAVEN_WEBHOOK_SECRET!;

			if (!this.verifySignature(req.body, signature, secret)) {
				throw new ApiError(401, 'Invalid webhook signature');
			}

			// 2. Process event
			const event = req.body.event;
			const data = req.body.data;

			logger.info(`Received webhook event: ${event}`, { data });

			switch (event) {
				case 'transfer.completed':
					await this.handleTransferCompleted(data);
					break;

				case 'transfer.failed':
					await this.handleTransferFailed(data);
					break;

				case 'transfer.reversed':
					await this.handleTransferReversed(data);
					break;

				default:
					logger.warn(`Unhandled webhook event: ${event}`);
			}

			res.status(200).json({ success: true });
		} catch (error) {
			logger.error('Webhook processing failed', error as Error);
			throw error;
		}
	}

	private static async handleTransferCompleted(data: any) {
		await db.transaction(async (trx) => {
			// 1. Update transfer status
			await trx('transfers').where('reference', data.reference).update({
				status: 'completed',
				external_reference: data.id,
				updated_at: new Date(),
			});

			// 2. Create transaction record (if needed)
			await trx('transactions').insert({
				transfer_id: data.id,
				amount: data.amount,
				type: 'bank_transfer',
				status: 'completed',
				metadata: data,
			});

			logger.info(`Transfer ${data.reference} completed`);
		});
	}

	private static async handleTransferFailed(data: any) {
		await db('transfers').where('reference', data.reference).update({
			status: 'failed',
			failure_reason: data.failure_reason,
			updated_at: new Date(),
		});

		logger.warn(`Transfer ${data.reference} failed`, {
			reason: data.failure_reason,
		});
	}

	private static async handleTransferReversed(data: any) {
		await db.transaction(async (trx) => {
			// 1. Update transfer status
			await trx('transfers').where('reference', data.reference).update({
				status: 'reversed',
				updated_at: new Date(),
			});

			// 2. Reverse the balance if needed
			if (data.amount) {
				await trx('accounts')
					.where('id', data.account_id)
					.increment('balance', data.amount);
			}

			logger.info(`Transfer ${data.reference} reversed`);
		});
	}
}
