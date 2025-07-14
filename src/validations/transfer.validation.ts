import Joi from 'joi';

export const createTransferSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('NGN', 'USD', 'GBP', 'EUR').default('NGN'),
  narration: Joi.string().max(100).optional(),
  metadata: Joi.object().optional()
});

export const getTransferSchema = Joi.object({
  transferId: Joi.string().uuid().required()
});

export const accountTransferSchema = Joi.object({
  amount: Joi.number().positive().required(),
  recipient_account_id: Joi.string().uuid().required(),
  narration: Joi.string().max(100).optional(),
  metadata: Joi.object().optional()
});

export const bankTransferSchema = Joi.object({
  amount: Joi.number().positive().required(),
  recipient_account_number: Joi.string().required(),
  recipient_bank_code: Joi.string().required(),
  recipient_name: Joi.string().required(),
  narration: Joi.string().max(100).optional(),
  reference: Joi.string().optional(),
  metadata: Joi.object().optional()
});

export const bulkTransferSchema = Joi.object({
  transfers: Joi.array().items(
    Joi.object({
      amount: Joi.number().positive().required(),
      recipient_account_id: Joi.string().uuid().required(),
      narration: Joi.string().max(100).optional()
    })
  ).min(1).max(50).required(),
  currency: Joi.string().valid('NGN', 'USD', 'GBP', 'EUR').default('NGN')
});