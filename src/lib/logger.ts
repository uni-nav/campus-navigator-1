/**
 * Centralized Logger
 * Replaces console.* statements with environment-aware logging
 */

import { config } from './config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: unknown;
    timestamp: string;
}

class Logger {
    private isDevelopment = config.isDevelopment;
    private enableDebug = config.enableDebug;

    private log(level: LogLevel, message: string, data?: unknown): void {
        const entry: LogEntry = {
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
        };

        // Always log errors
        if (level === 'error') {
            console.error(`[${entry.timestamp}] ERROR:`, message, data || '');
            // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
            // this.sendToErrorTracking(entry);
            return;
        }

        // Log warnings in all environments
        if (level === 'warn') {
            if (this.isDevelopment) {
                console.warn(`[${entry.timestamp}] WARN:`, message, data || '');
            }
            return;
        }

        // Only log info/debug in development
        if (this.isDevelopment) {
            if (level === 'debug' && !this.enableDebug) return;

            console.log(`[${entry.timestamp}] ${level.toUpperCase()}:`, message, data || '');
        }
    }

    info(message: string, data?: unknown): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: unknown): void {
        this.log('warn', message, data);
    }

    error(message: string, error?: unknown): void {
        this.log('error', message, error);
    }

    debug(message: string, data?: unknown): void {
        this.log('debug', message, data);
    }

    // Helper for API errors
    apiError(endpoint: string, error: unknown): void {
        this.error(`API Error: ${endpoint}`, error);
    }

    // TODO: Implement error tracking integration
    // private sendToErrorTracking(entry: LogEntry): void {
    //   if (config.isProduction) {
    //     // Sentry.captureException(entry);
    //   }
    // }
}

export const logger = new Logger();
