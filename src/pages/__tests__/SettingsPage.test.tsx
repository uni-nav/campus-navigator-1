import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import SettingsPage from '@/pages/SettingsPage';

const setApiUrlMock = vi.fn();
const setAdminTokenMock = vi.fn();
const setIsApiConnectedMock = vi.fn();

vi.mock('@/lib/store', () => ({
  useAppStore: () => ({
    apiUrl: 'http://localhost:8000',
    setApiUrl: vi.fn(),
    isApiConnected: false,
    setIsApiConnected: setIsApiConnectedMock,
  }),
}));

vi.mock('@/lib/api/client', () => ({
  setApiUrl: setApiUrlMock,
  getApiUrl: () => 'http://localhost:8000',
  getAdminToken: () => '',
  setAdminToken: setAdminTokenMock,
  healthCheck: vi.fn().mockResolvedValue(true),
  navigationApi: { audit: vi.fn().mockResolvedValue({}) },
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    setApiUrlMock.mockReset();
    setAdminTokenMock.mockReset();
    setIsApiConnectedMock.mockReset();
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
    expect(setAdminTokenMock).toHaveBeenCalledWith('secret');
  });
});
