import db from '../config/database';
import type { 
  ITransaction, 
  ITransactionSummary
} from '../interfaces/transaction.interface';
import { createLogger } from '../utils/logger';
import { ApiError } from '../utils/apiError';

const transactionLogger = createLogger('transaction-service');

export const getTransaction = async (
  userId: number,
  transactionId: string
): Promise<ITransaction> => {
  try {
    const transaction = await db<ITransaction>('transactions')
      .leftJoin('accounts', 'transactions.account_id', 'accounts.id')
      .where('transactions.id', transactionId)
      .andWhere('accounts.user_id', userId)
      .select('transactions.*')
      .first();

    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }

    return transaction;
  } catch (error) {
    transactionLogger.error('Failed to get transaction in service', error as Error);
    throw error;
  }
};

export const listTransactions = async (
  userId: number,
  filters: any
): Promise<{ data: ITransaction[]; count: number }> => {
  try {
    const query = db<ITransaction>('transactions')
      .leftJoin('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .orderBy('transactions.created_at', 'desc');

    // Apply filters
    if (filters.type) {
      query.andWhere('transactions.type', filters.type);
    }
    if (filters.status) {
      query.andWhere('transactions.status', filters.status);
    }
    if (filters.accountId) {
      query.andWhere('transactions.account_id', filters.accountId);
    }
    if (filters.startDate && filters.endDate) {
      query.andWhereBetween('transactions.created_at', [filters.startDate, filters.endDate]);
    }
    if (filters.search) {
      query.andWhere(function() {
        this.where('transactions.reference', 'like', `%${filters.search}%`)
          .orWhere('transactions.narration', 'like', `%${filters.search}%`);
      });
    }

    // Get count for pagination
    const countQuery = query.clone().count('transactions.id as count').first();
    const countResult = await countQuery;
    const totalCount = countResult?.count || 0;

    // Apply pagination
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query.offset(offset).limit(filters.limit);
    }

    const transactions = await query.select('transactions.*');

    return {
      data: transactions,
      count: Number(totalCount)
    };
  } catch (error) {
    transactionLogger.error('Failed to list transactions in service', error as Error);
    throw error;
  }
};

export const exportTransactions = async (
  userId: number,
  filters: any
): Promise<ITransaction[]> => {
  try {
    const query = db<ITransaction>('transactions')
      .leftJoin('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .orderBy('transactions.created_at', 'desc');

    // Apply filters
    if (filters.type) {
      query.andWhere('transactions.type', filters.type);
    }
    if (filters.status) {
      query.andWhere('transactions.status', filters.status);
    }
    if (filters.startDate && filters.endDate) {
      query.andWhereBetween('transactions.created_at', [filters.startDate, filters.endDate]);
    }

    return await query.select('transactions.*');
  } catch (error) {
    transactionLogger.error('Failed to export transactions in service', error as Error);
    throw error;
  }
};

export const getTransactionSummary = async (
  userId: number
): Promise<ITransactionSummary> => {
  try {
    const result = await db('transactions')
      .leftJoin('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .select(
        db.raw('COUNT(*) as total_count'),
        db.raw('SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) as completed_count'),
        db.raw('SUM(CASE WHEN status = \'failed\' THEN 1 ELSE 0 END) as failed_count'),
        db.raw('SUM(CASE WHEN status = \'pending\' THEN 1 ELSE 0 END) as pending_count'),
        db.raw('SUM(CASE WHEN type = \'deposit\' THEN amount ELSE 0 END) as total_deposits'),
        db.raw('SUM(CASE WHEN type = \'withdrawal\' THEN amount ELSE 0 END) as total_withdrawals'),
        db.raw('SUM(CASE WHEN type = \'transfer\' THEN amount ELSE 0 END) as total_transfers')
      )
      .first();

    return {
      totalCount: result?.total_count || 0,
      completedCount: result?.completed_count || 0,
      failedCount: result?.failed_count || 0,
      pendingCount: result?.pending_count || 0,
      totalDeposits: parseFloat(result?.total_deposits || '0'),
      totalWithdrawals: parseFloat(result?.total_withdrawals || '0'),
      totalTransfers: parseFloat(result?.total_transfers || '0')
    };
  } catch (error) {
    transactionLogger.error('Failed to get transaction summary in service', error as Error);
    throw error;
  }
};