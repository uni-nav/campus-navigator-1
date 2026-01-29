/**
 * Application Configuration
 * Centralized config loaded from environment variables
 */

export const config = {
    // API Configuration
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',

    // App Info
    appName: import.meta.env.VITE_APP_NAME || 'University Navigation',
    environment: import.meta.env.VITE_ENV || 'development',

    // Feature Flags
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',

    // Computed values
    isProduction: import.meta.env.VITE_ENV === 'production',
    isDevelopment: import.meta.env.DEV,
} as const;

// Type for environment variables (helps with IDE autocomplete)
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_ENV: 'development' | 'production' | 'staging';
    readonly VITE_ENABLE_DEBUG: string;
    readonly VITE_STORAGE_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
