import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import LoginPage from '@/pages/LoginPage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setApiUrl: vi.fn(),
  setAdminToken: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

const storeMocks = vi.hoisted(() => ({
  setApiUrl: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
  useAppStore: <T,>(selector?: (s: { setApiUrl: () => void }) => T) => {
    const state = { setApiUrl: storeMocks.setApiUrl };
    return selector ? selector(state) : (state as unknown as T);
  },
}));

vi.mock('@/lib/api/client', () => ({
  getApiUrl: () => 'http://localhost:8000',
  setApiUrl: mocks.setApiUrl,
  getAdminToken: () => '',
  setAdminToken: mocks.setAdminToken,
  healthCheck: vi.fn().mockResolvedValue(true),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.setApiUrl.mockReset();
    mocks.setAdminToken.mockReset();
    storeMocks.setApiUrl.mockReset();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Admin kirish/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API manzili/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin token/i)).toBeInTheDocument();
  });

  it('saves token and navigates on login', () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Admin token/i), {
      target: { value: 'test-token' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Kirish$/i }));
    expect(mocks.setAdminToken).toHaveBeenCalledWith('test-token');
    expect(mocks.navigate).toHaveBeenCalledWith('/floors', { replace: true });
  });
});
