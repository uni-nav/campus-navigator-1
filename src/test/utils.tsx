import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a test query client
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

// Custom render with providers
interface AllTheProvidersProps {
    children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
    const testQueryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={testQueryClient}>
            <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
    );
}

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
