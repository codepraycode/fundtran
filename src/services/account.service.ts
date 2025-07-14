import db from '../config/database';
import type { IAccount, IAccountCreate, IAccountUpdate } from '../interfaces/account.interface';
import { generateAccountNumber } from '../utils/helpers';
import { createLogger, logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';
import RavenAtlasService from '../lib/ravenAtlas/ravenAtlas.service';
import type { Authenticateduser } from '../interfaces/user.interface';
import type { RavenAccount } from '../lib/ravenAtlas/ravenAtlas.interface';

const accountLogger = createLogger('account-service');

export const generateAccount = async (user: Authenticateduser): Promise<RavenAccount> => {
	try {
		const data = await RavenAtlasService.createAccount({
			amount: 100,
			email: user.email,
			first_name: user.first_name,
			last_name: user.last_name,
			phone: user.phone,
		});

		logger.treeLog(data, 'New Raven Account');

		const { status, data: account, message } = data;

		if (status === 'fail') {
			throw new Error('Could not generate Account');
		}

		// const [account] = await db<IAccount>('accounts')
		//   .insert({
		//     user_id: userId,
		//     account_number: accountNumber,
		//     account_type: accountType,
		//     currency,
		//     balance: 0,
		//     status: 'active'
		//   } as IAccountCreate)
		//   .returning('*');

		if (!account) {
			throw new ApiError(404, message || 'Could not generate Account');
		}

		return account;
	} catch (error) {
		accountLogger.error('Account generation failed in service', error as Error, { user });
		throw new ApiError(500, 'Failed to generate account');
	}
};

export const processWebhook = async (payload: any): Promise<void> => {
	try {
		const { data } = payload;

		// Verify the transaction
		const account = await db<IAccount>('accounts')
			.where('account_number', data.account_number)
			.first();

		if (!account) {
			throw new ApiError(404, 'Account not found');
		}

		// Process based on status
		if (data.status === 'success') {
			await db.transaction(async (trx) => {
				// Update account balance
				await trx<IAccount>('accounts')
					.where('id', account.id)
					.increment('balance', data.amount);

				// Create transaction record
				await trx('transactions').insert({
					account_id: account.id,
					amount: data.amount,
					reference: data.reference,
					type: 'deposit',
					status: 'completed',
					balance_after: account.balance + data.amount,
					metadata: {
						bank_code: data.bank_code,
						channel: 'bank_transfer',
					},
				});
			});
		}
	} catch (error) {
		accountLogger.error('Webhook processing failed in service', error as Error, { payload });
		throw error;
	}
};

export const getAccount = async (accountNumber: string): Promise<RavenAccount[]> => {
	try {
		const data = await RavenAtlasService.getAccount(accountNumber);

		logger.treeLog(data, 'User Raven Accounts');

		const { status, data: account, message } = data;

		if (status === 'fail') {
			throw new ApiError(404, message || 'Could not get Accounts');
		}

		if (!account) {
			throw new ApiError(404, 'Accounts not found');
		}

		return account;
	} catch (error) {
		throw error;
	}
};

export const updateAccount = async (
	userId: number,
	accountId: string,
	updateData: IAccountUpdate,
): Promise<IAccount> => {
	try {
		const [account] = await db<IAccount>('accounts')
			.where('id', accountId)
			.andWhere('user_id', userId)
			.update(updateData)
			.returning('*');

		if (!account) {
			throw new ApiError(404, 'Account not found');
		}

		return account;
	} catch (error) {
		throw error;
	}
};

export const getAllAccounts = async (): Promise<IAccount[]> => {
	try {
		return [];
	} catch (error) {
		throw error;
	}
};
