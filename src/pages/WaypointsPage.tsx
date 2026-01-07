import { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { floorsApi, waypointsApi, connectionsApi, roomsApi } from '@/lib/api/client';
import { Floor, Waypoint, Room } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export default function WaypointsPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const data = await floorsApi.getAll();
        const sorted = data.sort((a, b) => a.floor_number - b.floor_number);
        setFloors(sorted);
        if (sorted.length > 0) {
          setSelectedFloorId(sorted[0].id);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedFloorId) return;

      try {
        const [waypointsData, roomsData] = await Promise.all([
          waypointsApi.getByFloor(selectedFloorId),
          roomsApi.getByFloor(selectedFloorId),
        ]);
        setWaypoints(waypointsData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [selectedFloorId]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hallway': return 'bg-blue-500';
      case 'room': return 'bg-green-500';
      case 'stairs': return 'bg-yellow-500';
      case 'elevator': return 'bg-purple-500';
      case 'hall': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hallway': return 'Koridor';
      case 'room': return 'Xona';
      case 'stairs': return 'Zina';
      case 'elevator': return 'Lift';
      case 'hall': return 'Zal';
      default: return type;
    }
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
        <h1 className="text-2xl font-bold text-foreground">Nuqtalar</h1>
        <p className="text-muted-foreground mt-1">Barcha nuqtalar va bog'lanishlarni ko'ring</p>
      </div>

      {/* Floor Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setSelectedFloorId(floor.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              selectedFloorId === floor.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {floor.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {['hallway', 'room', 'stairs', 'elevator', 'hall'].map((type) => {
          const count = waypoints.filter((w) => w.type === type).length;
          return (
            <Card key={type} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-3 h-3 rounded-full', getTypeColor(type))} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{getTypeLabel(type)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Waypoints List */}
      {waypoints.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nuqtalar yo'q</h3>
          <p className="text-muted-foreground">
            Qavatlar sahifasidan nuqtalarni qo'shing
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {waypoints.map((waypoint, index) => {
            const linkedRoom = rooms.find((r) => r.waypoint_id === waypoint.id);
            
            return (
              <Card
                key={waypoint.id}
                className="p-4 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', getTypeColor(waypoint.type) + '/20')}>
                    <div className={cn('w-3 h-3 rounded-full', getTypeColor(waypoint.type))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {waypoint.label || waypoint.id}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getTypeLabel(waypoint.type)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ({waypoint.x}, {waypoint.y})
                    </p>
                    {linkedRoom && (
                      <p className="text-xs text-primary mt-2">
                        → {linkedRoom.name}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}