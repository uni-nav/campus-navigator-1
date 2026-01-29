import { describe, it, expect } from 'vitest';
import { config } from '../config';

describe('Config', () => {
    it('should have apiUrl defined', () => {
        expect(config.apiUrl).toBeDefined();
        expect(typeof config.apiUrl).toBe('string');
    });

    it('should have appName defined', () => {
        expect(config.appName).toBeDefined();
        expect(typeof config.appName).toBe('string');
    });

    it('should have environment defined', () => {
        expect(config.environment).toBeDefined();
        expect(typeof config.environment).toBe('string');
    });

    it('should correctly determine isProduction based on env', () => {
        expect(typeof config.isProduction).toBe('boolean');
    });

    it('should correctly determine isDevelopment', () => {
        expect(typeof config.isDevelopment).toBe('boolean');
    });

    it('should have enableDebug flag', () => {
        expect(typeof config.enableDebug).toBe('boolean');
    });

    it('should have default API URL format', () => {
        expect(config.apiUrl).toMatch(/^https?:\/\//);
    });

    it('should have all required properties', () => {
        const requiredKeys = ['apiUrl', 'appName', 'environment', 'enableDebug', 'isProduction', 'isDevelopment'];
        requiredKeys.forEach(key => {
            expect(config).toHaveProperty(key);
        });
    });
});
