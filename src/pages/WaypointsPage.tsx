import { useEffect, useState } from 'react';
import { MapPin, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { floorsApi, waypointsApi, roomsApi, connectionsApi } from '@/lib/api/client';
import { Floor, Waypoint, Room, Connection } from '@/lib/api/types';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';

function ConnectedWaypointLabel({ waypointId }: { waypointId: string }) {
  const [label, setLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchWaypoint = async () => {
      try {
        const wp = await waypointsApi.getOne(waypointId);
        if (isMounted) {
          setLabel(wp.label || wp.id);
        }
      } catch (error) {
        if (isMounted) {
          setLabel(waypointId); // Fallback to ID on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWaypoint();
    return () => { isMounted = false; };
  }, [waypointId]);

  return (
    <div className="flex justify-between items-center text-muted-foreground pl-1 border-l-2 border-amber-500/30 ml-1">
      <span>Qaysi nuqtaga:</span>
      <span className="font-mono bg-background px-1.5 py-0.5 rounded border truncate max-w-[120px]" title={label || waypointId}>
        {loading ? '...' : (label || waypointId)}
      </span>
    </div>
  );
}

export default function WaypointsPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

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
        logger.error('Error', error);
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
        const [waypointsData, roomsData, connectionsData] = await Promise.all([
          waypointsApi.getByFloor(selectedFloorId),
          roomsApi.getByFloor(selectedFloorId),
          connectionsApi.getByFloor(selectedFloorId),
        ]);
        setWaypoints(waypointsData);
        setRooms(roomsData);
        setConnections(connectionsData);
      } catch (error) {
        logger.error('Error', error);
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
      case 'hall': return 'bg-rose-500';
      case 'unconnected': return 'bg-destructive';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'all': return 'Barchasi';
      case 'hallway': return 'Koridor';
      case 'room': return 'Xona';
      case 'stairs': return 'Zina';
      case 'elevator': return 'Lift';
      case 'hall': return 'Zal';
      case 'unconnected': return "Bog'lanmagan";
      default: return type;
    }
  };

  const getFloorName = (floorId: number | null) => {
    if (!floorId) return '';
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name || `Qavat ${floor.floor_number}` : `Qavat ${floorId}`;
  };

  if (loading) {
    return <LoadingState />;
  }

  const filteredWaypoints = selectedType === 'all'
    ? waypoints
    : waypoints.filter(w => w.type === selectedType);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      <PageHeader
        title="Nuqtalar"
        description="Barcha nuqtalar va bog'lanishlarni ko'ring"
        className="mb-8"
      />

      {floors.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Qavatlar yo'q"
          description="Nuqtalar ko‘rsatish uchun avval qavat yarating"
        />
      ) : (
        <>
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

          {/* Type Filter */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 py-1">
            <div className="flex items-center gap-2 mr-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtr:</span>
            </div>
            {['all', 'hallway', 'room', 'stairs', 'elevator', 'hall', 'unconnected'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2',
                  selectedType === type
                    ? (type === 'unconnected' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-primary text-primary-foreground border-primary')
                    : 'bg-background hover:bg-muted border-border text-muted-foreground'
                )}
              >
                {type !== 'all' && (
                  <div className={cn('w-2 h-2 rounded-full', getTypeColor(type))} />
                )}
                {getTypeLabel(type)}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {['hallway', 'room', 'stairs', 'elevator', 'hall', 'unconnected'].map((type) => {
              const count = type === 'unconnected'
                ? waypoints.filter(w => !connections.some(c => c.from_waypoint_id === w.id || c.to_waypoint_id === w.id)).length
                : waypoints.filter((w) => w.type === type).length;

              return (
                <Card
                  key={type}
                  className={cn(
                    "p-4 transition-all cursor-pointer",
                    selectedType === type ? (type === 'unconnected' ? "ring-2 ring-destructive" : "ring-2 ring-primary") : ""
                  )}
                  onClick={() => setSelectedType(type)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-3 h-3 rounded-full', getTypeColor(type))} />
                    <div>
                      <p className={cn("text-2xl font-bold", type === 'unconnected' && count > 0 ? "text-destructive" : "text-foreground")}>{count}</p>
                      <p className="text-xs text-muted-foreground">{getTypeLabel(type)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Waypoints List */}
          {waypoints.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Nuqtalar yo'q"
              description="Qavatlar sahifasidan nuqtalarni qo'shing"
            />
          ) : filteredWaypoints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
              Bu qavatda <b>{getTypeLabel(selectedType)}</b> turidagi nuqtalar topilmadi
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWaypoints.map((waypoint, index) => {
                const linkedRoom = rooms.find((r) => r.waypoint_id === waypoint.id);

                // Find implicit vertical connections (connections where the other endpoint is not on this floor)
                // Since `waypoints` only contains waypoints for `selectedFloorId`, if a connection links to an ID not in `waypoints`, it's a vertical link.
                const implicitVerticalConns = connections.filter(c =>
                  (c.from_waypoint_id === waypoint.id && !waypoints.find(w => w.id === c.to_waypoint_id)) ||
                  (c.to_waypoint_id === waypoint.id && !waypoints.find(w => w.id === c.from_waypoint_id))
                );

                const hasExplicitLink = !!(waypoint.connects_to_floor || waypoint.connects_to_waypoint);
                const hasVerticalLink = (waypoint.type === 'stairs' || waypoint.type === 'elevator') &&
                  (hasExplicitLink || implicitVerticalConns.length > 0);

                return (
                  <Card
                    key={waypoint.id}
                    className="p-4 animate-fade-in flex flex-col h-full"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                          getTypeColor(waypoint.type) + '/20'
                        )}
                      >
                        <div className={cn('w-3 h-3 rounded-full', getTypeColor(waypoint.type))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-foreground truncate" title={waypoint.label || waypoint.id}>
                            {waypoint.label || waypoint.id}
                          </h4>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2 font-mono bg-muted px-1.5 py-0.5 rounded">
                            {waypoint.id.substring(0, 6)}...
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 mb-2">
                          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", getTypeColor(waypoint.type) + '/10 text-foreground')}>
                            {getTypeLabel(waypoint.type)}
                          </span>
                        </div>

                        <div className="bg-muted/50 rounded-md p-2 mt-3 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span>Koordinata:</span>
                            <span className="font-mono bg-background px-1.5 py-0.5 rounded border">
                              {waypoint.x}, {waypoint.y}
                            </span>
                          </div>

                          {linkedRoom && (
                            <div className="flex justify-between items-center text-primary">
                              <span>Biriktirilgan xona:</span>
                              <span className="font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                                {linkedRoom.name}
                              </span>
                            </div>
                          )}

                          {hasVerticalLink && (
                            <>
                              <div className="border-t border-border mt-2 pt-2 mb-1"></div>
                              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-medium">
                                <span className="shrink-0">{waypoint.type === 'stairs' ? 'Zina yo\'li:' : 'Lift yo\'li:'}</span>
                              </div>

                              {waypoint.connects_to_floor && (
                                <div className="flex justify-between items-center text-muted-foreground pl-1 border-l-2 border-amber-500/30 ml-1">
                                  <span>Qaysi qavatga:</span>
                                  <span className="bg-background px-1.5 py-0.5 rounded border truncate max-w-[120px]" title={getFloorName(waypoint.connects_to_floor)}>
                                    {getFloorName(waypoint.connects_to_floor)}
                                  </span>
                                </div>
                              )}

                              {waypoint.connects_to_waypoint && (
                                <ConnectedWaypointLabel waypointId={waypoint.connects_to_waypoint} />
                              )}

                              {implicitVerticalConns.map(conn => {
                                const targetId = conn.from_waypoint_id === waypoint.id ? conn.to_waypoint_id : conn.from_waypoint_id;
                                return (
                                  <ConnectedWaypointLabel key={conn.id} waypointId={targetId} />
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
