import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { Button } from './ui/button';
import { Undo, Save, Trash2, Pencil, Camera, Play, Pause } from 'lucide-react';
import { ZonePoint } from '@/stores/configStore';
import Konva from 'konva';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ZoneEditorProps {
  imageUrl: string | null;
  initialZone?: ZonePoint[];
  mode: 'polygon' | 'line';
  onSave: (zone: ZonePoint[], snapshotUrl?: string) => void;
  onCancel: () => void;
  cameraName?: string;
}

export const ZoneEditor = ({ imageUrl, initialZone = [], mode, onSave, onCancel, cameraName }: ZoneEditorProps) => {
  const [points, setPoints] = useState<ZonePoint[]>(initialZone);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [drawingEnabled, setDrawingEnabled] = useState(initialZone.length > 0);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [hasMedia, setHasMedia] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasSnapshotRef = useRef<HTMLCanvasElement>(null);

  // Load image or video from camera
  useEffect(() => {
    if (!imageUrl) {
      setHasMedia(false);
      return;
    }

    setHasMedia(true);

    // Detect if it's a video
    const isVideo = imageUrl.includes('video') || imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') || imageUrl.startsWith('data:video');
    setMediaType(isVideo ? 'video' : 'image');

    if (isVideo) {
      // Video will be handled by video element
      return;
    }

    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      const aspectRatio = img.height / img.width;
      const width = 600;
      setDimensions({
        width,
        height: width * aspectRatio,
      });
      toast.success('Media loaded');
    };
    img.onerror = () => {
      toast.error('Failed to load media');
    };
  }, [imageUrl]);

  const handleReplaceMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 50MB.');
      return;
    }

    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported file format.');
      return;
    }

    toast.info('Media replacement is not yet implemented. Please add media via Site Management.');
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
      captureVideoFrame();
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      captureVideoFrame();
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoCurrentTime(time);
      captureVideoFrame();
    }
  };

  const captureVideoFrame = () => {
    if (!videoRef.current || !canvasSnapshotRef.current) return;
    
    const canvas = canvasSnapshotRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const img = new window.Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      setImage(img);
      const aspectRatio = img.height / img.width;
      const width = 600;
      setDimensions({
        width,
        height: width * aspectRatio,
      });
    };
  };

  const handleCaptureSnapshot = () => {
    if (mediaType === 'video' && videoRef.current && canvasSnapshotRef.current) {
      const video = videoRef.current;
      const canvas = canvasSnapshotRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const snapshotUrl = canvas.toDataURL('image/jpeg');
        setCapturedSnapshot(snapshotUrl);
        
        // Load snapshot as the drawing background
        const img = new window.Image();
        img.onload = () => {
          setImage(img);
          setDimensions({ width: Math.min(600, img.width), height: Math.min(450, img.height) });
        };
        img.src = snapshotUrl;
        
        toast.success('Snapshot captured');
      }
    } else if (image) {
      // For images, just mark as captured
      setCapturedSnapshot(imageUrl || '');
      toast.success('Image ready for drawing');
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawingEnabled) return;
    if (e.target !== e.target.getStage() && !e.target.hasName('background-image')) return;

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

  const handlePointDragMove = (index: number, e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const point = e.target.position();
    const normalizedPoint = {
      x: Math.max(0, Math.min(1, point.x / dimensions.width)),
      y: Math.max(0, Math.min(1, point.y / dimensions.height)),
    };

    const newPoints = [...points];
    newPoints[index] = normalizedPoint;
    setPoints(newPoints);
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
    if (mode === 'polygon' && points.length < 3) {
      toast.error('Polygon must have at least 3 points');
      return;
    }
    if (mode === 'line' && points.length !== 2) {
      toast.error('Line must have exactly 2 points');
      return;
    }
    onSave(points, capturedSnapshot || undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMedia = () => {
    if (!imageUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-[450px] bg-muted rounded-lg border-2 border-dashed border-border">
          <p className="text-sm text-muted-foreground mb-2">No media available</p>
          <p className="text-xs text-muted-foreground">Add media via Site Management</p>
        </div>
      );
    }

    if (mediaType === 'video') {
      return (
        <div className="space-y-2">
          <video
            ref={videoRef}
            src={imageUrl}
            className="w-full h-auto rounded-lg"
            onLoadedMetadata={handleVideoLoadedMetadata}
            onTimeUpdate={handleVideoTimeUpdate}
          />
          <div className="space-y-2 p-2 bg-muted rounded">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  value={videoCurrentTime}
                  onChange={handleVideoSeek}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[80px]">
                {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Camera Preview */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {cameraName || 'Camera Preview'}
              </CardTitle>
              {hasMedia && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace media
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
                className="hidden"
                onChange={handleReplaceMedia}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {renderMedia()}
              {(image || mediaType === 'video') && (
                <div className="mt-4">
                  <Stage
                    width={dimensions.width}
                    height={dimensions.height}
                    className={drawingEnabled ? "cursor-crosshair border border-border rounded-lg" : "border border-border rounded-lg"}
                    onClick={handleStageClick}
                    onDblClick={handleDoubleClick}
                  >
                    <Layer>
                      {image && (
                        <KonvaImage
                          image={image}
                          width={dimensions.width}
                          height={dimensions.height}
                          name="background-image"
                        />
                      )}
                      
                      {/* Draw lines connecting points */}
                      {points.length > 0 && (
                        <Line
                          points={points.flatMap(p => [p.x * dimensions.width, p.y * dimensions.height])}
                          stroke={mode === 'polygon' ? '#3b82f6' : '#ef4444'}
                          strokeWidth={2}
                          closed={mode === 'polygon' && points.length >= 3}
                          fill={mode === 'polygon' ? 'rgba(59, 130, 246, 0.2)' : undefined}
                        />
                      )}

                      {/* Draw draggable points */}
                      {points.map((point, i) => (
                        <Circle
                          key={i}
                          x={point.x * dimensions.width}
                          y={point.y * dimensions.height}
                          radius={6}
                          fill={selectedPointIndex === i ? '#ef4444' : '#3b82f6'}
                          stroke="#fff"
                          strokeWidth={2}
                          draggable={drawingEnabled}
                          onDragMove={(e) => handlePointDragMove(i, e)}
                          onMouseEnter={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) container.style.cursor = 'pointer';
                            setSelectedPointIndex(i);
                          }}
                          onMouseLeave={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) container.style.cursor = drawingEnabled ? 'crosshair' : 'default';
                            setSelectedPointIndex(null);
                          }}
                        />
                      ))}
                    </Layer>
                  </Stage>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Toolbar */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Drawing Tools</CardTitle>
            <CardDescription className="text-xs">
              {mode === 'polygon' 
                ? 'Click to add points. Double-click to close.' 
                : 'Click start and end points.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              {!drawingEnabled && (
                <Button
                  onClick={() => setDrawingEnabled(true)}
                  className="w-full"
                  variant="default"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Start Drawing
                </Button>
              )}
              <Button
                onClick={handleUndo}
                disabled={points.length === 0 || !drawingEnabled}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Undo className="mr-2 h-4 w-4" />
                Undo
              </Button>
              <Button
                onClick={handleClear}
                disabled={points.length === 0 || !drawingEnabled}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              {mediaType === 'video' && (
                <Button
                  onClick={handleCaptureSnapshot}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Snapshot
                </Button>
              )}
            </div>

            {capturedSnapshot && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs">Active Snapshot</Label>
                  <img
                    src={capturedSnapshot}
                    alt="Captured snapshot"
                    className="w-full h-20 object-cover rounded border"
                  />
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSave}
                disabled={
                  (mode === 'polygon' && points.length < 3) ||
                  (mode === 'line' && points.length !== 2) ||
                  !drawingEnabled
                }
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Zone
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm" className="w-full">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden canvas for video frame capture */}
      <canvas ref={canvasSnapshotRef} style={{ display: 'none' }} />
    </div>
  );
};
