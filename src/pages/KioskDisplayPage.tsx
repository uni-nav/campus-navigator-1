import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Clock, Footprints, ArrowRight, RotateCcw, Building2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { floorsApi, kioskApi, getApiUrl } from '@/lib/api/client';
import { Floor, KioskNavigationResponse, KioskFloorDisplay, KioskTransitionDisplay, KioskSearchResult, KioskConfig } from '@/lib/api/types';
import { useAppStore } from '@/lib/store';
import { KioskFloorMap } from '@/components/kiosk/KioskFloorMap';
import { KioskTransitionCard } from '@/components/kiosk/KioskTransitionCard';

// Type guard for transition display
function isTransitionDisplay(display: KioskFloorDisplay | KioskTransitionDisplay): display is KioskTransitionDisplay {
  return 'floor_type' in display && display.floor_type === 'transition';
}

export default function KioskDisplayPage() {
  const { kioskId } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KioskSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [floors, setFloors] = useState<Floor[]>([]);
  const [kioskConfig, setKioskConfig] = useState<KioskConfig | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<KioskSearchResult | null>(null);
  
  const [navigationResult, setNavigationResult] = useState<KioskNavigationResponse | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null);
  const IDLE_TIMEOUT_MS = 60000; // 1 minute

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const floorsData = await floorsApi.getAll();
        setFloors(floorsData);

        // Load kiosk config if kioskId is set
        if (kioskId) {
          try {
            const config = await kioskApi.getConfig(kioskId);
            setKioskConfig(config);
          } catch (err) {
            console.warn('Kiosk config not found:', err);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [kioskId]);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    const timeout = setTimeout(() => {
      handleReset();
    }, IDLE_TIMEOUT_MS);
    setIdleTimeout(timeout);
  }, [idleTimeout]);

  // Handle user interaction
  useEffect(() => {
    const handleInteraction = () => resetIdleTimer();
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keypress', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keypress', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [resetIdleTimer, idleTimeout]);

  // Search rooms with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await kioskApi.searchRooms(searchQuery);
        setSearchResults(results.slice(0, 10));
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle room selection and navigation
  const handleSelectRoom = async (room: KioskSearchResult) => {
    if (!kioskId) {
      setError('Kiosk sozlanmagan. Iltimos, Settings sahifasidan kiosk ID ni kiriting.');
      return;
    }

    setSelectedRoom(room);
    setIsNavigating(true);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);

    try {
      const result = await kioskApi.navigate({
        kiosk_id: kioskId,
        destination_room_id: room.room_id,
      });
      
      if (result.success) {
        setNavigationResult(result);
      } else {
        setError('Yo\'l topilmadi. Iltimos, boshqa xonani tanlang.');
      }
    } catch (err: any) {
      console.error('Navigation failed:', err);
      setError(err?.response?.data?.detail || 'Navigatsiya xatosi yuz berdi');
      setNavigationResult(null);
    } finally {
      setIsNavigating(false);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedRoom(null);
    setNavigationResult(null);
    setIsNavigating(false);
    setError(null);
  };

  const getFloorName = (floorId: number) => {
    const floor = floors.find((f) => f.id === floorId);
    return floor?.name || `${floorId}-qavat`;
  };

  const getFloorImage = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const base = getApiUrl().replace(/\/$/, '');
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${base}${path}`;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Building2 className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">Universitet Navigatsiyasi</h1>
              <p className="text-emerald-100 text-sm">
                {kioskConfig ? kioskConfig.floor_name : 'Xonani qidiring va yo\'l toping'}
              </p>
            </div>
          </div>
          {selectedRoom && (
            <Button 
              variant="secondary" 
              size="lg"
              onClick={handleReset}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Qayta qidirish
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* Error Display */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {!selectedRoom ? (
          /* Search Mode */
          <div className="h-full flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
              <MapPin className="w-20 h-20 mx-auto text-emerald-500" />
              <h2 className="text-3xl font-bold text-gray-800">Qayerga bormoqchisiz?</h2>
              <p className="text-gray-500 text-lg">Xona raqami yoki nomini kiriting</p>
            </div>

            {/* Search Input */}
            <div className="w-full max-w-xl relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Masalan: 105, Kutubxona, Dekanat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-6 text-xl border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-0 overflow-hidden">
                  <ScrollArea className="max-h-96">
                    {searchResults.map((room) => (
                      <button
                        key={room.room_id}
                        onClick={() => handleSelectRoom(room)}
                        disabled={!room.has_waypoint}
                        className="w-full p-4 text-left hover:bg-emerald-50 transition-colors flex items-center gap-4 border-b border-gray-100 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-gray-800">{room.name}</p>
                          <p className="text-gray-500">
                            {room.floor_name}
                            {room.building && ` • ${room.building} blok`}
                          </p>
                          {!room.has_waypoint && (
                            <p className="text-red-500 text-sm">Navigatsiya mavjud emas</p>
                          )}
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </button>
                    ))}
                  </ScrollArea>
                </Card>
              )}

              {/* No Results */}
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 p-8 text-center">
                  <p className="text-gray-500">Hech narsa topilmadi</p>
                </Card>
              )}
            </div>

            {/* Kiosk Config Warning */}
            {!kioskId && (
              <Card className="p-4 bg-amber-50 border-amber-200 max-w-xl">
                <div className="flex items-center gap-3 text-amber-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">
                    Kiosk sozlanmagan. Settings sahifasidan Kiosk ID ni kiriting.
                  </p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Navigation Mode */
          <div className="space-y-6">
            {/* Destination Header */}
            <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-600 font-medium">Manzil</p>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedRoom.name}</h2>
                  <p className="text-gray-500">
                    {selectedRoom.floor_name}
                    {selectedRoom.building && ` • ${selectedRoom.building} blok`}
                  </p>
                </div>
                
                {navigationResult && (
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Footprints className="w-5 h-5" />
                        <span className="text-2xl font-bold">{Math.round(navigationResult.total_distance)}</span>
                      </div>
                      <p className="text-xs text-gray-500">metr</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-2xl font-bold">{Math.round(navigationResult.estimated_time_minutes)}</span>
                      </div>
                      <p className="text-xs text-gray-500">daqiqa</p>
                    </div>
                    {navigationResult.floor_changes > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Building2 className="w-5 h-5" />
                          <span className="text-2xl font-bold">{navigationResult.floor_changes}</span>
                        </div>
                        <p className="text-xs text-gray-500">qavat</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stairs info */}
              {navigationResult?.stairs_used && (
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-emerald-700">
                    <strong>{navigationResult.stairs_used}</strong> orqali yuqoriga/pastga o'ting
                  </p>
                </div>
              )}
            </Card>

            {/* Loading State */}
            {isNavigating && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-pulse text-gray-500 text-lg">Yo'l hisoblanmoqda...</div>
              </div>
            )}

            {/* Navigation Maps */}
            {navigationResult && !isNavigating && (
              <div className="space-y-6">
                {navigationResult.floors_to_display.map((display, index) => (
                  isTransitionDisplay(display) ? (
                    <KioskTransitionCard 
                      key={`transition-${index}`}
                      floorsSkipped={display.floors_passed}
                      getFloorName={getFloorName}
                      stairsName={display.stairs_name}
                      message={display.message}
                    />
                  ) : (
                    <KioskFloorMap
                      key={display.floor_id}
                      floorId={display.floor_id}
                      floorName={display.floor_name}
                      imageUrl={getFloorImage(display.image_url)}
                      pathCoordinates={display.path_coordinates}
                      instructions={display.instructions}
                      isStartFloor={index === 0}
                      isEndFloor={index === navigationResult.floors_to_display.length - 1}
                      stairsExit={display.stairs_exit}
                      stairsEntry={display.stairs_entry}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 p-4 text-center text-gray-400 text-sm">
        Ekranga tegmang - 1 daqiqadan so'ng avtomatik qaytariladi
      </footer>
    </div>
  );
}