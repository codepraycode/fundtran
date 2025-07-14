import { logger } from '../../utils/logger';
import { getRavenAtlasClient } from './ravenAtlas.client';
import type {
	CreateRavenAccount,
	RavenAccount,
	RavenResponse,
	RavenTransferDto,
	RavenTransferPayload,
	RavenTransferStatus,
} from './ravenAtlas.interface';

export default class RavenAtlasService {
	// Transfer
	public static async makeBankTransfer(
		payload: RavenTransferDto,
	): Promise<RavenResponse<RavenTransferPayload>> {
		const endpoint = '/transfers/create';
		try {
			const client = getRavenAtlasClient();
			const response = await client.post<RavenResponse<RavenTransferPayload>>(
				endpoint,
				payload,
			);

			return response;
		} catch (error) {
			logger.error('Failed to initiate bank transfer', error as any);
			throw error;
		}
	}

	public static async getTransferStatus(
		reference: string,
	): Promise<RavenResponse<RavenTransferStatus>> {
		const endpoint = `/get-transfer?trx_ref=${reference}`;
		const client = getRavenAtlasClient();
		return client.get<RavenResponse<RavenTransferStatus>>(endpoint);
	}


	// Account
	public static async createAccount(
		details: CreateRavenAccount,
	): Promise<RavenResponse<RavenAccount>> {
		const client = getRavenAtlasClient();
		const endpoint = '/pwbt/generate_account';
		return client.post<RavenResponse<RavenAccount>>(endpoint, details);
	}

	public static async getAccount(
		accountNumber: RavenAccount['account_number'],
	): Promise<RavenResponse<RavenAccount[]>> {
		const client = getRavenAtlasClient();
		const endpoint = `/collection-account-number?account_number=${accountNumber}`;
		return client.get<RavenResponse<RavenAccount[]>>(endpoint);
	}
}
