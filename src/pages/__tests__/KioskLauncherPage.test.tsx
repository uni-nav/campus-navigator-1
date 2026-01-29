import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import KioskLauncherPage from '@/pages/KioskLauncherPage';

vi.mock('@/lib/api/client', () => ({
  kiosksApi: {
    getAll: vi.fn(),
  },
  floorsApi: {
    getAll: vi.fn(),
  },
}));

const mockKiosks = [
  { id: 1, name: 'Kiosk 1', floor_id: 1, waypoint_id: 'wp_1', description: null },
  { id: 2, name: 'Kiosk 2', floor_id: 2, waypoint_id: 'wp_2', description: null },
];

const mockFloors = [
  { id: 1, name: 'Qavat 1', floor_number: 1, image_url: null, image_width: null, image_height: null, created_at: '' },
  { id: 2, name: 'Qavat 2', floor_number: 2, image_url: null, image_width: null, image_height: null, created_at: '' },
];

const getMocks = async () => {
  const mod = await import('@/lib/api/client');
  return {
    kiosksApi: mod.kiosksApi as unknown as { getAll: ReturnType<typeof vi.fn> },
    floorsApi: mod.floorsApi as unknown as { getAll: ReturnType<typeof vi.fn> },
  };
};

describe('KioskLauncherPage', () => {
  beforeEach(async () => {
    const { kiosksApi, floorsApi } = await getMocks();
    kiosksApi.getAll.mockResolvedValue(mockKiosks);
    floorsApi.getAll.mockResolvedValue(mockFloors);
  });

  it('renders kiosk list', async () => {
    render(<KioskLauncherPage />);
    expect(await screen.findByText(/Kiosk 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Kiosk 2/i)).toBeInTheDocument();
  });
});
