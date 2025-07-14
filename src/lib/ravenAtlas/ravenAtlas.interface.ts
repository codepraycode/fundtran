export interface CreateRavenAccount {
	first_name: string;
	last_name: string;
	phone: string;
	amount: number | `${number}`;
	email: string | `${string}@${string}.${string}`;
}

export interface RavenAccount {
	account_number: string | `${number}`;
	account_name: string;
	bank: string;
	customer: Omit<CreateRavenAccount, 'amount'>;
	isPermanent: boolean;
	amount: CreateRavenAccount['amount'];
}

export type RavenResponse<T> =
	| {
			status: 'fail';
			message: string;
			data?: null;
	  }
	| {
			status: 'success';
			message: string;
			data: T;
	  };

interface BankTransferPayload {
	amount: number;
	recipient_account_number: string;
	recipient_bank_code: string;
	reference: string;
	narration?: string;
	currency?: string;
}

interface BankTransferResponse {
	id: string;
	status: 'pending' | 'processing' | 'success' | 'failed';
	reference: string;
	fee: number;
}
