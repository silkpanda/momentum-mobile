// momentum-mobile/src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private isDev: boolean = __DEV__;

    private formatMessage(level: LogLevel, message: string, data?: any): void {
        if (!this.isDev) return;

        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }

    debug(message: string, data?: any) {
        this.formatMessage('debug', message, data);
    }

    info(message: string, data?: any) {
        this.formatMessage('info', message, data);
    }

    warn(message: string, data?: any) {
        if (!this.isDev) return;
        console.warn(`[WARN] ${message}`, data || '');
    }

    error(message: string, error?: any) {
        if (!this.isDev) return;
        console.error(`[ERROR] ${message}`, error || '');
    }
}

export const logger = new Logger();
export default logger;
