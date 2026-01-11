import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Flag, ArrowUpDown, ArrowUp } from 'lucide-react';
import { PathStep, Room } from '@/lib/api/types';

interface StairsMarker {
  waypoint_id: string;
  label: string;
  coordinates: [number, number];
}

interface KioskFloorMapProps {
  floorId: number;
  floorName: string;
  imageUrl: string | null;
  // Support both old PathStep[] and new [number, number][] formats
  pathSteps?: PathStep[];
  pathCoordinates?: [number, number][];
  instructions?: string[];
  isStartFloor: boolean;
  isEndFloor: boolean;
  selectedRoom?: Room | null;
  stairsExit?: StairsMarker;
  stairsEntry?: StairsMarker;
}

export function KioskFloorMap({
  floorId,
  floorName,
  imageUrl,
  pathSteps,
  pathCoordinates,
  instructions,
  isStartFloor,
  isEndFloor,
  selectedRoom,
  stairsExit,
  stairsEntry,
}: KioskFloorMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Normalize path data to [number, number][]
  const normalizedPath: [number, number][] = pathCoordinates 
    ? pathCoordinates 
    : pathSteps 
      ? pathSteps.map(step => [step.x, step.y] as [number, number])
      : [];

  useEffect(() => {
    if (!imageUrl || !canvasRef.current || normalizedPath.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Calculate scale to fit container
      const containerWidth = containerRef.current?.clientWidth || 800;
      const maxHeight = 500;
      
      const scale = Math.min(
        containerWidth / img.width,
        maxHeight / img.height
      ) * 0.95;

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      setDimensions({ width: scaledWidth, height: scaledHeight });

      // Draw image
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

      // Calculate path coordinates scale
      const pathScale = scale;

      // Draw path shadow
      if (normalizedPath.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(normalizedPath[0][0] * pathScale, normalizedPath[0][1] * pathScale);
        normalizedPath.slice(1).forEach(([x, y]) => {
          ctx.lineTo(x * pathScale, y * pathScale);
        });
        ctx.stroke();

        // Draw main path
        ctx.beginPath();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([10, 5]);

        ctx.moveTo(normalizedPath[0][0] * pathScale, normalizedPath[0][1] * pathScale);
        normalizedPath.slice(1).forEach(([x, y]) => {
          ctx.lineTo(x * pathScale, y * pathScale);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw waypoint markers
      normalizedPath.forEach(([x, y], index) => {
        const scaledX = x * pathScale;
        const scaledY = y * pathScale;

        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw start marker (if this is start floor)
      if (isStartFloor && normalizedPath.length > 0) {
        const [x, y] = normalizedPath[0];
        const scaledX = x * pathScale;
        const scaledY = y * pathScale;

        // Draw "You are here" marker
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#3B82F6';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw pulse effect
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#3B82F6';
        ctx.textAlign = 'center';
        ctx.fillText('SIZ', scaledX, scaledY - 25);
      }

      // Draw end marker (if this is end floor)
      if (isEndFloor && normalizedPath.length > 0) {
        const [x, y] = normalizedPath[normalizedPath.length - 1];
        const scaledX = x * pathScale;
        const scaledY = y * pathScale;

        // Draw destination marker
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw room name label
        if (selectedRoom) {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#EF4444';
          ctx.textAlign = 'center';
          ctx.fillText(selectedRoom.name, scaledX, scaledY - 25);
        }
      }

      // Draw stairs exit marker
      if (stairsExit) {
        const [x, y] = stairsExit.coordinates;
        const scaledX = x * pathScale;
        const scaledY = y * pathScale;

        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↑', scaledX, scaledY);

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textBaseline = 'bottom';
        ctx.fillText(stairsExit.label, scaledX, scaledY - 18);
      }

      // Draw stairs entry marker
      if (stairsEntry) {
        const [x, y] = stairsEntry.coordinates;
        const scaledX = x * pathScale;
        const scaledY = y * pathScale;

        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↓', scaledX, scaledY);

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textBaseline = 'bottom';
        ctx.fillText(stairsEntry.label, scaledX, scaledY - 18);
      }

      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error('Failed to load floor image:', imageUrl);
      setImageLoaded(false);
    };

    img.src = imageUrl;
  }, [imageUrl, normalizedPath, isStartFloor, isEndFloor, selectedRoom, stairsExit, stairsEntry]);

  // No image fallback
  if (!imageUrl) {
    return (
      <Card className="p-6 bg-white border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isStartFloor ? 'bg-blue-500' : isEndFloor ? 'bg-red-500' : 'bg-emerald-500'
          }`}>
            {isStartFloor ? (
              <Navigation className="w-5 h-5 text-white" />
            ) : isEndFloor ? (
              <Flag className="w-5 h-5 text-white" />
            ) : (
              <MapPin className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{floorName}</h3>
            <p className="text-sm text-gray-500">
              {isStartFloor && 'Siz shu yerdasiz'}
              {isEndFloor && !isStartFloor && 'Manzil'}
              {!isStartFloor && !isEndFloor && "O'tish qavati"}
            </p>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
          Qavat xaritasi yuklanmagan
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-gray-200">
      {/* Floor Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isStartFloor ? 'bg-blue-500' : isEndFloor ? 'bg-red-500' : stairsEntry ? 'bg-amber-500' : 'bg-emerald-500'
          }`}>
            {isStartFloor ? (
              <Navigation className="w-5 h-5 text-white" />
            ) : isEndFloor ? (
              <Flag className="w-5 h-5 text-white" />
            ) : stairsEntry ? (
              <ArrowUpDown className="w-5 h-5 text-white" />
            ) : (
              <MapPin className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{floorName}</h3>
            <p className="text-sm text-gray-500">
              {isStartFloor && 'Siz shu yerdasiz'}
              {isEndFloor && !isStartFloor && 'Manzil'}
              {!isStartFloor && !isEndFloor && "O'tish qavati"}
            </p>
          </div>
        </div>

        {stairsExit && (
          <div className="flex items-center gap-2 text-amber-600">
            <ArrowUp className="w-5 h-5" />
            <span className="text-sm font-medium">{stairsExit.label} ga boring</span>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div ref={containerRef} className="relative bg-gray-50 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxHeight: '500px' }}
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-4 text-sm">
            {isStartFloor && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-gray-600">Siz shu yerda</span>
              </div>
            )}
            {isEndFloor && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-gray-600">Manzil</span>
              </div>
            )}
            {(stairsExit || stairsEntry) && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-gray-600">Zina</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-emerald-500" style={{ borderRadius: 2 }} />
              <span className="text-gray-600">Yo'l</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {instructions && instructions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-semibold text-xs">{index + 1}</span>
                </div>
                <p className="text-gray-700 text-sm">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}