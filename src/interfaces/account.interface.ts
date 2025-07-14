export interface IAccount {
	id: string;
	user_id: number;
	account_number: string;
	account_type: 'savings' | 'current';
	currency: string;
	balance: number;
	status: 'active' | 'inactive' | 'suspended';
	daily_limit?: number;
	monthly_limit?: number;
	created_at: Date;
	updated_at: Date;
}

export interface IAccountCreate {
	user_id: number;
	account_number: string;
	account_type: 'savings' | 'current';
	currency: string;
	balance: number;
	status: 'active' | 'inactive' | 'suspended';
}

export interface IAccountUpdate {
	status?: 'active' | 'inactive' | 'suspended';
	daily_limit?: number;
	monthly_limit?: number;
}

export interface IWebhookPayload {
	event: string;
	data: {
		reference: string;
		amount: number;
		account_number: string;
		bank_code: string;
		status: 'success' | 'failed' | 'pending';
		timestamp: Date;
	};
}
