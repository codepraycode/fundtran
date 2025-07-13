import Joi from 'joi';

export const generateAccountSchema = Joi.object({
  currency: Joi.string().valid('NGN', 'USD', 'GBP', 'EUR').default('NGN'),
  account_type: Joi.string().valid('savings', 'current').default('savings')
});

export const webhookSchema = Joi.object({
  event: Joi.string().required(),
  data: Joi.object({
    reference: Joi.string().required(),
    amount: Joi.number().positive().required(),
    account_number: Joi.string().required(),
    bank_code: Joi.string().required(),
    status: Joi.string().valid('success', 'failed', 'pending').required(),
    timestamp: Joi.date().required()
  }).required()
});

export const getAccountSchema = Joi.object({
  accountId: Joi.string().uuid().required()
});

export const updateAccountSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  status: Joi.string().valid('active', 'inactive', 'suspended'),
  daily_limit: Joi.number().positive(),
  monthly_limit: Joi.number().positive()
});