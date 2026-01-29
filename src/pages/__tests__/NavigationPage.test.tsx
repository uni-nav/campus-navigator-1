import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import NavigationPage from '@/pages/NavigationPage';

vi.mock('fabric', () => {
  class FabricCanvas {
    width = 700;
    height = 500;
    backgroundColor = '';
    constructor() {}
    clear() {}
    add() {}
    sendObjectToBack() {}
    renderAll() {}
    dispose() {}
    setWidth() {}
    setHeight() {}
    calcOffset() {}
  }
  class FabricImage {
    width = 1000;
    height = 800;
    static async fromURL() {
      return new FabricImage();
    }
    set() {}
  }
  class Circle {
    constructor() {}
  }
  class Polyline {
    constructor() {}
  }
  return { Canvas: FabricCanvas, FabricImage, Circle, Polyline };
});

vi.mock('@/lib/api/client', () => ({
  roomsApi: {
    getAll: vi.fn(),
  },
  floorsApi: {
    getAll: vi.fn(),
  },
  kiosksApi: {
    getAll: vi.fn(),
  },
  navigationApi: {
    findPath: vi.fn(),
  },
  getApiUrl: () => 'http://localhost:8000',
}));

const getMocks = async () => {
  const mod = await import('@/lib/api/client');
  return {
    roomsApi: mod.roomsApi as unknown as { getAll: ReturnType<typeof vi.fn> },
    floorsApi: mod.floorsApi as unknown as { getAll: ReturnType<typeof vi.fn> },
    kiosksApi: mod.kiosksApi as unknown as { getAll: ReturnType<typeof vi.fn> },
  };
};

describe('NavigationPage', () => {
  beforeEach(async () => {
    const { roomsApi, floorsApi, kiosksApi } = await getMocks();
    roomsApi.getAll.mockResolvedValue([
      { id: 1, name: '101-xona', floor_id: 1, waypoint_id: 'wp_1' },
    ]);
    floorsApi.getAll.mockResolvedValue([
      { id: 1, name: 'Qavat 1', floor_number: 1, image_url: null, image_width: null, image_height: null, created_at: '' },
    ]);
    kiosksApi.getAll.mockResolvedValue([
      { id: 1, name: 'Kiosk 1', floor_id: 1, waypoint_id: 'wp_1' },
    ]);
  });

  it('switches between kiosk and room mode', async () => {
    render(<NavigationPage />);
    expect(await screen.findByText('Boshlanish turi')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Xona'));
    expect(screen.getByPlaceholderText(/Boshlanish xonasi/)).toBeInTheDocument();
  });
});
