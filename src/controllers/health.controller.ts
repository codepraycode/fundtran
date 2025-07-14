import type { Request, Response } from 'express';
import db from '../config/database';

export const healthCheck = async (req: Request, res: Response) => {
	try {
		// Test database connection
		await db.raw('SELECT 1');

		res.status(200).json({
			status: 'healthy',
			database: 'connected',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memoryUsage: process.memoryUsage(),
		});
	} catch (error) {
		res.status(500).json({
			status: 'unhealthy',
			database: 'disconnected',
			error: (error as Error).message || 'Error occurred',
			timestamp: new Date().toISOString(),
		});
	}
};
