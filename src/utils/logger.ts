import { inspect } from 'util';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

const colors = {
	reset: '\x1b[0m',
	error: '\x1b[31m', // red
	warn: '\x1b[33m', // yellow
	info: '\x1b[32m', // green
	debug: '\x1b[36m', // cyan
	trace: '\x1b[35m', // magenta
	timestamp: '\x1b[90m', // gray
};

const logLevels: Record<LogLevel, number> = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
	trace: 4,
};

const currentLogLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

class Logger {
	private readonly context: string;

	constructor(context: string) {
		this.context = context;
	}

	private shouldLog(level: LogLevel): boolean {
		return logLevels[level] <= logLevels[currentLogLevel];
	}

	private formatMessage(level: LogLevel, message: string, meta?: any): string {
		const timestamp = new Date().toISOString();
		const levelColor = colors[level];
		const contextPart = this.context ? ` [${this.context}]` : '';

		let metaString = '';
		if (meta) {
			metaString = inspect(meta, {
				colors: true,
				depth: 5,
				showHidden: false,
				compact: false,
			});
		}

		return `${colors.timestamp}${timestamp}${colors.reset} ${levelColor}${level.toUpperCase()}${colors.reset}${contextPart}: ${message} ${metaString}`;
	}

	error(message: string, error?: Error, meta?: any): void {
		if (this.shouldLog('error')) {
			const errStack = error?.stack ? `\n${error.stack}` : '';
			console.error(this.formatMessage('error', message, meta) + errStack);
		}
	}

	warn(message: string, meta?: any): void {
		if (this.shouldLog('warn')) {
			console.warn(this.formatMessage('warn', message, meta));
		}
	}

	info(message: string, meta?: any): void {
		if (this.shouldLog('info')) {
			console.info(this.formatMessage('info', message, meta));
		}
	}

	treeLog(data: object, message: string = 'Data Tree', meta?: any): void {
		if (this.shouldLog('info')) {
			console.info(
				this.formatMessage(
					'info',
					`
            ${message}
            
            ${JSON.stringify(data, null, 2)}
        `,
					meta,
				),
			);
		}
	}

	debug(message: string, meta?: any): void {
		if (this.shouldLog('debug')) {
			console.debug(this.formatMessage('debug', message, meta));
		}
	}

	trace(message: string, meta?: any): void {
		if (this.shouldLog('trace')) {
			console.trace(this.formatMessage('trace', message, meta));
		}
	}
}

export const createLogger = (context?: string) => new Logger(context || '');
export const logger = createLogger('app');
