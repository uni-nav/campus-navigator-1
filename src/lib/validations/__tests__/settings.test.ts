import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
    apiSettingsSchema,
    kioskSettingsSchema,
} from '../settings';

describe('Settings Validation Schemas', () => {
    describe('apiSettingsSchema', () => {
        it('should validate correct API settings', () => {
            const validData = {
                apiUrl: 'http://localhost:8000',
                adminToken: 'valid_token_123',
            };
            expect(() => apiSettingsSchema.parse(validData)).not.toThrow();
        });

        it('should accept empty admin token', () => {
            const validData = {
                apiUrl: 'https://api.example.com',
                adminToken: '',
            };
            expect(() => apiSettingsSchema.parse(validData)).not.toThrow();
        });

        it('should reject invalid URL format', () => {
            const invalidData = {
                apiUrl: 'not-a-url',
                adminToken: 'token123',
            };
            expect(() => apiSettingsSchema.parse(invalidData)).toThrow();
        });

        it('should reject URL without http/https protocol', () => {
            const invalidData = {
                apiUrl: 'ftp://example.com',
            };
            expect(() => apiSettingsSchema.parse(invalidData)).toThrow();
        });

        it('should reject too short admin token', () => {
            const invalidData = {
                apiUrl: 'http://localhost:8000',
                adminToken: 'short',
            };
            expect(() => apiSettingsSchema.parse(invalidData)).toThrow();
        });
    });

    describe('kioskSettingsSchema', () => {
        it('should validate correct kiosk settings', () => {
            const validData = {
                kioskId: 1,
                waypointId: 10,
            };
            expect(() => kioskSettingsSchema.parse(validData)).not.toThrow();
        });

        it('should reject negative kiosk ID', () => {
            const invalidData = {
                kioskId: -1,
                waypointId: 10,
            };
            expect(() => kioskSettingsSchema.parse(invalidData)).toThrow();
        });

        it('should reject zero kiosk ID', () => {
            const invalidData = {
                kioskId: 0,
                waypointId: 10,
            };
            expect(() => kioskSettingsSchema.parse(invalidData)).toThrow();
        });

        it('should reject decimal kiosk ID', () => {
            const invalidData = {
                kioskId: 1.5,
                waypointId: 10,
            };
            expect(() => kioskSettingsSchema.parse(invalidData)).toThrow();
        });

        it('should accept null waypoint ID', () => {
            const validData = {
                kioskId: 1,
                waypointId: null,
            };
            expect(() => kioskSettingsSchema.parse(validData)).not.toThrow();
        });
    });
});
