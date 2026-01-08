import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Flag } from 'lucide-react';
import { PathStep, Room } from '@/lib/api/types';

interface KioskFloorMapProps {
  floorId: number;
  floorName: string;
  imageUrl: string | null;
  pathSteps: PathStep[];
  isStartFloor: boolean;
  isEndFloor: boolean;
  selectedRoom: Room | null;
}

export function KioskFloorMap({
  floorId,
  floorName,
  imageUrl,
  pathSteps,
  isStartFloor,
  isEndFloor,
  selectedRoom,
}: KioskFloorMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current || pathSteps.length === 0) return;

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

      // Draw path
      if (pathSteps.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([10, 5]);

        const firstStep = pathSteps[0];
        ctx.moveTo(firstStep.x * pathScale, firstStep.y * pathScale);

        pathSteps.slice(1).forEach((step) => {
          ctx.lineTo(step.x * pathScale, step.y * pathScale);
        });

        ctx.stroke();
      }

      // Draw waypoint markers
      pathSteps.forEach((step, index) => {
        const x = step.x * pathScale;
        const y = step.y * pathScale;

        // Draw circle for each waypoint
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw start marker (if this is start floor)
      if (isStartFloor && pathSteps.length > 0) {
        const startStep = pathSteps[0];
        const x = startStep.x * pathScale;
        const y = startStep.y * pathScale;

        // Draw "You are here" marker
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#3B82F6';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw pulse effect
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw end marker (if this is end floor)
      if (isEndFloor && pathSteps.length > 0) {
        const endStep = pathSteps[pathSteps.length - 1];
        const x = endStep.x * pathScale;
        const y = endStep.y * pathScale;

        // Draw destination marker
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw flag icon or label
        if (selectedRoom) {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.fillText(selectedRoom.name, x, y - 25);
        }
      }

      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error('Failed to load floor image:', imageUrl);
      setImageLoaded(false);
    };

    img.src = imageUrl;
  }, [imageUrl, pathSteps, isStartFloor, isEndFloor, selectedRoom]);

  // No image fallback - just show path coordinates
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
              {!isStartFloor && !isEndFloor && "O'tish qavatai"}
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-emerald-500" style={{ borderRadius: 2 }} />
              <span className="text-gray-600">Yo'l</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}