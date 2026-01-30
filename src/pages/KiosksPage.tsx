import { useState } from 'react';
import { Plus, Trash2, MapPin, Monitor, Edit2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useKiosks, useCreateKiosk, useDeleteKiosk, useUpdateKiosk } from '@/hooks/useKiosks';
import { useQuery } from '@tanstack/react-query';
import { floorsApi, waypointsApi } from '@/lib/api/client';
import { Kiosk } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';

export default function KiosksPage() {
  const { data: kiosks, isLoading } = useKiosks();
  const { data: floors } = useQuery({ queryKey: ['floors'], queryFn: () => floorsApi.getAll() });
  const createKiosk = useCreateKiosk();
  const deleteKiosk = useDeleteKiosk();
  const updateKiosk = useUpdateKiosk();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    floor_id: '',
    waypoint_id: '',
    description: '',
  });

  // Fetch waypoints for selected floor
  const [selectedFloorForWaypoints, setSelectedFloorForWaypoints] = useState<number | null>(null);
  const { data: waypoints } = useQuery({
    queryKey: ['waypoints', selectedFloorForWaypoints],
    queryFn: () => waypointsApi.getByFloor(selectedFloorForWaypoints!),
    enabled: !!selectedFloorForWaypoints,
  });

  const resetForm = () => {
    setFormData({ name: '', floor_id: '', waypoint_id: '', description: '' });
    setSelectedFloorForWaypoints(null);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.floor_id) return;

    if (editingId) {
      await updateKiosk.mutateAsync({
        id: editingId,
        data: {
          name: formData.name,
          floor_id: parseInt(formData.floor_id),
          waypoint_id: formData.waypoint_id || null,
          description: formData.description || null,
        },
      });
    } else {
      await createKiosk.mutateAsync({
        name: formData.name,
        floor_id: parseInt(formData.floor_id),
        waypoint_id: formData.waypoint_id || null,
        description: formData.description || null,
      });
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (kiosk: Kiosk) => {
    setEditingId(kiosk.id);
    setFormData({
      name: kiosk.name,
      floor_id: kiosk.floor_id.toString(),
      waypoint_id: kiosk.waypoint_id || '',
      description: kiosk.description || '',
    });
    setSelectedFloorForWaypoints(kiosk.floor_id);
    setDialogOpen(true);
  };

  const getFloorName = (floorId: number) => {
    return floors?.find((f) => f.id === floorId)?.name || `Qavat ${floorId}`;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Kiosklar"
        description="Kiosk qurilmalarini boshqaring"
        className="mb-8"
        actions={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Yangi kiosk
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Kioskni tahrirlash' : 'Yangi kiosk'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nomi</Label>
                  <Input
                    placeholder="Kiosk nomi"
                    aria-label="Kiosk nomi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qavat</Label>
                  <Select
                    value={formData.floor_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, floor_id: value, waypoint_id: '' });
                      setSelectedFloorForWaypoints(parseInt(value));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qavatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {floors?.map((floor) => (
                        <SelectItem key={floor.id} value={floor.id.toString()}>
                          {floor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nuqta</Label>
                  <Select
                    value={formData.waypoint_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, waypoint_id: value === 'none' ? '' : value })
                    }
                    disabled={!selectedFloorForWaypoints}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nuqtani tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Biriktirilmasin</SelectItem>
                      {waypoints?.map((wp) => (
                        <SelectItem key={wp.id} value={wp.id}>
                          {wp.label || wp.id} ({wp.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (ixtiyoriy)</Label>
                  <Input
                    placeholder="Kiosk haqida ma'lumot"
                    aria-label="Kiosk tavsifi"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Bekor qilish
                  </Button>
                  <Button onClick={handleSubmit} disabled={createKiosk.isPending || updateKiosk.isPending}>
                    {editingId ? 'Saqlash' : 'Yaratish'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Kiosks Grid */}
      {!kiosks?.length ? (
        <EmptyState
          icon={Monitor}
          title="Kiosklar yo'q"
          description="Birinchi kioskni yarating"
          action={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Yangi kiosk
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kiosks.map((kiosk) => (
            <Card key={kiosk.id} className="p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{kiosk.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getFloorName(kiosk.floor_id)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(kiosk)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Kioskni o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{kiosk.name}" kioskini o'chirishni xohlaysizmi?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteKiosk.mutate(kiosk.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          O'chirish
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Nuqta: {kiosk.waypoint_id || 'Belgilanmagan'}</span>
                </div>
                {kiosk.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {kiosk.description}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
