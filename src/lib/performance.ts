/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS) and custom metrics
 */

import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { captureMessage, addBreadcrumb } from './sentry';
import { config } from './config';

interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

/**
 * Web Vitals thresholds (based on Google's recommendations)
 */
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 },   // First Input Delay
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte
    INP: { good: 200, poor: 500 },   // Interaction to Next Paint
};

/**
 * Handler for Web Vitals metrics
 */
function handleMetric(metric: Metric): void {
    const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
    };

    // Log in development
    if (config.isDevelopment) {
        const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(
            `[Web Vitals] ${emoji} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`
        );
    }

    // Send to analytics/monitoring
    reportMetric(performanceMetric);
}

/**
 * Report metric to monitoring systems
 */
function reportMetric(metric: PerformanceMetric): void {
    // Add breadcrumb for Sentry
    addBreadcrumb('performance', `Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
    });

    // Send critical metrics to Sentry
    if (metric.rating === 'poor') {
        captureMessage(
            `Poor Web Vital: ${metric.name} = ${metric.value.toFixed(2)}`,
            'warning'
        );
    }

    // TODO: Send to analytics service (Google Analytics, custom backend, etc.)
    // Example: sendToAnalytics(metric);
}

/**
 * Initialize Web Vitals monitoring
 * Should be called once after app mounts
 */
export function initWebVitals(): void {
    try {
        // Core Web Vitals (2024 standard: LCP, CLS, INP)
        onLCP(handleMetric);  // Largest Contentful Paint
        onCLS(handleMetric);  // Cumulative Layout Shift
        onINP(handleMetric);  // Interaction to Next Paint

        // Additional metrics
        onFCP(handleMetric);  // First Contentful Paint
        onTTFB(handleMetric); // Time to First Byte

        if (config.isDevelopment) {
            console.log('[Web Vitals] Monitoring initialized');
        }
    } catch (error) {
        console.error('[Web Vitals] Failed to initialize:', error);
    }
}

/**
 * Custom performance timing
 */
export function measureTiming(name: string, startTime: number): number {
    const duration = performance.now() - startTime;

    if (config.isDevelopment) {
        console.log(`[Timing] ${name}: ${duration.toFixed(2)}ms`);
    }

    addBreadcrumb('timing', name, { duration });

    return duration;
}

/**
 * Start a performance measurement
 */
export function startTiming(): number {
    return performance.now();
}

/**
 * Mark a performance event
 */
export function markEvent(name: string): void {
    try {
        performance.mark(name);
        addBreadcrumb('performance', `Mark: ${name}`);
    } catch {
        // Performance API may not be available in all environments
    }
}

/**
 * Measure between two marks
 */
export function measureEvent(name: string, startMark: string, endMark: string): number | null {
    try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, 'measure');
        const duration = entries[entries.length - 1]?.duration ?? null;

        if (duration !== null) {
            addBreadcrumb('performance', `Measure: ${name}`, { duration });
        }

        return duration;
    } catch {
        return null;
    }
}

/**
 * Get current memory usage (if available)
 */
export function getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number } | null {
    const memory = (performance as any).memory;
    if (!memory) return null;

    return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
    };
}

/**
 * Log performance summary (for debugging)
 */
export function logPerformanceSummary(): void {
    if (!config.isDevelopment) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
        console.group('[Performance Summary]');
        console.log(`DNS Lookup: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
        console.log(`TCP Connection: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
        console.log(`Request/Response: ${(navigation.responseEnd - navigation.requestStart).toFixed(2)}ms`);
        console.log(`DOM Processing: ${(navigation.domComplete - navigation.domInteractive).toFixed(2)}ms`);
        console.log(`Page Load: ${(navigation.loadEventEnd - navigation.startTime).toFixed(2)}ms`);
        console.groupEnd();
    }

    const memory = getMemoryUsage();
    if (memory) {
        console.log(`[Memory] Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }
}
