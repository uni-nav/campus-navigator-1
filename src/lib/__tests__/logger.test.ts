import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock config before importing logger
vi.mock('./config', () => ({
    config: {
        isDevelopment: true,
        enableDebug: true,
        isProduction: false,
    },
}));

// Import logger after mock
import { logger } from '../logger';

describe('Logger', () => {
    const originalConsole = { ...console };

    beforeEach(() => {
        // Mock console methods
        console.log = vi.fn();
        console.info = vi.fn();
        console.warn = vi.fn();
        console.error = vi.fn();
        console.debug = vi.fn();
    });

    afterEach(() => {
        // Restore console
        Object.assign(console, originalConsole);
        vi.clearAllMocks();
    });

    describe('info', () => {
        it('should log info messages in development', () => {
            logger.info('Test info message');
            expect(console.log).toHaveBeenCalled();
            const call = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
            const [prefix, message] = call as [string, string, ...unknown[]];
            expect(prefix).toContain('INFO:');
            expect(message).toBe('Test info message');
        });

        it('should log info with data', () => {
            const data = { userId: 123 };
            logger.info('User action', data);
            expect(console.log).toHaveBeenCalled();
            const call = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
            const [, message, payload] = call as [unknown, string, unknown];
            expect(message).toBe('User action');
            expect(payload).toEqual(data);
        });
    });

    describe('warn', () => {
        it('should log warnings', () => {
            logger.warn('Warning message');
            expect(console.warn).toHaveBeenCalled();
            const call = (console.warn as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
            const [prefix, message] = call as [string, string, ...unknown[]];
            expect(prefix).toContain('WARN:');
            expect(message).toBe('Warning message');
        });
    });

    describe('error', () => {
        it('should log errors', () => {
            const error = new Error('Test error');
            logger.error('Error occurred', error);
            expect(console.error).toHaveBeenCalled();
            const call = (console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
            const [prefix, message, err] = call as [string, string, unknown];
            expect(prefix).toContain('ERROR:');
            expect(message).toBe('Error occurred');
            expect(err).toBe(error);
        });

        it('should log errors without error object', () => {
            logger.error('Simple error message');
            expect(console.error).toHaveBeenCalled();
            const call = (console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
            const [prefix, message] = call as [string, string, ...unknown[]];
            expect(prefix).toContain('ERROR:');
            expect(message).toBe('Simple error message');
        });
    });

    describe('debug', () => {
        it('should log debug messages when debug is enabled', () => {
            logger.debug('Debug info', { details: 'test' });
            expect(console.log).toHaveBeenCalled();
            const call = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
            const [prefix, message] = call as [string, string, ...unknown[]];
            expect(prefix).toContain('DEBUG:');
            expect(message).toBe('Debug info');
        });
    });

    describe('apiError', () => {
        it('should log API errors with endpoint', () => {
            const error = new Error('API failed');
            logger.apiError('/api/rooms', error);
            expect(console.error).toHaveBeenCalled();
            const call = (console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
            const [prefix, message, err] = call as [string, string, unknown];
            expect(prefix).toContain('ERROR:');
            expect(message).toContain('/api/rooms');
            expect(err).toBe(error);
        });
    });
});
