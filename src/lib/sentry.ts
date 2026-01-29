/**
 * Sentry Error Monitoring Integration
 * Provides error tracking, performance monitoring, and user feedback
 */

import * as Sentry from '@sentry/react';
import { config } from './config';

// Check if Sentry DSN is configured
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

/**
 * Initialize Sentry error monitoring
 * Should be called once in main.tsx before React renders
 */
export function initSentry(): void {
    if (!SENTRY_DSN) {
        if (config.isDevelopment) {
            console.log('[Sentry] No DSN configured, error tracking disabled');
        }
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,

        // Environment configuration
        environment: config.environment,

        // Performance monitoring
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                // Capture 10% of all sessions
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Performance sampling
        tracesSampleRate: config.isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev

        // Session replay sampling
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% when error occurs

        // Release tracking
        release: `university-nav@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

        // Filter sensitive data
        beforeSend(event) {
            // Don't send events in development (unless testing)
            if (config.isDevelopment && !import.meta.env.VITE_SENTRY_TEST) {
                return null;
            }

            // Remove sensitive headers
            if (event.request?.headers) {
                delete event.request.headers['Authorization'];
                delete event.request.headers['Cookie'];
            }

            return event;
        },

        // Filter breadcrumbs
        beforeBreadcrumb(breadcrumb) {
            // Don't log console messages as breadcrumbs
            if (breadcrumb.category === 'console') {
                return null;
            }
            return breadcrumb;
        },

        // Ignore common non-actionable errors
        ignoreErrors: [
            // Network errors
            'Network request failed',
            'Failed to fetch',
            'NetworkError',
            // User abort
            'AbortError',
            // Browser extensions
            /^chrome-extension:\/\//,
            /^moz-extension:\/\//,
            // Resize observer (common browser noise)
            'ResizeObserver loop limit exceeded',
        ],
    });

    if (config.isDevelopment) {
        console.log('[Sentry] Initialized successfully');
    }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string; username?: string } | null): void {
    if (!SENTRY_DSN) return;

    if (user) {
        Sentry.setUser(user);
    } else {
        Sentry.setUser(null);
    }
}

/**
 * Add custom context to errors
 */
export function setContext(name: string, context: Record<string, unknown>): void {
    if (!SENTRY_DSN) return;
    Sentry.setContext(name, context);
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
    if (!SENTRY_DSN) {
        console.error('[Error captured]', error, context);
        return;
    }

    Sentry.withScope((scope) => {
        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
        }
        Sentry.captureException(error);
    });
}

/**
 * Capture a message (info, warning, etc.)
 */
export function captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info'
): void {
    if (!SENTRY_DSN) {
        console.log(`[${level.toUpperCase()}]`, message);
        return;
    }

    Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
    category: string,
    message: string,
    data?: Record<string, unknown>
): void {
    if (!SENTRY_DSN) return;

    Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: 'info',
    });
}

/**
 * Start a performance transaction
 */
export function startTransaction(
    name: string,
    op: string
): ReturnType<typeof Sentry.startInactiveSpan> | null {
    if (!SENTRY_DSN) return null;

    return Sentry.startInactiveSpan({
        name,
        op,
    });
}

// Export Sentry for advanced usage
export { Sentry };
