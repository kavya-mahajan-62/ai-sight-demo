import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { Button } from './ui/button';
import { Undo, Save, Trash2, Upload, Pencil, Camera, Play, Pause, Image as ImageIcon } from 'lucide-react';
import { ZonePoint } from '@/stores/configStore';
import Konva from 'konva';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

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
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [useLiveFeed, setUseLiveFeed] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(initialZone.length > 0);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasSnapshotRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (useLiveFeed) {
      // Use live feed placeholder
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setImage(img);
        setDimensions({ width: 600, height: 450 });
      };
      return;
    }

    if (mediaType === 'video' && uploadedMedia) {
      // For video, capture frame as image
      return;
    }

    // Load image
    const img = new window.Image();
    img.src = uploadedMedia || imageUrl;
    img.onload = () => {
      setImage(img);
      const aspectRatio = img.height / img.width;
      const width = 600;
      setDimensions({
        width,
        height: width * aspectRatio,
      });
    };
  }, [imageUrl, uploadedMedia, useLiveFeed, mediaType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please upload an image or video file');
      return;
    }

    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    setMediaType(fileType);
    setUseLiveFeed(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedMedia(result);
      toast.success(`${fileType === 'video' ? 'Video' : 'Image'} uploaded successfully`);
    };
    reader.readAsDataURL(file);
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
    if (!canvasSnapshotRef.current) return;
    const dataUrl = canvasSnapshotRef.current.toDataURL('image/png');
    setCapturedSnapshot(dataUrl);
    toast.success('Snapshot captured successfully');
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
    if ((mode === 'polygon' && points.length >= 3) || (mode === 'line' && points.length === 2)) {
      onSave(points);
      if (capturedSnapshot) {
        // Snapshot will be used in alerts
        toast.success('Zone saved with snapshot');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const flattenedPoints = points.flatMap((p) => [p.x * dimensions.width, p.y * dimensions.height]);
  const canSave = (mode === 'polygon' && points.length >= 3) || (mode === 'line' && points.length === 2);

  return (
    <div ref={containerRef} className="flex gap-6">
      {/* Left Pane: Camera Preview */}
      <div className="flex-1 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Camera Preview</h3>
            <div className="flex items-center gap-3">
              <Label htmlFor="live-feed" className="text-sm">Live Feed</Label>
              <Switch
                id="live-feed"
                checked={useLiveFeed}
                onCheckedChange={(checked) => {
                  setUseLiveFeed(checked);
                  if (checked) {
                    setUploadedMedia(null);
                    setMediaType(null);
                  }
                }}
              />
            </div>
          </div>

          {!uploadedMedia && !useLiveFeed && (
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.mp4"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image/Video
              </Button>
            </div>
          )}

          {uploadedMedia && mediaType === 'video' && (
            <div className="space-y-2">
              <video
                ref={videoRef}
                src={uploadedMedia}
                className="hidden"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
              />
              <canvas ref={canvasSnapshotRef} className="hidden" />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={videoDuration || 0}
                step="0.1"
                value={videoCurrentTime}
                onChange={handleVideoSeek}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-muted/50">
          {!image ? (
            <div className="flex items-center justify-center h-[450px] bg-muted">
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {useLiveFeed ? 'Live feed placeholder' : 'Upload media or enable live feed'}
                </p>
              </div>
            </div>
          ) : (
            <Stage
              width={dimensions.width}
              height={dimensions.height}
              onClick={handleStageClick}
              onDblClick={handleDoubleClick}
              className={drawingEnabled ? "cursor-crosshair" : "cursor-default"}
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
                
                {points.length > 0 && (
                  <>
                    <Line
                      points={flattenedPoints}
                      stroke="hsl(195, 92%, 48%)"
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
                        radius={8}
                        fill="hsl(195, 92%, 48%)"
                        stroke="hsl(0, 0%, 100%)"
                        strokeWidth={2}
                        draggable={drawingEnabled}
                        onDragMove={(e) => handlePointDragMove(i, e)}
                        onMouseEnter={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container && drawingEnabled) {
                            container.style.cursor = 'move';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) {
                            container.style.cursor = drawingEnabled ? 'crosshair' : 'default';
                          }
                        }}
                      />
                    ))}
                  </>
                )}
              </Layer>
            </Stage>
          )}
        </div>
      </div>

      {/* Right Pane: Toolbar */}
      <div className="w-64 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Drawing Tools</h3>
          <p className="text-xs text-muted-foreground">
            {mode === 'polygon'
              ? 'Click to add points, double-click to close'
              : 'Click start and end points'}
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Mode</Label>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            {mode === 'polygon' ? (
              <>
                <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Draw Polygon</p>
                  <p className="text-xs text-muted-foreground">Crowd ROI</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
                  <Pencil className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Draw Line</p>
                  <p className="text-xs text-muted-foreground">Intrusion Line</p>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Actions</Label>
          
          {!drawingEnabled && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setDrawingEnabled(true)}
              disabled={!image}
              className="w-full"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Start Drawing
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={points.length === 0 || !drawingEnabled}
            className="w-full"
          >
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={points.length === 0 || !drawingEnabled}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>

          {mediaType === 'video' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCaptureSnapshot}
              disabled={!image}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              Snapshot
            </Button>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Points: {points.length}</p>
            <p>• Status: {drawingEnabled ? 'Drawing' : 'Viewing'}</p>
            {capturedSnapshot && <p>• Snapshot: Captured ✓</p>}
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Zone
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
