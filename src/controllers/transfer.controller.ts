import type { Response, NextFunction } from 'express';
import * as transferService from '../services/transfer.service';
import { createLogger } from '../utils/logger';
import type { AuthenticatedRequest } from '../types/request-types';

const transferLogger = createLogger('transfer');

export const createTransfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const transfer = await transferService.createTransfer(userId, req.body);
    
    transferLogger.info('Transfer created', { transferId: transfer.id, userId });
    
    res.status(201).json({
      success: true,
      data: transfer
    });
  } catch (error) {
    transferLogger.error('Transfer creation failed', error as Error, { userId: req.user?.id });
    next(error);
  }
};

export const getTransfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { transferId } = req.params;

    if (!transferId) {
        throw new Error("Transfer Id is required");
    }
    
    const transfer = await transferService.getTransfer(userId, transferId);
    
    res.status(200).json({
      success: true,
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};

export const accountTransfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const transfer = await transferService.accountTransfer(userId, req.body);
    
    transferLogger.info('Account transfer successful', { 
      transferId: transfer.id,
      sender: transfer.sender_account_id,
      recipient: transfer.recipient_account_id
    });
    
    res.status(201).json({
      success: true,
      data: transfer
    });
  } catch (error) {
    transferLogger.error('Account transfer failed', error as Error, { userId: req.user?.id });
    next(error);
  }
};

export const bankTransfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await transferService.bankTransfer(userId, req.body);
    
    transferLogger.info('Bank transfer initiated', {
      reference: result.reference,
      bankCode: req.body.recipient_bank_code,
      amount: req.body.amount
    });
    
    res.status(202).json({
      success: true,
      data: result
    });
  } catch (error) {
    transferLogger.error('Bank transfer failed', error as Error, { userId: req.user?.id });
    next(error);
  }
};

export const bulkTransfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const results = await transferService.bulkTransfer(userId, req.body);
    
    transferLogger.info('Bulk transfer processed', {
      count: results.length,
      userId
    });
    
    res.status(207).json({
      success: true,
      data: results
    });
  } catch (error) {
    transferLogger.error('Bulk transfer failed', error as Error, { userId: req.user?.id });
    next(error);
  }
};

export const getUserTransfers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;
    
    const transfers = await transferService.getUserTransfers(
      userId,
      Number(page),
      Number(limit)
    );
    
    res.status(200).json({
      success: true,
      data: transfers
    });
  } catch (error) {
    next(error);
  }
};