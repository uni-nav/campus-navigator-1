import { useState, useEffect } from 'react';
import { Server, MapPin, Save, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
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
import { useAppStore } from '@/lib/store';
import { setApiUrl, getApiUrl, healthCheck, waypointsApi, floorsApi } from '@/lib/api/client';
import { Floor, Waypoint } from '@/lib/api/types';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { 
    apiUrl, 
    setApiUrl: setStoreApiUrl, 
    kioskWaypointId, 
    setKioskWaypointId,
    isApiConnected,
    setIsApiConnected,
  } = useAppStore();

  const [localApiUrl, setLocalApiUrl] = useState(apiUrl || getApiUrl());
  const [testing, setTesting] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  // Fetch floors for kiosk location
  const fetchFloors = async () => {
    try {
      const data = await floorsApi.getAll();
      setFloors(data.sort((a, b) => a.floor_number - b.floor_number));
    } catch (error) {
      console.error('Error fetching floors:', error);
    }
  };

  // Fetch waypoints when floor is selected
  const fetchWaypoints = async (floorId: number) => {
    try {
      const data = await waypointsApi.getByFloor(floorId);
      setWaypoints(data);
    } catch (error) {
      console.error('Error fetching waypoints:', error);
    }
  };

  useEffect(() => {
    if (isApiConnected) {
      fetchFloors();
    }
  }, [isApiConnected]);

  useEffect(() => {
    if (selectedFloorId) {
      fetchWaypoints(selectedFloorId);
    }
  }, [selectedFloorId]);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      // Temporarily set the URL
      setApiUrl(localApiUrl);
      const result = await healthCheck();
      setIsApiConnected(result);
      
      if (result) {
        toast.success('API ulanishi muvaffaqiyatli');
      } else {
        toast.error('API bilan ulanib bo\'lmadi');
      }
    } catch (error) {
      toast.error('Ulanishda xato');
      setIsApiConnected(false);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveApiUrl = () => {
    setApiUrl(localApiUrl);
    setStoreApiUrl(localApiUrl);
    toast.success('API manzili saqlandi');
    handleTestConnection();
  };

  const handleSaveKioskLocation = () => {
    toast.success('Kiosk joylashuvi saqlandi');
  };

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Sozlamalar</h1>
        <p className="text-muted-foreground mt-1">API va qurilma sozlamalari</p>
      </div>

      <div className="space-y-6">
        {/* API Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">API sozlamalari</h2>
              <p className="text-sm text-muted-foreground">Backend server manzili</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API manzili</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="http://localhost:8000"
                  value={localApiUrl}
                  onChange={(e) => setLocalApiUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              {isApiConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Ulangan</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">Ulanmagan</span>
                </>
              )}
            </div>

            <Button onClick={handleSaveApiUrl} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Saqlash
            </Button>
          </div>
        </Card>

        {/* Kiosk Location Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Kiosk joylashuvi</h2>
              <p className="text-sm text-muted-foreground">Navigatsiya boshlanish nuqtasi</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Qavat</Label>
              <Select
                value={selectedFloorId?.toString() || ''}
                onValueChange={(value) => setSelectedFloorId(parseInt(value))}
                disabled={!isApiConnected}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qavatni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor.id} value={floor.id.toString()}>
                      {floor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nuqta (Kiosk joylashuvi)</Label>
              <Select
                value={kioskWaypointId || ''}
                onValueChange={setKioskWaypointId}
                disabled={!selectedFloorId || waypoints.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nuqtani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {waypoints.map((wp) => (
                    <SelectItem key={wp.id} value={wp.id}>
                      {wp.label || wp.id} - ({wp.x}, {wp.y})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {kioskWaypointId && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="text-muted-foreground">
                  Tanlangan nuqta: <span className="text-foreground font-medium">{kioskWaypointId}</span>
                </p>
              </div>
            )}

            <Button 
              onClick={handleSaveKioskLocation} 
              className="w-full gap-2"
              disabled={!kioskWaypointId}
            >
              <Save className="w-4 h-4" />
              Saqlash
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}