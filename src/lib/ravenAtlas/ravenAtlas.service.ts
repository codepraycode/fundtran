import { logger } from '../../utils/logger';
import { getRavenAtlasClient } from './ravenAtlas.client';
import type { CreateRavenAccount, RavenAccount, RavenResponse } from './ravenAtlas.interface';

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

export default class RavenAtlasService {
	public static async initiateBankTransfer(
		payload: BankTransferPayload,
	): Promise<BankTransferResponse> {
		try {
			const client = getRavenAtlasClient();
			const response = await client.post<BankTransferResponse>('/transfers/bank', {
				...payload,
				currency: payload.currency || 'NGN',
			});

			logger.info('Bank transfer initiated', {
				reference: response.reference,
				amount: payload.amount,
			});

			return response;
		} catch (error) {
			logger.error('Failed to initiate bank transfer', error as any);
			throw error;
		}
	}

	public static async createAccount(
		details: CreateRavenAccount,
	): Promise<RavenResponse<RavenAccount>> {
		const client = getRavenAtlasClient();
		const endpoint = '/pwbt/generate_account';
		return client.post<RavenResponse<RavenAccount>>(endpoint, details);
	}

	public static async getAccount(
		accountNumber: RavenAccount["account_number"],
	): Promise<RavenResponse<RavenAccount[]>> {
		const client = getRavenAtlasClient();
		const endpoint = `/collection-account-number?account_number=${accountNumber}`;
		return client.get<RavenResponse<RavenAccount[]>>(endpoint);
	}

	public static async getTransferStatus(reference: string): Promise<BankTransferResponse> {
		const client = getRavenAtlasClient();
		return client.get<BankTransferResponse>(`/transfers/${reference}/status`);
	}

	public static async getBanks(): Promise<
		Array<{
			code: string;
			name: string;
		}>
	> {
		const client = getRavenAtlasClient();
		return client.get('/banks');
	}
}
