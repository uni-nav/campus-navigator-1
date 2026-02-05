/**
 * Input Sanitization Utilities
 * Provides functions to sanitize and validate user inputs
 */

import DOMPurify from 'dompurify';

// ============================================================================
// HTML Sanitization
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes script tags, event handlers, and dangerous attributes
 * 
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * const clean = sanitizeHtml('<p>Safe</p><script>alert("xss")</script>');
 * // Returns: '<p>Safe</p>'
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'title', 'target'],
        ALLOW_DATA_ATTR: false,
    });
}

/**
 * Sanitize HTML for display in text inputs (strips all tags)
 * 
 * @param dirty - Untrusted string that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function sanitizeText(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
}

// ============================================================================
// URL Sanitization
// ============================================================================

/**
 * Validate and sanitize URL
 * Ensures URL uses safe protocols (http, https, mailto)
 * 
 * @param url - URL string to validate
 * @returns Sanitized URL or empty string if invalid
 * 
 * @example
 * sanitizeUrl('https://example.com') // ✅ Returns: 'https://example.com'
 * sanitizeUrl('javascript:alert(1)') // ❌ Returns: ''
 */
export function sanitizeUrl(url: string): string {
    try {
        const trimmed = url.trim();
        if (!trimmed) return '';

        // Parse URL
        const parsed = new URL(trimmed);

        // Only allow safe protocols
        const safeProtocols = ['http:', 'https:', 'mailto:'];
        if (!safeProtocols.includes(parsed.protocol)) {
            return '';
        }

        return parsed.toString();
    } catch {
        // Invalid URL
        return '';
    }
}

/**
 * Validate if string is a valid HTTP/HTTPS URL
 * 
 * @param url - String to validate
 * @returns True if valid HTTP(S) URL
 */
export function isValidHttpUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

// ============================================================================
// General Input Sanitization
// ============================================================================

/**
 * Sanitize general text input
 * Trims whitespace and removes control characters
 * 
 * @param input - User input string
 * @param maxLength - Optional maximum length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
    // Remove null bytes and control characters (except newline and tab)
    // eslint-disable-next-line no-control-regex
    let cleaned = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    // Enforce max length
    if (cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength);
    }

    return cleaned;
}

/**
 * Sanitize filename
 * Removes path traversal attempts and dangerous characters
 * 
 * @param filename - Filename to sanitize
 * @returns Safe filename
 * 
 * @example
 * sanitizeFilename('../../etc/passwd') // Returns: 'passwd'
 * sanitizeFilename('file<script>.txt') // Returns: 'filescript.txt'
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators
    let cleaned = filename.replace(/[/\\]/g, '');

    // Remove dangerous characters
    // eslint-disable-next-line no-control-regex
    cleaned = cleaned.replace(/[<>:"|?*\x00-\x1f]/g, '');

    // Trim dots and spaces from start/end
    cleaned = cleaned.replace(/^[.\s]+|[.\s]+$/g, '');

    // Ensure filename is not empty
    if (!cleaned) {
        cleaned = 'file';
    }

    return cleaned;
}

// ============================================================================
// Numeric Validation
// ============================================================================

/**
 * Validate and sanitize numeric input
 * 
 * @param value - Value to validate (string or number)
 * @param min - Optional minimum value
 * @param max - Optional maximum value
 * @returns Validated number or null if invalid
 * 
 * @example
 * sanitizeNumeric('123', 0, 1000) // Returns: 123
 * sanitizeNumeric('abc') // Returns: null
 * sanitizeNumeric('999', 0, 100) // Returns: null (exceeds max)
 */
export function sanitizeNumeric(
    value: string | number,
    min?: number,
    max?: number
): number | null {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    // Check if valid number
    if (isNaN(num) || !isFinite(num)) {
        return null;
    }

    // Check min/max bounds
    if (min !== undefined && num < min) {
        return null;
    }
    if (max !== undefined && num > max) {
        return null;
    }

    return num;
}

/**
 * Validate integer input
 * 
 * @param value - Value to validate
 * @param min - Optional minimum value
 * @param max - Optional maximum value
 * @returns Validated integer or null if invalid
 */
export function sanitizeInteger(
    value: string | number,
    min?: number,
    max?: number
): number | null {
    const num = sanitizeNumeric(value, min, max);

    if (num === null) {
        return null;
    }

    // Must be integer
    if (!Number.isInteger(num)) {
        return null;
    }

    return num;
}

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Basic email validation
 * Uses simple regex - for production use proper validation library
 * 
 * @param email - Email string to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Sanitize email input
 * 
 * @param email - Email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
    const trimmed = email.trim().toLowerCase();
    return isValidEmail(trimmed) ? trimmed : '';
}

// ============================================================================
// SQL Injection Prevention (for display purposes)
// ============================================================================

/**
 * Escape special characters that could be used in SQL injection
 * NOTE: This is NOT a replacement for parameterized queries on backend!
 * Only use for display/logging purposes
 * 
 * @param input - String to escape
 * @returns Escaped string
 */
export function escapeSqlLike(input: string): string {
    return input
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');
}

// ============================================================================
// Phone Number Sanitization
// ============================================================================

/**
 * Sanitize phone number (removes non-numeric characters)
 * 
 * @param phone - Phone number string
 * @returns Digits only
 * 
 * @example
 * sanitizePhone('+998 (90) 123-45-67') // Returns: '998901234567'
 */
export function sanitizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

/**
 * Validate Uzbekistan phone number format
 * 
 * @param phone - Phone number to validate
 * @returns True if valid UZ phone number
 */
export function isValidUzPhone(phone: string): boolean {
    const digits = sanitizePhone(phone);
    // UZ format: 998XXXXXXXXX (12 digits total)
    return /^998\d{9}$/.test(digits);
}
