export enum LogLevel {
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
}

export class Logger {
	private prefix: string;

	constructor(prefix = "GoogleCalendarImporter") {
		this.prefix = prefix;
	}

	info(message: string, ...args: unknown[]): void {
		console.log(`[${this.prefix}][${LogLevel.INFO}]`, message, ...args);
	}

	warn(message: string, ...args: unknown[]): void {
		console.warn(`[${this.prefix}][${LogLevel.WARN}]`, message, ...args);
	}

	error(message: string, error?: Error, ...args: unknown[]): void {
		console.error(`[${this.prefix}][${LogLevel.ERROR}]`, message, ...args);
		if (error) {
			console.error(error);
		}
	}
}
