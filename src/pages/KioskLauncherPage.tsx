import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Monitor, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { kiosksApi, floorsApi } from '@/lib/api/client';
import { Floor, Kiosk } from '@/lib/api/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function KioskLauncherPage() {
  const navigate = useNavigate();
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kiosksData, floorsData] = await Promise.all([
          kiosksApi.getAll(),
          floorsApi.getAll(),
        ]);
        setKiosks(kiosksData);
        setFloors(floorsData);
      } catch (error) {
        toast.error('Kiosklarni yuklashda xato');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return kiosks;
    return kiosks.filter((kiosk) => {
      const floorName = floors.find((f) => f.id === kiosk.floor_id)?.name || '';
      return (
        kiosk.name.toLowerCase().includes(q) ||
        floorName.toLowerCase().includes(q) ||
        String(kiosk.id).includes(q)
      );
    });
  }, [query, kiosks, floors]);

  const getFloorName = (floorId: number | null) => {
    if (!floorId) return 'Qavat belgilanmagan';
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
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kiosk ekranlari</h1>
        <p className="text-muted-foreground mt-1">
          Kiosk tanlang va ommaviy ekranga o'ting
        </p>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Kiosk nomi, ID yoki qavat..."
            aria-label="Kiosk qidirish"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <Card className="p-6 text-center col-span-full">
            <div className="text-muted-foreground">Kiosk topilmadi</div>
          </Card>
        )}
        {filtered.map((kiosk) => (
          <Card key={kiosk.id} className="p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                kiosk.is_active === false ? 'bg-muted' : 'bg-primary/10'
              )}>
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{kiosk.name}</h3>
                <p className="text-xs text-muted-foreground">ID: {kiosk.id}</p>
                <p className="text-sm text-muted-foreground">
                  {getFloorName(kiosk.floor_id)}
                </p>
              </div>
            </div>
            {kiosk.description && (
              <p className="text-sm text-muted-foreground">{kiosk.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                className="gap-2"
                onClick={() => navigate(`/kiosk?kiosk_id=${kiosk.id}`)}
              >
                <ExternalLink className="w-4 h-4" />
                Kioskga o'tish
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/kiosk?kiosk_id=${kiosk.id}`, '_blank')}
              >
                Yangi oynada
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
