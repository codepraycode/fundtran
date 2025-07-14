import type { Request, Response } from 'express';
import db from '../config/database';
import { checkDatabase, getSystemStatus } from '../utils/healthCheck';

export const healthCheck = async (req: Request, res: Response) => {
	try {
		// Test database connection
		const db_status = await checkDatabase();
		const sys_status = await getSystemStatus();

		res.status(200).json({
			status: 'healthy',
			database: db_status,
			system: sys_status,
			timestamp: new Date().toISOString(),
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
