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
            const call = (console.log as any).mock.calls[0];
            expect(call[0]).toContain('INFO:');
            expect(call[1]).toBe('Test info message');
        });

        it('should log info with data', () => {
            const data = { userId: 123 };
            logger.info('User action', data);
            expect(console.log).toHaveBeenCalled();
            const call = (console.log as any).mock.calls[0];
            expect(call[1]).toBe('User action');
            expect(call[2]).toEqual(data);
        });
    });

    describe('warn', () => {
        it('should log warnings', () => {
            logger.warn('Warning message');
            expect(console.warn).toHaveBeenCalled();
            const call = (console.warn as any).mock.calls[0];
            expect(call[0]).toContain('WARN:');
            expect(call[1]).toBe('Warning message');
        });
    });

    describe('error', () => {
        it('should log errors', () => {
            const error = new Error('Test error');
            logger.error('Error occurred', error);
            expect(console.error).toHaveBeenCalled();
            const call = (console.error as any).mock.calls[0];
            expect(call[0]).toContain('ERROR:');
            expect(call[1]).toBe('Error occurred');
            expect(call[2]).toBe(error);
        });

        it('should log errors without error object', () => {
            logger.error('Simple error message');
            expect(console.error).toHaveBeenCalled();
            const call = (console.error as any).mock.calls[0];
            expect(call[0]).toContain('ERROR:');
            expect(call[1]).toBe('Simple error message');
        });
    });

    describe('debug', () => {
        it('should log debug messages when debug is enabled', () => {
            logger.debug('Debug info', { details: 'test' });
            expect(console.log).toHaveBeenCalled();
            const call = (console.log as any).mock.calls[0];
            expect(call[0]).toContain('DEBUG:');
            expect(call[1]).toBe('Debug info');
        });
    });

    describe('apiError', () => {
        it('should log API errors with endpoint', () => {
            const error = new Error('API failed');
            logger.apiError('/api/rooms', error);
            expect(console.error).toHaveBeenCalled();
            const call = (console.error as any).mock.calls[0];
            expect(call[0]).toContain('ERROR:');
            expect(call[1]).toContain('/api/rooms');
            expect(call[2]).toBe(error);
        });
    });
});
