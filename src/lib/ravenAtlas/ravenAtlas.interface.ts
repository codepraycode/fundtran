type RavenAmount = number | `${number}`;
type RavenAccountNumber = string;
type RavenCurrency = string;

export interface CreateRavenAccount {
	first_name: string;
	last_name: string;
	phone: string;
	amount: RavenAmount;
	email: string | `${string}@${string}.${string}`;
}

export interface RavenAccount {
	account_number: RavenAccountNumber;
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

export interface RavenTransferDto {
	amount: RavenAmount;
	bank: string;
	bank_code: string;
	account_number: RavenAccountNumber;
	account_name: string;
	narration: string;
	reference: string;
	currency?: RavenCurrency;
}

interface RavenTransfer {
	id: number;
	trx_ref: string;
	amount: RavenAmount;
	email: string;
	fee?: RavenAmount;
	status: string;
	bank: string;
	account_number: RavenAccountNumber;
	account_name: string;
	narration: string;
	merchant_ref: string;
}

export interface RavenTransferStatus extends RavenTransfer {
	account_bank: string;
	currency: RavenCurrency;
	session_id: string;
}

export interface RavenTransferPayload extends RavenTransfer {
	bank_code: string;
	created_at: string;
}

export interface RavenTransaction {
	id: string;
	email: string;
	type: string;
	currency: RavenCurrency;
	reference: string;
	b_before: number;
	b_after: number;
	direction: string;
	_value: number;
	_fee: RavenAmount;
	meta_data: string;
	created_at: string;
	updated_at: string;
	deleted_at: string;
}

export interface RavenTransactionList {
	transactions: RavenTransaction[];
	pagination: {
		perPage: number;
		currentPage: number;
		nextPage: string;
		prevPage: string;
		totalPages: number;
		total: number;
	};
}
