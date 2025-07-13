import db from '../config/database';
import type { 
  IAccount, 
  IAccountCreate, 
  IAccountUpdate 
} from '../interfaces/account.interface';
import { generateAccountNumber } from '../utils/helpers';
import { createLogger } from '../utils/logger';
import { ApiError } from '../utils/apiError';

const accountLogger = createLogger('account-service');

export const generateAccount = async (
  userId: number,
  currency: string = 'NGN',
  accountType: string = 'savings'
): Promise<IAccount> => {
  try {
    const accountNumber = generateAccountNumber();
    
    const [account] = await db<IAccount>('accounts')
      .insert({
        user_id: userId,
        account_number: accountNumber,
        account_type: accountType,
        currency,
        balance: 0,
        status: 'active'
      } as IAccountCreate)
      .returning('*');


      if (!account) {
        throw new Error("Could not generate Account Number")
      }
    
    return account;
  } catch (error) {
    accountLogger.error('Account generation failed in service', error as Error, { userId });
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
      await db.transaction(async trx => {
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
            channel: 'bank_transfer'
          }
        });
      });
    }
  } catch (error) {
    accountLogger.error('Webhook processing failed in service', error as Error, { payload });
    throw error;
  }
};

export const getAccount = async (
  userId: number,
  accountId: string
): Promise<IAccount> => {
  try {
    const account = await db<IAccount>('accounts')
      .where('id', accountId)
      .andWhere('user_id', userId)
      .first();

    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    return account;
  } catch (error) {
    throw error;
  }
};

export const updateAccount = async (
  userId: number,
  accountId: string,
  updateData: IAccountUpdate
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

export const getUserAccounts = async (userId: number): Promise<IAccount[]> => {
  try {
    return await db<IAccount>('accounts')
      .where('user_id', userId)
      .select('*');
  } catch (error) {
    throw error;
  }
};