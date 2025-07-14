import type { Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';
import type { AuthenticatedRequest } from '../types/request-types';
import RavenAtlasService from '../lib/ravenAtlas/ravenAtlas.service';
import { ApiError } from '../utils/apiError';

const transferLogger = createLogger('transfer');

export const createTransfer = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		// const user = req.user!.id;
		const {
			status,
			message,
			data: transfer,
		} = await RavenAtlasService.makeBankTransfer(req.body);

		if (status === 'fail') {
			throw new ApiError(400, message || 'Could not create transfer');
		}

		transferLogger.info('Transfer created', { transfer });

		res.status(201).json({
			success: true,
			data: transfer,
		});
	} catch (error) {
		transferLogger.error('Transfer creation failed', error as Error, { user: req.user });
		next(error);
	}
};

export const getTransfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user!.id;
		const { transferRef } = req.params;

		if (!transferRef) {
			throw new ApiError(400, 'Transfer ref is required');
		}

		const {
			status,
			message,
			data: transfer,
		} = await RavenAtlasService.getTransferStatus(transferRef);

		if (status === 'fail') {
			throw new ApiError(400, message || 'Could not get transfer');
		}

		transferLogger.info('Transfer status obtained', { transfer });

		res.status(200).json({
			success: true,
			data: transfer,
		});
	} catch (error) {
		next(error);
	}
};
