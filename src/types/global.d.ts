/**
 * Global Type Definitions
 */

/// <reference types="vite/client" />

// ============================================================================
// Environment Variables
// ============================================================================

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_ENV: 'development' | 'production' | 'staging';
    readonly VITE_ENABLE_DEBUG: string;
    readonly VITE_STORAGE_KEY?: string;
    readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// ============================================================================
// Module Declarations
// ============================================================================

declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}

declare module '*.webp' {
    const value: string;
    export default value;
}
