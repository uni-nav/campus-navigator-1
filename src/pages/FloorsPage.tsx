import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Layers, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { floorsApi } from '@/lib/api/client';
import { Floor, FloorCreate } from '@/lib/api/types';
import { resolveMediaUrl } from '@/lib/media';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function FloorsPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFloor, setNewFloor] = useState<FloorCreate>({ name: '', floor_number: 1 });
  const navigate = useNavigate();

  const fetchFloors = async () => {
    try {
      const data = await floorsApi.getAll();
      setFloors(data.sort((a, b) => a.floor_number - b.floor_number));
    } catch (error) {
      toast.error('Qavatlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const handleCreate = async () => {
    if (!newFloor.name.trim()) {
      toast.error('Qavat nomini kiriting');
      return;
    }

    try {
      await floorsApi.create(newFloor);
      toast.success('Qavat yaratildi');
      setIsCreateOpen(false);
      setNewFloor({ name: '', floor_number: floors.length + 1 });
      fetchFloors();
    } catch (error) {
      toast.error('Qavat yaratishda xato');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Qavatni o'chirishni xohlaysizmi?")) return;

    try {
      await floorsApi.delete(id);
      toast.success("Qavat o'chirildi");
      fetchFloors();
    } catch (error) {
      toast.error("Qavat o'chirishda xato");
    }
  };

  const handleImageUpload = async (floorId: number, file: File) => {
    try {
      await floorsApi.uploadImage(floorId, file);
      toast.success('Rasm yuklandi');
      fetchFloors();
    } catch (error) {
      toast.error('Rasm yuklashda xato');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      <PageHeader
        title="Qavatlar"
        description="Bino qavatlarini boshqaring"
        className="mb-8"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Yangi qavat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi qavat yaratish</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Qavat nomi</Label>
                  <Input
                    placeholder="Masalan: 1-qavat"
                    aria-label="Qavat nomi"
                    value={newFloor.name}
                    onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qavat raqami</Label>
                  <Input
                    type="number"
                    aria-label="Qavat raqami"
                    value={newFloor.floor_number}
                    onChange={(e) =>
                      setNewFloor({ ...newFloor, floor_number: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Yaratish
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {floors.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Qavatlar yo'q"
          description="Boshlash uchun yangi qavat qo'shing"
          action={
            <Button onClick={() => setIsCreateOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Qavat qo'shish
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map((floor, index) => (
            <Card
              key={floor.id}
              className={cn(
                'overflow-hidden group hover:border-primary/50 transition-all cursor-pointer',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={(e) => {
                const el = e.target as HTMLElement;
                // Upload/Delete tugmalari bosilganda editga o'tib ketmasin
                if (el.closest('button, input, label, [data-stop-nav]')) return;
                navigate(`/floors/${floor.id}/edit`);
              }}
            >
              {/* Image Preview */}
              <div className="aspect-video bg-muted relative overflow-hidden" data-stop-nav>
                {floor.image_url ? (
                  <img
                    src={resolveMediaUrl(floor.image_url)}
                    alt={floor.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Layers className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" data-stop-nav>
                  <label
                    data-stop-nav
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        e.stopPropagation();
                        const file = e.target.files?.[0];
                        // bir xil faylni qayta tanlash uchun
                        e.currentTarget.value = '';
                        if (file) {
                          handleImageUpload(floor.id, file);
                        }
                      }}
                    />
                    <Button size="sm" variant="secondary" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                      </span>
                    </Button>
                  </label>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(floor.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{floor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Qavat #{floor.floor_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Edit2 className="w-4 h-4" />
                  </div>
                </div>
                {floor.image_width && floor.image_height && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {floor.image_width} × {floor.image_height} px
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
