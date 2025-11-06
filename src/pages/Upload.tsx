import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload as UploadIcon, Image as ImageIcon, Video, Pencil, Play, Trash2 } from 'lucide-react';
import { ZoneEditor } from '@/components/ZoneEditor';
import { mockWebSocket } from '@/lib/websocket';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  uploadDate: string;
  zone?: any[];
}

export default function Upload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    
    uploadedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.startsWith('image') ? 'image' : 'video',
          url: event.target?.result as string,
          uploadDate: new Date().toISOString(),
        };
        setFiles((prev) => [...prev, newFile]);
        toast.success(`${file.name} uploaded successfully`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnnotate = (file: UploadedFile) => {
    setSelectedFile(file);
    setIsAnnotating(true);
  };

  const handleSaveZone = (zone: any) => {
    if (selectedFile) {
      setFiles((prev) =>
        prev.map((f) => (f.id === selectedFile.id ? { ...f, zone } : f))
      );
      toast.success('Zone annotation saved');
    }
    setIsAnnotating(false);
    setSelectedFile(null);
  };

  const handleSimulate = (file: UploadedFile) => {
    if (!file.zone || file.zone.length === 0) {
      toast.error('Please annotate the file first');
      return;
    }

    setIsSimulating(true);
    toast.info('Simulation started', {
      description: 'Generating mock detection events...',
    });

    // Simulate detection events
    setTimeout(() => {
      const eventType = Math.random() > 0.5 ? 'people_detection' : 'intrusion_alert';
      mockWebSocket['emitRandomEvent']();
      setIsSimulating(false);
      toast.success('Simulation completed', {
        description: `Generated ${eventType} event`,
      });
    }, 2000);
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success('File deleted');
  };

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload & Simulate</h1>
        <p className="text-muted-foreground">Upload media files and simulate detection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>Upload images or videos for annotation and simulation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-12">
            <label className="cursor-pointer text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Support for JPG, PNG, MP4, WEBM
              </p>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                      {file.type === 'image' ? (
                        <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                      ) : (
                        <video src={file.url} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {file.type === 'image' ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        </Badge>
                      </div>
                      {file.zone && (
                        <Badge variant="secondary" className="text-xs">
                          Zone: {file.zone.length} points
                        </Badge>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAnnotate(file)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Annotate
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSimulate(file)}
                          disabled={!file.zone || isSimulating}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Simulate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAnnotating} onOpenChange={setIsAnnotating}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Annotate {selectedFile?.name}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <ZoneEditor
              imageUrl={selectedFile.url}
              initialZone={selectedFile.zone}
              mode="polygon"
              onSave={handleSaveZone}
              onCancel={() => {
                setIsAnnotating(false);
                setSelectedFile(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
