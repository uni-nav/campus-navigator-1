import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Clock, Footprints, ArrowRight, RotateCcw, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { floorsApi, roomsApi, navigationApi, getApiUrl } from '@/lib/api/client';
import { Floor, Room, NavigationResponse, PathStep } from '@/lib/api/types';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { KioskFloorMap } from '@/components/kiosk/KioskFloorMap';
import { KioskTransitionCard } from '@/components/kiosk/KioskTransitionCard';

export default function KioskDisplayPage() {
  const { kioskWaypointId } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const [navigationResult, setNavigationResult] = useState<NavigationResponse | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null);
  const IDLE_TIMEOUT_MS = 60000; // 1 minute

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [floorsData, roomsData] = await Promise.all([
          floorsApi.getAll(),
          roomsApi.getAll(),
        ]);
        setFloors(floorsData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

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

  // Search rooms
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = rooms.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 10));
  }, [searchQuery, rooms]);

  // Handle room selection and navigation
  const handleSelectRoom = async (room: Room) => {
    if (!kioskWaypointId) {
      console.error('Kiosk waypoint not configured');
      return;
    }

    setSelectedRoom(room);
    setIsNavigating(true);
    setSearchQuery('');
    setSearchResults([]);

    try {
      const result = await navigationApi.findPath({
        start_waypoint_id: kioskWaypointId,
        end_room_id: room.id.toString(),
      });
      setNavigationResult(result);
    } catch (error) {
      console.error('Navigation failed:', error);
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
  };

  // Group path steps by floor
  const getFloorGroups = useCallback(() => {
    if (!navigationResult?.path) return [];

    const groups: { floorId: number; steps: PathStep[]; isTransition?: boolean; floorsSkipped?: number[] }[] = [];
    let currentFloorId: number | null = null;
    let currentSteps: PathStep[] = [];

    navigationResult.path.forEach((step, index) => {
      if (currentFloorId === null) {
        currentFloorId = step.floor_id;
        currentSteps.push(step);
      } else if (step.floor_id !== currentFloorId) {
        // Save current floor group
        groups.push({ floorId: currentFloorId, steps: currentSteps });
        
        // Check if floors are skipped (non-adjacent)
        const floorDiff = Math.abs(step.floor_id - currentFloorId);
        if (floorDiff > 1) {
          const skippedFloors: number[] = [];
          const direction = step.floor_id > currentFloorId ? 1 : -1;
          for (let i = currentFloorId + direction; i !== step.floor_id; i += direction) {
            skippedFloors.push(i);
          }
          groups.push({ 
            floorId: -1, 
            steps: [], 
            isTransition: true, 
            floorsSkipped: skippedFloors 
          });
        }
        
        currentFloorId = step.floor_id;
        currentSteps = [step];
      } else {
        currentSteps.push(step);
      }
    });

    if (currentSteps.length > 0 && currentFloorId !== null) {
      groups.push({ floorId: currentFloorId, steps: currentSteps });
    }

    return groups;
  }, [navigationResult]);

  const getFloorName = (floorId: number) => {
    const floor = floors.find((f) => f.id === floorId);
    return floor?.name || `${floorId}-qavat`;
  };

  const getFloorImage = (floorId: number) => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor?.image_url) return null;
    
    if (/^https?:\/\//i.test(floor.image_url)) return floor.image_url;
    const base = getApiUrl().replace(/\/$/, '');
    const path = floor.image_url.startsWith('/') ? floor.image_url : `/${floor.image_url}`;
    return `${base}${path}`;
  };

  const floorGroups = getFloorGroups();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Building2 className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">Universitet Navigatsiyasi</h1>
              <p className="text-emerald-100 text-sm">Xonani qidiring va yo'l toping</p>
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
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-0 overflow-hidden">
                  <ScrollArea className="max-h-96">
                    {searchResults.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => handleSelectRoom(room)}
                        className="w-full p-4 text-left hover:bg-emerald-50 transition-colors flex items-center gap-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-gray-800">{room.name}</p>
                          <p className="text-gray-500">
                            {getFloorName(room.floor_id)}
                            {room.building && ` • ${room.building} blok`}
                          </p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </button>
                    ))}
                  </ScrollArea>
                </Card>
              )}

              {/* No Results */}
              {searchQuery && searchResults.length === 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 p-8 text-center">
                  <p className="text-gray-500">Hech narsa topilmadi</p>
                </Card>
              )}
            </div>

            {/* Quick Access / Popular Rooms */}
            <div className="w-full max-w-2xl">
              <p className="text-center text-gray-400 mb-4">Tez-tez qidiriladigan joylar</p>
              <div className="flex flex-wrap justify-center gap-3">
                {rooms.slice(0, 6).map((room) => (
                  <Button
                    key={room.id}
                    variant="outline"
                    onClick={() => handleSelectRoom(room)}
                    className="rounded-full border-gray-200 hover:border-emerald-500 hover:bg-emerald-50"
                  >
                    {room.name}
                  </Button>
                ))}
              </div>
            </div>
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
                    {getFloorName(selectedRoom.floor_id)}
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
                {floorGroups.map((group, index) => (
                  group.isTransition ? (
                    <KioskTransitionCard 
                      key={`transition-${index}`}
                      floorsSkipped={group.floorsSkipped || []}
                      getFloorName={getFloorName}
                    />
                  ) : (
                    <KioskFloorMap
                      key={group.floorId}
                      floorId={group.floorId}
                      floorName={getFloorName(group.floorId)}
                      imageUrl={getFloorImage(group.floorId)}
                      pathSteps={group.steps}
                      isStartFloor={index === 0}
                      isEndFloor={index === floorGroups.length - 1}
                      selectedRoom={selectedRoom}
                    />
                  )
                ))}
              </div>
            )}

            {/* Instructions */}
            {navigationResult && navigationResult.path.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Yo'l ko'rsatmalari</h3>
                <div className="space-y-3">
                  {navigationResult.path
                    .filter((step) => step.instruction)
                    .map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 pt-1">{step.instruction}</p>
                      </div>
                    ))}
                </div>
              </Card>
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