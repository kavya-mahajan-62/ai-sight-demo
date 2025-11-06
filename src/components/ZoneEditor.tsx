import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { Button } from './ui/button';
import { Undo, Save, Trash2 } from 'lucide-react';
import { ZonePoint } from '@/stores/configStore';
import Konva from 'konva';

interface ZoneEditorProps {
  imageUrl: string;
  initialZone?: ZonePoint[];
  mode: 'polygon' | 'line';
  onSave: (zone: ZonePoint[]) => void;
  onCancel: () => void;
}

export const ZoneEditor = ({ imageUrl, initialZone = [], mode, onSave, onCancel }: ZoneEditorProps) => {
  const [points, setPoints] = useState<ZonePoint[]>(initialZone);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      
      // Calculate dimensions to fit container
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const aspectRatio = img.height / img.width;
        setDimensions({
          width: containerWidth,
          height: containerWidth * aspectRatio,
        });
      }
    };
  }, [imageUrl]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    // Normalize coordinates (0-1 range)
    const normalizedPoint = {
      x: point.x / dimensions.width,
      y: point.y / dimensions.height,
    };

    if (mode === 'line' && points.length >= 2) {
      // Line mode: only 2 points
      return;
    }

    setPoints([...points, normalizedPoint]);
    setIsDrawing(true);
  };

  const handleDoubleClick = () => {
    if (mode === 'polygon' && points.length >= 3) {
      // Close polygon on double click
      setIsDrawing(false);
    }
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPoints([]);
    setIsDrawing(false);
  };

  const handleSave = () => {
    if ((mode === 'polygon' && points.length >= 3) || (mode === 'line' && points.length === 2)) {
      onSave(points);
    }
  };

  const flattenedPoints = points.flatMap((p) => [p.x * dimensions.width, p.y * dimensions.height]);
  const canSave = (mode === 'polygon' && points.length >= 3) || (mode === 'line' && points.length === 2);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Draw {mode === 'polygon' ? 'Area of Interest' : 'Intrusion Line'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'polygon'
              ? 'Click to add points, double-click to close polygon'
              : 'Click start and end points to define line'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={points.length === 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={points.length === 0}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-muted">
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleStageClick}
          onDblClick={handleDoubleClick}
          className="cursor-crosshair"
        >
          <Layer>
            {image && <KonvaImage image={image} width={dimensions.width} height={dimensions.height} />}
            
            {points.length > 0 && (
              <>
                <Line
                  points={flattenedPoints}
                  stroke="#00d4ff"
                  strokeWidth={3}
                  lineCap="round"
                  lineJoin="round"
                  closed={mode === 'polygon' && !isDrawing}
                  fill={mode === 'polygon' && !isDrawing ? 'rgba(0, 212, 255, 0.2)' : undefined}
                />
                {points.map((point, i) => (
                  <Circle
                    key={i}
                    x={point.x * dimensions.width}
                    y={point.y * dimensions.height}
                    radius={6}
                    fill="#00d4ff"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </>
            )}
          </Layer>
        </Stage>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Zone
        </Button>
      </div>
    </div>
  );
};
