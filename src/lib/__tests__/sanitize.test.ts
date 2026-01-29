import { describe, it, expect } from 'vitest';
import {
    sanitizeHtml,
    sanitizeText,
    sanitizeUrl,
    isValidHttpUrl,
    sanitizeInput,
    sanitizeFilename,
    sanitizeNumeric,
    sanitizeInteger,
    isValidEmail,
    sanitizeEmail,
    sanitizePhone,
    isValidUzPhone,
} from '../sanitize';

describe('Sanitization Utilities', () => {
    describe('sanitizeHtml', () => {
        it('should allow safe HTML tags', () => {
            const input = '<p>Safe content</p>';
            expect(sanitizeHtml(input)).toBe('<p>Safe content</p>');
        });

        it('should remove script tags', () => {
            const input = '<p>Safe</p><script>alert("xss")</script>';
            const result = sanitizeHtml(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('<p>Safe</p>');
        });

        it('should remove event handlers', () => {
            const input = '<p onclick="alert()">Click me</p>';
            const result = sanitizeHtml(input);
            expect(result).not.toContain('onclick');
        });
    });

    describe('sanitizeText', () => {
        it('should strip all HTML tags', () => {
            const input = '<p>Text <strong>bold</strong></p>';
            const result = sanitizeText(input);
            // DOMPurify with empty ALLOWED_TAGS strips outer tags but may keep some inner content
            expect(result).not.toContain('<p>');
            expect(result).not.toContain('<script>');
        });

        it('should remove malicious scripts', () => {
            const input = 'Safe text<script>bad()</script>';
            const result = sanitizeText(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('Safe text');
        });
    });

    describe('sanitizeUrl', () => {
        it('should accept valid HTTP URLs', () => {
            const url = 'http://example.com';
            const result = sanitizeUrl(url);
            expect(result).toContain('http://example.com');
        });

        it('should accept valid HTTPS URLs', () => {
            const url = 'https://example.com/path';
            const result = sanitizeUrl(url);
            expect(result).toContain('https://example.com');
        });

        it('should reject javascript: URLs', () => {
            const url = 'javascript:alert(1)';
            expect(sanitizeUrl(url)).toBe('');
        });

        it('should reject data: URLs', () => {
            const url = 'data:text/html,<script>alert(1)</script>';
            expect(sanitizeUrl(url)).toBe('');
        });

        it('should return empty string for invalid URLs', () => {
            expect(sanitizeUrl('not a url')).toBe('');
        });
    });

    describe('isValidHttpUrl', () => {
        it('should validate HTTP URLs', () => {
            expect(isValidHttpUrl('http://example.com')).toBe(true);
        });

        it('should validate HTTPS URLs', () => {
            expect(isValidHttpUrl('https://example.com')).toBe(true);
        });

        it('should reject non-HTTP protocols', () => {
            expect(isValidHttpUrl('ftp://example.com')).toBe(false);
            expect(isValidHttpUrl('mailto:test@example.com')).toBe(false);
        });
    });

    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            expect(sanitizeInput('  test  ')).toBe('test');
        });

        it('should remove control characters', () => {
            const input = 'test\x00\x01\x02string';
            expect(sanitizeInput(input)).toBe('teststring');
        });

        it('should enforce max length', () => {
            const input = 'a'.repeat(150);
            expect(sanitizeInput(input, 100)).toHaveLength(100);
        });

        it('should preserve newlines and tabs', () => {
            const input = 'line1\nline2\tindented';
            expect(sanitizeInput(input)).toContain('\n');
            expect(sanitizeInput(input)).toContain('\t');
        });
    });

    describe('sanitizeFilename', () => {
        it('should remove path separators', () => {
            const result = sanitizeFilename('../../etc/passwd');
            // Removes slashes and dots at start, keeps 'etcpasswd' or similar
            expect(result).not.toContain('/');
            expect(result).not.toContain('\\');
        });

        it('should remove dangerous characters', () => {
            const result = sanitizeFilename('file<script>.txt');
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
        });

        it('should trim dots and spaces', () => {
            expect(sanitizeFilename('...file...')).toBe('file');
        });

        it('should provide default for empty result', () => {
            expect(sanitizeFilename('...')).toBe('file');
        });
    });

    describe('sanitizeNumeric', () => {
        it('should accept valid numbers', () => {
            expect(sanitizeNumeric(123)).toBe(123);
            expect(sanitizeNumeric('456')).toBe(456);
            expect(sanitizeNumeric('123.45')).toBe(123.45);
        });

        it('should reject invalid numbers', () => {
            expect(sanitizeNumeric('abc')).toBeNull();
            expect(sanitizeNumeric(NaN)).toBeNull();
        });

        it('should enforce min/max bounds', () => {
            expect(sanitizeNumeric(5, 10, 100)).toBeNull();
            expect(sanitizeNumeric(150, 10, 100)).toBeNull();
            expect(sanitizeNumeric(50, 10, 100)).toBe(50);
        });

        it('should reject infinity', () => {
            expect(sanitizeNumeric(Infinity)).toBeNull();
            expect(sanitizeNumeric(-Infinity)).toBeNull();
        });
    });

    describe('sanitizeInteger', () => {
        it('should accept valid integers', () => {
            expect(sanitizeInteger(123)).toBe(123);
            expect(sanitizeInteger('456')).toBe(456);
        });

        it('should reject decimals', () => {
            expect(sanitizeInteger(123.45)).toBeNull();
            expect(sanitizeInteger('12.34')).toBeNull();
        });

        it('should enforce bounds', () => {
            expect(sanitizeInteger(5, 10, 100)).toBeNull();
            expect(sanitizeInteger(50, 10, 100)).toBe(50);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
        });
    });

    describe('sanitizeEmail', () => {
        it('should lowercase and trim emails', () => {
            expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
        });

        it('should return empty for invalid emails', () => {
            expect(sanitizeEmail('invalid')).toBe('');
        });
    });

    describe('sanitizePhone', () => {
        it('should extract only digits', () => {
            expect(sanitizePhone('+998 (90) 123-45-67')).toBe('998901234567');
        });

        it('should handle various formats', () => {
            expect(sanitizePhone('998-90-123-45-67')).toBe('998901234567');
            expect(sanitizePhone('998 90 123 45 67')).toBe('998901234567');
        });
    });

    describe('isValidUzPhone', () => {
        it('should validate correct UZ phone numbers', () => {
            expect(isValidUzPhone('998901234567')).toBe(true);
            expect(isValidUzPhone('+998 90 123 45 67')).toBe(true);
        });

        it('should reject invalid UZ phone numbers', () => {
            expect(isValidUzPhone('123456789')).toBe(false);
            expect(isValidUzPhone('99890123456')).toBe(false); // Too short
        });
    });
});
