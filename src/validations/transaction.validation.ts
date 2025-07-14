
import Joi from 'joi';
import { TransactionType, TransactionStatus } from '../interfaces/transaction.interface';

interface ITransferRequest {
  amount: number;
  recipientAccountNumber: string;
  recipientBankCode: string;
  recipientName: string;
  narration?: string;
}

export const transferSchema = Joi.object<ITransferRequest>({
  amount: Joi.number().positive().required(),
  recipientAccountNumber: Joi.string().required(),
  recipientBankCode: Joi.string().required(),
  recipientName: Joi.string().required(),
  narration: Joi.string().optional(),
});

export const getTransactionSchema = Joi.object({
  transactionId: Joi.string().uuid().required()
});

export const listTransactionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  type: Joi.string().valid(...Object.values(TransactionType)),
  status: Joi.string().valid(...Object.values(TransactionStatus)),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')),
  accountId: Joi.string().uuid(),
  search: Joi.string().trim().max(100)
});

export const exportTransactionsSchema = Joi.object({
  format: Joi.string().valid('csv', 'pdf', 'excel').default('csv'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  type: Joi.string().valid(...Object.values(TransactionType)),
  status: Joi.string().valid(...Object.values(TransactionStatus))
});