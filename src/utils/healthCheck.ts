import db from '../config/database';

export async function checkDatabase() {
	try {
		await db.raw('SELECT 1');
		return { status: 'connected' };
	} catch (error) {
		return { status: 'disconnected', error: (error as Error).message };
	}
}

export function getSystemStatus() {
	return {
		memoryUsage: process.memoryUsage(),
		uptime: process.uptime(),
	};
}
