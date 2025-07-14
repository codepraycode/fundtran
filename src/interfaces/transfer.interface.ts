export interface ITransfer {
  id: string;
  user_id: number;
  reference: string;
  sender_account_id?: string;
  recipient_account_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  type: 'account_transfer' | 'bank_transfer' | 'bulk_transfer';
  narration?: string;
  external_reference?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface IAccountTransfer {
  sender_account_id: string;
  recipient_account_id: string;
  amount: number;
  narration?: string;
  metadata?: any;
}

export interface IBankTransfer {
  recipient_account_number: string;
  recipient_bank_code: string;
  recipient_name: string;
  amount: number;
  reference?: string;
  narration?: string;
  metadata?: any;
}

export interface IBulkTransfer {
  sender_account_id: string;
  transfers: Array<{
    recipient_account_id: string;
    amount: number;
    narration?: string;
  }>;
  currency?: string;
}