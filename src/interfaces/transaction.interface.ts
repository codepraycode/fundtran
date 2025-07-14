export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  FEE = 'fee',
  INTEREST = 'interest'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed'
}

export interface ITransaction {
  id: string;
  account_id: string;
  reference: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  balance_before: number;
  balance_after: number;
  narration?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface ITransactionSummary {
  totalCount: number;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
}