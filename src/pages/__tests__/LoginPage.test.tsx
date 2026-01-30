import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import LoginPage from '@/pages/LoginPage';

const mockNavigate = vi.fn();
const setApiUrlMock = vi.fn();
const setAdminTokenMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/lib/store', () => ({
  useAppStore: () => ({ setApiUrl: vi.fn() }),
}));

vi.mock('@/lib/api/client', () => ({
  getApiUrl: () => 'http://localhost:8000',
  setApiUrl: setApiUrlMock,
  getAdminToken: () => '',
  setAdminToken: setAdminTokenMock,
  healthCheck: vi.fn().mockResolvedValue(true),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    setApiUrlMock.mockReset();
    setAdminTokenMock.mockReset();
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
    fireEvent.click(screen.getByText(/Kirish/i));
    expect(setAdminTokenMock).toHaveBeenCalledWith('test-token');
    expect(mockNavigate).toHaveBeenCalledWith('/floors', { replace: true });
  });
});
