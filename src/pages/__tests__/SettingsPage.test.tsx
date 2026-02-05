import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import SettingsPage from '@/pages/SettingsPage';

const mocks = vi.hoisted(() => ({
  setApiUrl: vi.fn(),
  setAdminToken: vi.fn(),
  setIsApiConnected: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
  useAppStore: <T,>(
    selector?: (s: {
      apiUrl: string;
      setApiUrl: () => void;
      isApiConnected: boolean;
      setIsApiConnected: () => void;
    }) => T
  ) => {
    const state = {
      apiUrl: 'http://localhost:8000',
      setApiUrl: vi.fn(),
      isApiConnected: false,
      setIsApiConnected: mocks.setIsApiConnected,
    };
    return selector ? selector(state) : (state as unknown as T);
  },
}));

vi.mock('@/lib/api/client', () => ({
  setApiUrl: mocks.setApiUrl,
  getApiUrl: () => 'http://localhost:8000',
  getAdminToken: () => '',
  setAdminToken: mocks.setAdminToken,
  healthCheck: vi.fn().mockResolvedValue(true),
  navigationApi: { audit: vi.fn().mockResolvedValue({}) },
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mocks.setApiUrl.mockReset();
    mocks.setAdminToken.mockReset();
    mocks.setIsApiConnected.mockReset();
  });

  it('renders API and token sections', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/API sozlamalari/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin token/i)).toBeInTheDocument();
  });

  it('saves admin token', () => {
    render(<SettingsPage />);
    fireEvent.change(screen.getByLabelText(/Admin token/i), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByText(/Tokenni saqlash/i));
    expect(mocks.setAdminToken).toHaveBeenCalledWith('secret');
  });
});
