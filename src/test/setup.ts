import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock environment variables
vi.mock('import.meta', () => ({
    env: {
        VITE_API_URL: 'http://localhost:8000',
        VITE_APP_NAME: 'Test App',
        VITE_ENV: 'test',
        VITE_ENABLE_DEBUG: 'false',
    },
}));

// Suppress console errors in tests (optional)
global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
};

// Minimal ResizeObserver mock for layout-related components
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// @ts-expect-error - allow global assignment in test env
global.ResizeObserver = ResizeObserverMock;
