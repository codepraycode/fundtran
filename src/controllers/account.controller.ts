import type { Response, NextFunction } from 'express';
import * as accountService from '../services/account.service';
import { createLogger } from '../utils/logger';
import type { AuthenticatedRequest } from '../types/request-types';

const accountLogger = createLogger('account');

export const generateAccount = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user!;
		// const { currency, account_type } = req.body;

		const account = await accountService.generateAccount(user);

		accountLogger.info('Account generated successfully', { account });

		res.status(201).json({
			success: true,
			data: account,
		});
	} catch (error) {
		accountLogger.error('Account generation failed', error as Error, { userId: req.user?.id });
		next(error);
	}
};

export const getAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		// const userId = req.user!.id;
		const { accountNumber } = req.params;

		if (!accountNumber) {
			throw new Error('Accout Number is required');
		}

		const accounts = await accountService.getAccount(accountNumber);

		res.status(200).json({
			success: true,
			data: accounts,
		});
	} catch (error) {
		next(error);
	}
};

export const updateAccount = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user!.id;
		const { accountId } = req.params;
		const updateData = req.body;

		if (!accountId) {
			throw new Error('Accout Id is required');
		}

		const account = await accountService.updateAccount(userId, accountId, updateData);

		accountLogger.info('Account updated successfully', { accountId, userId });

		res.status(200).json({
			success: true,
			data: account,
		});
	} catch (error) {
		accountLogger.error('Account update failed', error as Error, {
			accountId: req.params.accountId,
			userId: req.user?.id,
		});
		next(error);
	}
};

export const getAllAccounts = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const accounts = await accountService.getAllAccounts();

		res.status(200).json({
			success: true,
			data: accounts,
		});
	} catch (error) {
		next(error);
	}
};
