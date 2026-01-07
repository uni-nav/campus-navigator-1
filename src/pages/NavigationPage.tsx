import { useState, useEffect } from 'react';
import { Search, Navigation, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { roomsApi, navigationApi, floorsApi } from '@/lib/api/client';
import { Room, Floor, NavigationResponse } from '@/lib/api/types';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function NavigationPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [navigationResult, setNavigationResult] = useState<NavigationResponse | null>(null);
  const [navigating, setNavigating] = useState(false);
  
  const { kioskWaypointId } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, floorsData] = await Promise.all([
          roomsApi.getAll(),
          floorsApi.getAll(),
        ]);
        setRooms(roomsData);
        setFloors(floorsData);
      } catch (error) {
        toast.error("Ma'lumotlarni yuklashda xato");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, rooms]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await roomsApi.search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast.error('Qidirishda xato');
    }
  };

  const handleNavigate = async (room: Room) => {
    if (!kioskWaypointId) {
      toast.error('Kiosk joylashuvi sozlanmagan. Sozlamalar sahifasida belgilang.');
      return;
    }

    setSelectedRoom(room);
    setNavigating(true);

    try {
      const result = await navigationApi.findPath({
        start_waypoint_id: kioskWaypointId,
        end_room_id: room.id.toString(),
      });
      setNavigationResult(result);
    } catch (error) {
      toast.error("Yo'l topilmadi");
      setNavigationResult(null);
    } finally {
      setNavigating(false);
    }
  };

  const getFloorName = (floorId: number) => {
    const floor = floors.find((f) => f.id === floorId);
    return floor?.name || `Qavat ${floorId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Navigatsiya</h1>
        <p className="text-muted-foreground mt-1">
          Xonani qidiring va yo'lni toping
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Xona qidirish</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Xona raqami yoki nomi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Natijalar
                  </Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((room) => (
                      <Card
                        key={room.id}
                        className={cn(
                          'p-4 cursor-pointer hover:border-primary/50 transition-all',
                          selectedRoom?.id === room.id && 'border-primary bg-primary/5'
                        )}
                        onClick={() => handleNavigate(room)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{room.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getFloorName(room.floor_id)}
                              {room.building && ` • ${room.building}`}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Navigation className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Xonalar topilmadi</p>
                </div>
              )}
            </div>
          </Card>

          {/* Kiosk Status */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-3 h-3 rounded-full',
                kioskWaypointId ? 'bg-success' : 'bg-warning'
              )} />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {kioskWaypointId ? 'Kiosk joylashuvi belgilangan' : 'Kiosk joylashuvi belgilanmagan'}
                </p>
                {kioskWaypointId && (
                  <p className="text-xs text-muted-foreground">ID: {kioskWaypointId}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Result */}
        <div>
          {navigating ? (
            <Card className="p-12 text-center">
              <div className="animate-pulse">
                <Navigation className="w-12 h-12 mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Yo'l hisoblanmoqda...</p>
              </div>
            </Card>
          ) : navigationResult ? (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Yo'l: {selectedRoom?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getFloorName(selectedRoom?.floor_id || 0)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(navigationResult.total_distance)}
                  </p>
                  <p className="text-xs text-muted-foreground">metr</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {navigationResult.floor_changes}
                  </p>
                  <p className="text-xs text-muted-foreground">qavat o'zgarish</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(navigationResult.estimated_time_minutes)}
                  </p>
                  <p className="text-xs text-muted-foreground">daqiqa</p>
                </div>
              </div>

              {/* Path Steps */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Yo'l bosqichlari
                </Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {navigationResult.path.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {step.instruction || step.label || step.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getFloorName(step.floor_id)} • ({step.x}, {step.y})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center border-dashed">
              <Navigation className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Navigatsiya
              </h3>
              <p className="text-muted-foreground">
                Yo'l ko'rsatish uchun xonani tanlang
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}