import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage, Line, Circle, Polyline } from 'fabric';
import { Waypoint, PathStep, Floor } from '@/lib/api/types';
import { resolveMediaUrl } from '@/lib/media';

interface NavigationFloorMapProps {
  floor: Floor;
  waypoints: Waypoint[];
  pathSteps: PathStep[];
  isCurrentFloor?: boolean;
}

const WAYPOINT_COLORS: Record<string, string> = {
  hallway: '#4A90D9',
  room: '#22C55E',
  stairs: '#F59E0B',
  elevator: '#A855F7',
  hall: '#EF4444',
  kiosk: '#EC4899', // Pink for kiosk
};

export function NavigationFloorMap({
  floor,
  waypoints,
  pathSteps,
  isCurrentFloor = false,
}: NavigationFloorMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const renderIdRef = useRef(0);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1,
      height: 1,
      backgroundColor: '#1a1a2e',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const drawPath = useCallback(
    (scale: number, offsetX: number, offsetY: number) => {
      if (!fabricCanvas || pathSteps.length < 2) return;

      // Create path coordinates
      const points = pathSteps.map((step) => ({
        x: step.x * scale + offsetX,
        y: step.y * scale + offsetY,
      }));

      const pathLine = new Polyline(points, {
        stroke: '#22C55E',
        strokeWidth: 4,
        fill: 'transparent',
        selectable: false,
        evented: false,
        strokeDashArray: [10, 5],
      });

      (pathLine as unknown as { isPath?: boolean }).isPath = true;
      fabricCanvas.add(pathLine);

      if (points.length >= 2) {
        const startMarker = new Circle({
          left: points[0].x,
          top: points[0].y,
          radius: 8,
          fill: '#3B82F6',
          stroke: '#fff',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        (startMarker as unknown as { isPath?: boolean }).isPath = true;

        const endMarker = new Circle({
          left: points[points.length - 1].x,
          top: points[points.length - 1].y,
          radius: 8,
          fill: '#22C55E',
          stroke: '#fff',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        (endMarker as unknown as { isPath?: boolean }).isPath = true;

        fabricCanvas.add(startMarker);
        fabricCanvas.add(endMarker);
      }
    },
    [fabricCanvas, pathSteps]
  );

  const drawWaypoints = useCallback(
    (scale: number, offsetX: number, offsetY: number) => {
      if (!fabricCanvas) return;

      waypoints.forEach((wp) => {
        const isInPath = pathSteps.some((step) => step.waypoint_id === wp.id);
        if (isInPath) return;

        const circle = new Circle({
          left: wp.x * scale + offsetX,
          top: wp.y * scale + offsetY,
          radius: 5,
          fill: WAYPOINT_COLORS[wp.type] || '#4A90D9',
          stroke: 'rgba(0,0,0,0.3)',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          opacity: 0.5,
        });

        (circle as unknown as { isWaypoint?: boolean }).isWaypoint = true;
        fabricCanvas.add(circle);
      });
    },
    [fabricCanvas, pathSteps, waypoints]
  );

  const renderScene = useCallback(async () => {
    if (!fabricCanvas) return;
    const localRenderId = ++renderIdRef.current;

    // Remove everything except keep backgroundColor.
    fabricCanvas.getObjects().forEach((obj) => fabricCanvas.remove(obj));

    if (!floor?.image_url) {
      fabricCanvas.requestRenderAll();
      return;
    }

    const imageUrl = resolveMediaUrl(floor.image_url);
    let img: FabricImage;
    try {
      img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
    } catch {
      // CORS fallback
      img = await FabricImage.fromURL(imageUrl);
    }

    if (localRenderId !== renderIdRef.current) return;

    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    const scale = Math.min(canvasWidth / (img.width || 1), canvasHeight / (img.height || 1)) * 0.95;
    const offsetX = (canvasWidth - (img.width || 0) * scale) / 2;
    const offsetY = (canvasHeight - (img.height || 0) * scale) / 2;

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: offsetX,
      top: offsetY,
      selectable: false,
      evented: false,
      opacity: 0.8,
    });

    fabricCanvas.add(img);
    fabricCanvas.sendObjectToBack(img);

    drawPath(scale, offsetX, offsetY);
    drawWaypoints(scale, offsetX, offsetY);

    fabricCanvas.requestRenderAll();
  }, [drawPath, drawWaypoints, fabricCanvas, floor?.image_url]);

  // Responsive canvas sizing
  useEffect(() => {
    if (!fabricCanvas) return;
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        fabricCanvas.setDimensions({ width, height }, { cssOnly: false });
        fabricCanvas.calcOffset();
        void renderScene();
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [fabricCanvas, renderScene]);

  // Load floor image and draw path/waypoints
  useEffect(() => {
    void renderScene();
  }, [renderScene]);

  return (
    <div className={`rounded-lg border overflow-hidden ${isCurrentFloor ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
      <div className="bg-muted px-3 py-2 text-sm font-medium flex items-center justify-between">
        <span>{floor.name}</span>
        {isCurrentFloor && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Joriy qavat
          </span>
        )}
      </div>
      <div ref={containerRef} className="w-full aspect-video bg-[#1a1a2e]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
