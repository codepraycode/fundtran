import type { Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import { ApiError } from '../utils/apiError';
import { createLogger } from '../utils/logger';
import { exportToCSV, exportToPDF, exportToExcel } from '../utils/export';
import type { AuthenticatedRequest } from '../types/request-types';

const transactionLogger = createLogger('transaction');

export const getTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { transactionId } = req.params;

    if (!transactionId) {
        throw new ApiError(404, "Transaction ID is required");
    }

    const transaction = await transactionService.getTransaction(userId, transactionId);
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    transactionLogger.error('Failed to get transaction', error as Error, {
      transactionId: req.params.transactionId
    });
    next(error);
  }
};

export const listTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const filters = req.query;

    const transactions = await transactionService.listTransactions(userId, filters);
    
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    transactionLogger.error('Failed to list transactions', error as Error, {
      userId: req.user?.id
    });
    next(error);
  }
};

export const exportTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { format, ...filters } = req.query;

    const transactions = await transactionService.exportTransactions(userId, filters);
    
    switch (format) {
      case 'pdf':
        const pdfBuffer = await exportToPDF(transactions);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
        return res.send(pdfBuffer);
      
      case 'excel':
        const excelBuffer = await exportToExcel(transactions);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
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

export const getTransactionSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const summary = await transactionService.getTransactionSummary(userId);
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    transactionLogger.error('Failed to get transaction summary', error as Error);
    next(error);
  }
};