import db from '../config/database';
import type {
  ITransfer,
  IAccountTransfer,
  IBankTransfer,
  IBulkTransfer
} from '../interfaces/transfer.interface';
import { createLogger } from '../utils/logger';
import { ApiError } from '../utils/apiError';
import { v4 as uuidv4 } from 'uuid';

const transferLogger = createLogger('transfer-service');

export const createTransfer = async (userId: number, data: any): Promise<ITransfer> => {
  try {
    const [transfer] = await db<ITransfer>('transfers')
      .insert({
        user_id: userId,
        reference: uuidv4(),
        ...data,
        status: 'pending'
      })
      .returning('*');


      if (!transfer) {
        throw new Error("Could not create transfer");
      }
    
    return transfer;
  } catch (error) {
    transferLogger.error('Transfer creation failed in service', error as Error);
    throw new ApiError(500, 'Failed to create transfer');
  }
};

export const getTransfer = async (userId: number, transferId: string): Promise<ITransfer> => {
  try {
    const transfer = await db<ITransfer>('transfers')
      .where('id', transferId)
      .andWhere('user_id', userId)
      .first();

    if (!transfer) {
      throw new ApiError(404, 'Transfer not found');
    }

    return transfer;
  } catch (error) {
    throw error;
  }
};

export const accountTransfer = async (userId: number, data: IAccountTransfer): Promise<ITransfer> => {
  try {
    return await db.transaction(async trx => {
      // 1. Verify sender has sufficient balance
      const senderAccount = await trx('accounts')
        .where('id', data.sender_account_id)
        .andWhere('user_id', userId)
        .first();

      if (!senderAccount) {
        throw new ApiError(404, 'Sender account not found');
      }

      if (senderAccount.balance < data.amount) {
        throw new ApiError(400, 'Insufficient balance');
      }

      // 2. Verify recipient account exists
      const recipientAccount = await trx('accounts')
        .where('id', data.recipient_account_id)
        .first();

      if (!recipientAccount) {
        throw new ApiError(404, 'Recipient account not found');
      }

      // 3. Perform the transfer
      await trx('accounts')
        .where('id', data.sender_account_id)
        .decrement('balance', data.amount);

      await trx('accounts')
        .where('id', data.recipient_account_id)
        .increment('balance', data.amount);

      // 4. Record the transaction
      const [transfer] = await trx<ITransfer>('transfers')
        .insert({
          user_id: userId,
          reference: uuidv4(),
          sender_account_id: data.sender_account_id,
          recipient_account_id: data.recipient_account_id,
          amount: data.amount,
          status: 'completed',
          type: 'account_transfer',
          narration: data.narration,
          metadata: data.metadata
        })
        .returning('*');

        if (!transfer) {
            throw new Error("Could not record transfer");
        }

      return transfer;
    });
  } catch (error) {
    transferLogger.error('Account transfer failed in service', error as Error);
    throw error;
  }
};

export const bankTransfer = async (userId: number, data: IBankTransfer): Promise<any> => {
  try {
    // 1. Verify sender has sufficient balance
    const senderAccount = await db('accounts')
      .where('user_id', userId)
      .andWhere('currency', 'NGN') // Assuming NGN for bank transfers
      .first();

    if (!senderAccount) {
      throw new ApiError(404, 'No valid account found for transfer');
    }

    if (senderAccount.balance < data.amount) {
      throw new ApiError(400, 'Insufficient balance');
    }

    // 2. Create pending transfer record
    const [transfer] = await db<ITransfer>('transfers')
      .insert({
        user_id: userId,
        reference: data.reference || uuidv4(),
        sender_account_id: senderAccount.id,
        amount: data.amount,
        status: 'pending',
        type: 'bank_transfer',
        narration: data.narration,
        metadata: {
          ...data.metadata,
          recipient_account_number: data.recipient_account_number,
          recipient_bank_code: data.recipient_bank_code,
          recipient_name: data.recipient_name
        }
      })
      .returning('*');

      if (!transfer) {
        throw new Error("Could not create pending transfer");
      }

    // 3. Call Raven API (mock implementation - replace with actual API call)
    const ravenResponse = await mockRavenApiCall(data);

    // 4. Update transfer status based on Raven response
    await db<ITransfer>('transfers')
      .where('id', transfer.id)
      .update({
        status: ravenResponse.status,
        external_reference: ravenResponse.reference,
        metadata: {
          ...transfer.metadata,
          raven_response: ravenResponse
        }
      });

    // 5. Deduct balance if successful
    if (ravenResponse.status === 'success') {
      await db('accounts')
        .where('id', senderAccount.id)
        .decrement('balance', data.amount);
    }

    return {
      ...transfer,
      status: ravenResponse.status,
      raven_reference: ravenResponse.reference
    };
  } catch (error) {
    transferLogger.error('Bank transfer failed in service', error as Error);
    throw error;
  }
};

// Mock Raven API implementation (replace with actual API call)
const mockRavenApiCall = async (data: IBankTransfer) => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        reference: `RVN-${Date.now()}`,
        timestamp: new Date()
      });
    }, 500);
  });
};

export const bulkTransfer = async (userId: number, data: IBulkTransfer): Promise<any[]> => {
  try {
    const results = [];
    
    for (const transfer of data.transfers) {
      try {
        const result = await accountTransfer(userId, {
          ...transfer,
          sender_account_id: data.sender_account_id // Assuming same sender for all
        });
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Transfer failed',
          data: transfer
        });
      }
    }
    
    return results;
  } catch (error) {
    throw error;
  }
};

export const getUserTransfers = async (
  userId: number,
  page: number,
  limit: number
): Promise<ITransfer[]> => {
  try {
    return await db<ITransfer>('transfers')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .offset((page - 1) * limit)
      .limit(limit);
  } catch (error) {
    throw error;
  }
};