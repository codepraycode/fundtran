import Joi from 'joi';

export const webhookSchema = Joi.object({
	event: Joi.string().required(),
	data: Joi.object({
		reference: Joi.string().required(),
		amount: Joi.number().positive().required(),
		account_number: Joi.string().required(),
		bank_code: Joi.string().required(),
		status: Joi.string().valid('success', 'failed', 'pending').required(),
		timestamp: Joi.date().required(),
	}).required(),
});

export const updateAccountSchema = Joi.object({
	// accountId: Joi.string().uuid().required(),
	// status: Joi.string().valid('active', 'inactive', 'suspended'),
	// daily_limit: Joi.number().positive(),
	// monthly_limit: Joi.number().positive(),
});
