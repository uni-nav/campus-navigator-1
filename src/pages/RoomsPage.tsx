import { useEffect, useState } from 'react';
import { Plus, Trash2, Search, DoorOpen, Link2, Pencil, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { roomsApi, floorsApi, waypointsApi } from '@/lib/api/client';
import { Room, RoomCreate, RoomUpdate, Floor, Waypoint } from '@/lib/api/types';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  // Edit state
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<RoomUpdate>({});
  const [editWaypoints, setEditWaypoints] = useState<Waypoint[]>([]);

  const [newRoom, setNewRoom] = useState<Partial<RoomCreate>>({
    name: '',
    waypoint_id: null,
    floor_id: 0,
    keywords: '',
  });

  const fetchData = async () => {
    try {
      const [roomsData, floorsData] = await Promise.all([
        roomsApi.getAll(),
        floorsApi.getAll(),
      ]);
      setRooms(roomsData);
      setFloors(floorsData.sort((a, b) => a.floor_number - b.floor_number));
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  // Fetch waypoints when floor is selected
  const fetchWaypoints = async (floorId: number) => {
    try {
      const data = await waypointsApi.getByFloor(floorId);
      // Filter only room-type waypoints that are not linked
      setWaypoints(data.filter((w) => w.type === 'room'));
    } catch (error) {
      logger.error('Error fetching waypoints', error);
    }
  };

  // Fetch waypoints for edit dialog
  const fetchEditWaypoints = async (floorId: number) => {
    try {
      const data = await waypointsApi.getByFloor(floorId);
      setEditWaypoints(data.filter((w) => w.type === 'room'));
    } catch (error) {
      logger.error('Error fetching waypoints for edit', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newRoom.floor_id) {
      fetchWaypoints(newRoom.floor_id);
    }
  }, [newRoom.floor_id]);

  const handleCreate = async () => {
    if (!newRoom.name?.trim() || !newRoom.floor_id) {
      toast.error("Xona nomini va qavatni kiriting");
      return;
    }

    try {
      const roomToCreate: RoomCreate = {
        name: newRoom.name,
        waypoint_id: newRoom.waypoint_id || null,
        floor_id: newRoom.floor_id,
        keywords: newRoom.keywords?.trim() || null,
      };

      await roomsApi.create(roomToCreate);
      toast.success('Xona yaratildi');
      setIsCreateOpen(false);
      setNewRoom({
        name: '',
        waypoint_id: null,
        floor_id: 0,
        keywords: '',
      });
      fetchData();
    } catch (error) {
      toast.error('Xona yaratishda xato');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setEditForm({
      name: room.name,
      keywords: room.keywords || '',
      waypoint_id: room.waypoint_id,
      floor_id: room.floor_id,
    });
    if (room.floor_id) {
      fetchEditWaypoints(room.floor_id);
    }
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingRoom) return;
    if (!editForm.name?.trim()) {
      toast.error("Xona nomi bo'sh bo'lishi mumkin emas");
      return;
    }

    try {
      const updateData: RoomUpdate = {
        name: editForm.name?.trim(),
        keywords: editForm.keywords?.trim() || null,
        waypoint_id: editForm.waypoint_id,
        floor_id: editForm.floor_id,
      };

      await roomsApi.update(editingRoom.id, updateData);
      toast.success('Xona yangilandi');
      setIsEditOpen(false);
      setEditingRoom(null);
      fetchData();
    } catch (error) {
      toast.error('Xona yangilashda xato');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xonani o'chirishni xohlaysizmi?")) return;

    try {
      await roomsApi.delete(id);
      toast.success("Xona o'chirildi");
      fetchData();
    } catch (error) {
      toast.error("Xona o'chirishda xato");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      room.name.toLowerCase().includes(query) ||
      (room.keywords && room.keywords.toLowerCase().includes(query));
    const matchesFloor = !selectedFloorId || room.floor_id === selectedFloorId;
    return matchesSearch && matchesFloor;
  });

  const getFloorName = (floorId: number | null) => {
    if (!floorId) return '—';
    const floor = floors.find((f) => f.id === floorId);
    return floor?.name || `Qavat ${floorId}`;
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      <PageHeader
        title="Xonalar"
        description="Xonalarni boshqaring va nuqtalarga bog'lang"
        className="mb-8"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Yangi xona
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi xona yaratish</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Xona nomi *</Label>
                  <Input
                    placeholder="Masalan: 101-xona"
                    aria-label="Xona nomi"
                    value={newRoom.name || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kalit so'zlar</Label>
                  <Textarea
                    placeholder="Masalan: dekanat kutubxona o'quv bo'limi"
                    aria-label="Kalit so'zlar"
                    value={newRoom.keywords || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, keywords: e.target.value })}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Qidiruv uchun kalit so'zlar. Kiosk va admin panelda qidirganda ishlatiladi.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Qavat *</Label>
                  <Select
                    value={newRoom.floor_id?.toString() || ''}
                    onValueChange={(value) =>
                      setNewRoom({ ...newRoom, floor_id: parseInt(value), waypoint_id: null })
                    }
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

                {newRoom.floor_id && waypoints.length > 0 && (
                  <div className="space-y-2">
                    <Label>Nuqtaga bog'lash</Label>
                    <Select
                      value={newRoom.waypoint_id || ''}
                      onValueChange={(value) => setNewRoom({ ...newRoom, waypoint_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nuqtani tanlang (ixtiyoriy)" />
                      </SelectTrigger>
                      <SelectContent>
                        {waypoints.map((wp) => (
                          <SelectItem key={wp.id} value={wp.id}>
                            {wp.label || wp.id} ({wp.x}, {wp.y})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handleCreate} className="w-full">
                  Yaratish
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Xonalarni qidirish (nom yoki kalit so'z)..."
            aria-label="Xona qidirish"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedFloorId?.toString() || 'all'}
          onValueChange={(value) => setSelectedFloorId(value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Barcha qavatlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha qavatlar</SelectItem>
            {floors.map((floor) => (
              <SelectItem key={floor.id} value={floor.id.toString()}>
                {floor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title={searchQuery ? 'Xonalar topilmadi' : "Xonalar yo'q"}
          description={
            searchQuery
              ? "Qidiruv so'rovini o'zgartiring"
              : "Boshlash uchun yangi xona qo'shing"
          }
          action={
            !searchQuery ? (
              <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Xona qo'shish
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room, index) => (
            <Card
              key={room.id}
              className={cn(
                'p-4 hover:border-primary/50 transition-all group animate-fade-in'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">{getFloorName(room.floor_id)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEdit(room)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => handleDelete(room.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {room.keywords && (
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{room.keywords}</span>
                </div>
              )}

              {room.waypoint_id ? (
                <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                  <Link2 className="w-3 h-3" />
                  <span>Nuqtaga bog'langan</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Link2 className="w-3 h-3" />
                  <span>Bog'lanmagan</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) setEditingRoom(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xonani tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Xona nomi *</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                aria-label="Xona nomi"
              />
            </div>

            <div className="space-y-2">
              <Label>Kalit so'zlar</Label>
              <Textarea
                placeholder="Masalan: dekanat kutubxona o'quv bo'limi"
                aria-label="Kalit so'zlar"
                value={editForm.keywords || ''}
                onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Qidiruv uchun kalit so'zlar. Kiosk va admin panelda qidirganda ishlatiladi.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Qavat</Label>
              <Select
                value={editForm.floor_id?.toString() || ''}
                onValueChange={(value) => {
                  const floorId = parseInt(value);
                  setEditForm({ ...editForm, floor_id: floorId, waypoint_id: editForm.waypoint_id });
                  fetchEditWaypoints(floorId);
                }}
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

            {editForm.floor_id && editWaypoints.length > 0 && (
              <div className="space-y-2">
                <Label>Nuqtaga bog'lash</Label>
                <Select
                  value={editForm.waypoint_id || 'none'}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, waypoint_id: value === 'none' ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nuqtani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Bog'lamaslik</SelectItem>
                    {editWaypoints.map((wp) => (
                      <SelectItem key={wp.id} value={wp.id}>
                        {wp.label || wp.id} ({wp.x}, {wp.y})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleUpdate} className="w-full">
              Saqlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
