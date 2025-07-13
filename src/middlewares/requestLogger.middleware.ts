import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  logger.info(`Request: ${method} ${originalUrl} from ${ip}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logLevel = statusCode >= 500 ? 'error' : 
                    statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`Response: ${method} ${originalUrl} - ${statusCode} (${duration}ms)`);
  });

  next();
};