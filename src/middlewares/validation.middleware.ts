// src/middlewares/validation.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import type { AnySchema } from 'joi';
import { ApiError } from '../utils/apiError';
import { createLogger } from '../utils/logger';

const validationLogger = createLogger('validation');

/**
 * Middleware factory that validates request data against a Joi schema
 * @param schema Joi validation schema
 * @param part Which part of the request to validate ('body', 'query', or 'params')
 */
export const validate = (schema: AnySchema, part: 'body' | 'query' | 'params' = 'body') => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const { error, value } = schema.validate(req[part], {
				abortEarly: false, // Return all errors not just the first one
				stripUnknown: true, // Remove unknown properties
				allowUnknown: true, // Allow unknown properties that aren't in schema
			});

			if (error) {
				const errors = error.details.map((detail) => ({
					field: detail.path.join('.'),
					message: detail.message.replace(/['"]/g, ''), // Remove quotes from error messages
				}));

				validationLogger.warn('Validation failed', {
					path: req.path,
					errors,
					[part]: req[part],
				});

				throw new ApiError(422, 'Validation failed', errors);
			}

			// Replace the request part with the validated value
			req[part] = value;
			next();
		} catch (error) {
			next(error);
		}
	};
};

/**
 * Middleware to validate request body
 */
export const validateBody = (schema: AnySchema) => validate(schema, 'body');

/**
 * Middleware to validate query parameters
 */
export const validateQuery = (schema: AnySchema) => validate(schema, 'query');

/**
 * Middleware to validate route parameters
 */
export const validateParams = (schema: AnySchema) => validate(schema, 'params');
