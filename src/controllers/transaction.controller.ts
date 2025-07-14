import type { Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { createLogger } from '../utils/logger';
import { exportToCSV, exportToPDF, exportToExcel } from '../utils/export';
import type { AuthenticatedRequest } from '../types/request-types';
import RavenAtlasService from '../lib/ravenAtlas/ravenAtlas.service';

const transactionLogger = createLogger('transaction');

export const listTransactions = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		// const userId = req.user!.id;
		const filters = req.query;

		const { status, message, data: transactions } = await RavenAtlasService.getTransactions();

		if (status === 'fail') {
			throw new ApiError(400, message || 'Could not list transactions');
		}

		// transactionLogger.treeLog( { transfer }, "Transa");

		res.status(200).json({
			success: true,
			data: transactions,
		});
	} catch (error) {
		transactionLogger.error('Failed to list transactions', error as Error, {
			userId: req.user?.id,
		});
		next(error);
	}
};

export const exportTransactions = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user!.id;
		const { format, ...filters } = req.query;

		// Perform transaction sorting
		const transactions = [] as any;

		switch (format) {
			case 'pdf':
				const pdfBuffer = await exportToPDF(transactions);
				res.setHeader('Content-Type', 'application/pdf');
				res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
				return res.send(pdfBuffer);

			case 'excel':
				const excelBuffer = await exportToExcel(transactions);
				res.setHeader(
					'Content-Type',
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				);
				res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
				return res.send(excelBuffer);

			case 'csv':
			default:
				const csvData = await exportToCSV(transactions);
				res.setHeader('Content-Type', 'text/csv');
				res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
				return res.send(csvData);
		}
	} catch (error) {
		transactionLogger.error('Failed to export transactions', error as Error);
		next(error);
	}
};
