import Joi from 'joi';

export const listTransactionsSchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(10),
	type: Joi.string(),
	status: Joi.string(),
	startDate: Joi.date().iso(),
	endDate: Joi.date().iso().greater(Joi.ref('startDate')),
	accountId: Joi.string().uuid(),
	search: Joi.string().trim().max(100),
});

export const exportTransactionsSchema = Joi.object({
	format: Joi.string().valid('csv', 'pdf', 'excel').default('csv'),
	startDate: Joi.date().iso().required(),
	endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
	type: Joi.string(),
	status: Joi.string(),
});
