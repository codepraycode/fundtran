import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/apiError';

interface RavenAtlasConfig {
	apiKey: string;
	baseURL?: string;
	timeout?: number;
	maxRetries?: number;
}

interface RavenAtlasRequestConfig extends InternalAxiosRequestConfig {
	_retryCount?: number;
}

export class RavenAtlasClient {
	private readonly client: AxiosInstance;
	private readonly maxRetries: number;

	constructor(config: RavenAtlasConfig) {
		this.maxRetries = config.maxRetries || 3;

		this.client = axios.create({
			baseURL: config.baseURL || 'https://integrations.getravenbank.com/v1',
			timeout: config.timeout || 10000,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${config.apiKey}`,
			},
		});

		this._setupInterceptors();
	}

	private _setupInterceptors(): void {
		// Request interceptor
		this.client.interceptors.request.use(
			(config: RavenAtlasRequestConfig) => {
				config._retryCount = config._retryCount || 0;
				logger.debug(`Request to ${config.url}`, {
					method: config.method,
					attempt: config._retryCount + 1,
				});
				return config;
			},
			(error: AxiosError) => {
				logger.error('Request error', error);
				return Promise.reject(error);
			},
		);

		// Response interceptor
		this.client.interceptors.response.use(
			(response: AxiosResponse) => {
				logger.debug(`Response from ${response.config.url}`, {
					status: response.status,
					data: response.data,
				});
				return response;
			},
			async (error: AxiosError) => {
				const config = error.config as RavenAtlasRequestConfig;

				// Retry on network errors or 5xx responses
				if (this._shouldRetry(error) && config._retryCount! < this.maxRetries) {
					const retryDelay = this._calculateRetryDelay(config._retryCount!);
					config._retryCount! += 1;

					logger.warn(`Retrying request (attempt ${config._retryCount})`, {
						url: config.url,
						delay: retryDelay,
					});

					await new Promise((resolve) => setTimeout(resolve, retryDelay));
					return this.client(config);
				}

				logger.error(
					'API request failed',
					new ApiError(error.status || 500, 'API request failed', [
						{
							url: config.url,
							status: error.response?.status,
							error: error.message,
						},
					]),
				);

				throw this._transformError(error);
			},
		);
	}

	private _shouldRetry(error: AxiosError): boolean {
		// Retry on network errors or server errors
		return !error.response || (error.response.status >= 500 && error.response.status <= 599);
	}

	private _calculateRetryDelay(retryCount: number): number {
		// Exponential backoff with jitter
		const baseDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
		return baseDelay * (0.5 + Math.random());
	}

	private _transformError(error: AxiosError): ApiError {
		if (error.response) {
			// Raven Atlas API error format
			const apiError: any = error.response.data || {};
			return new ApiError(
				error.response.status,
				apiError.message || 'Raven Atlas API error',
				[apiError.code ? { code: apiError.code } : undefined],
			);
		}
		return new ApiError(500, 'Network error', [{ originalError: error.message }]);
	}

	// Public Methods
	public async get<T = any>(endpoint: string, config?: RavenAtlasRequestConfig): Promise<T> {
		const response = await this.client.get(endpoint, config);
		return response.data;
	}

	public async post<T = any>(
		endpoint: string,
		data?: any,
		config?: RavenAtlasRequestConfig,
	): Promise<T> {
		const response = await this.client.post(endpoint, JSON.stringify(data), config);
		return response.data;
	}

	public async put<T = any>(
		endpoint: string,
		data?: any,
		config?: RavenAtlasRequestConfig,
	): Promise<T> {
		const response = await this.client.put(endpoint, data, config);
		return response.data;
	}

	public async delete<T = any>(endpoint: string, config?: RavenAtlasRequestConfig): Promise<T> {
		const response = await this.client.delete(endpoint, config);
		return response.data;
	}
}

// Singleton instance
let ravenAtlasClient: RavenAtlasClient;

export function initRavenAtlasClient(config: RavenAtlasConfig): void {
	ravenAtlasClient = new RavenAtlasClient(config);
}

export function getRavenAtlasClient(): RavenAtlasClient {
	if (!ravenAtlasClient) {
		throw new Error('Raven Atlas client not initialized');
	}
	return ravenAtlasClient;
}
