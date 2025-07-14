import Joi from 'joi';
import type { RavenTransferDto } from '../lib/ravenAtlas/ravenAtlas.interface';

const ravenAmount = Joi.number()
	.positive()
	.precision(2)
	.max(10_000_000) // 10 million max transfer
	.required()
	.messages({
		'number.base': 'Amount must be a number',
		'number.positive': 'Amount must be positive',
		'number.precision': 'Amount must have exactly 2 decimal places',
		'number.max': 'Amount cannot exceed {#limit}',
	});

const ravenAccountNumber = Joi.string()
	.pattern(/^[0-9]{10,20}$/) // 10-20 digits
	.required()
	.messages({
		'string.pattern.base': 'Account number must be 10-20 digits',
		'string.empty': 'Account number is required',
	});

const ravenBankCode = Joi.string()
	.length(3) // Standard bank codes are typically 3 digits
	.required()
	.messages({
		'string.length': 'Bank code must be exactly 3 characters',
		'string.empty': 'Bank code is required',
	});

const ravenReference = Joi.string()
	.pattern(/^[A-Z0-9_\-]{8,64}$/i)
	.required()
	.messages({
		'string.pattern.base': 'Reference must be 8-64 alphanumeric characters',
		'string.empty': 'Reference is required',
	});

export const ravenTransferSchema = Joi.object<RavenTransferDto>({
	amount: ravenAmount,
	bank: Joi.string().min(3).max(100).required(),
	bank_code: ravenBankCode,
	account_number: ravenAccountNumber,
	account_name: Joi.string()
		.min(3)
		.max(100)
		.pattern(/^[a-zA-Z ]+$/)
		.required()
		.messages({
			'string.pattern.base': 'Account name can only contain letters and spaces',
		}),
	narration: Joi.string().min(3).max(100).required(),
	reference: ravenReference,
	currency: Joi.string()
		.length(3)
		.uppercase()
		.default('NGN')
		.valid('NGN', 'USD', 'GBP', 'EUR') // Supported currencies
		.messages({
			'string.valid': 'Currency must be one of NGN, USD, GBP, or EUR',
		}),
}).options({
	abortEarly: false, // Return all errors
	stripUnknown: true, // Remove unknown fields
});

export const accountTransferSchema = Joi.object({
	amount: Joi.number().positive().required(),
	recipient_account_id: Joi.string().uuid().required(),
	narration: Joi.string().max(100).optional(),
	metadata: Joi.object().optional(),
});

export const bankTransferSchema = Joi.object({
	amount: Joi.number().positive().required(),
	recipient_account_number: Joi.string().required(),
	recipient_bank_code: Joi.string().required(),
	recipient_name: Joi.string().required(),
	narration: Joi.string().max(100).optional(),
	reference: Joi.string().optional(),
	metadata: Joi.object().optional(),
});

export const bulkTransferSchema = Joi.object({
	transfers: Joi.array()
		.items(
			Joi.object({
				amount: Joi.number().positive().required(),
				recipient_account_id: Joi.string().uuid().required(),
				narration: Joi.string().max(100).optional(),
			}),
		)
		.min(1)
		.max(50)
		.required(),
	currency: Joi.string().valid('NGN', 'USD', 'GBP', 'EUR').default('NGN'),
});
