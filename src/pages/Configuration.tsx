import { useState, useRef } from 'react';
import { useConfigStore, type Configuration } from '@/stores/configStore';
import { useAlertStore } from '@/stores/alertStore';
import { useSiteStore } from '@/stores/siteStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Users, Shield, Upload } from 'lucide-react';
import { ZoneEditor } from '@/components/ZoneEditor';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ConfigType = 'crowd_detection' | 'intrusion_detection';

export default function Configuration() {
  const { configurations, addConfiguration, updateConfiguration, deleteConfiguration } = useConfigStore();
  const { addAlert } = useAlertStore();
  const { sites } = useSiteStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [configStep, setConfigStep] = useState(1);
  const [configType, setConfigType] = useState<ConfigType>('crowd_detection');
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [threshold, setThreshold] = useState('30');
  const [uploadedPreview, setUploadedPreview] = useState<string>('');

  // Get all cameras from all sites
  const allCameras = sites.flatMap(site => 
    site.cameras.map(cam => ({ ...cam, siteName: site.name, siteId: site.id }))
  );

  // Filter cameras by selected site
  const filteredCameras = selectedSite
    ? allCameras.filter(cam => cam.siteId === selectedSite)
    : [];

  const crowdConfigs = configurations.filter((c) => c.type === 'crowd_detection');
  const intrusionConfigs = configurations.filter((c) => c.type === 'intrusion_detection');

  const handleAddConfig = () => {
    setIsAddDialogOpen(true);
    setConfigStep(1);
    setSelectedCamera('');
    setSelectedSite('');
    setThreshold('30');
    setUploadedPreview('');
  };

  const handleSiteChange = (siteId: string) => {
    setSelectedSite(siteId);
    setSelectedCamera(''); // Reset camera when site changes
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedPreview(event.target?.result as string);
      toast.success('Media uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    if (selectedCamera && selectedSite && threshold) {
      setConfigStep(2);
    }
  };

  const getSelectedCameraImage = () => {
    // Use uploaded preview first, then camera's uploaded media, then streamUrl, finally placeholder
    if (uploadedPreview) return uploadedPreview;
    
    const camera = allCameras.find((c) => c.id === selectedCamera);
    if (!camera) return '/placeholder.svg';
    
    // Use first uploaded media if available
    if (camera.uploadedMedia && camera.uploadedMedia.length > 0) {
      return camera.uploadedMedia[0];
    }
    
    return camera.streamUrl || '/placeholder.svg';
  };

  const handleSaveZone = (zone: any) => {
    const camera = allCameras.find((c) => c.id === selectedCamera);
    if (!camera) return;

    const snapshotUrl = uploadedPreview || 
      (camera.uploadedMedia && camera.uploadedMedia.length > 0 ? camera.uploadedMedia[0] : camera.streamUrl) || 
      '/placeholder.svg';

    if (editingConfig) {
      updateConfiguration(editingConfig.id, zone);
      setEditingConfig(null);
    } else {
      const newConfig = {
        type: configType,
        cameraId: selectedCamera,
        cameraName: camera.name,
        site: selectedSite,
        threshold: parseInt(threshold),
        zone,
      };
      addConfiguration(newConfig);

      // Auto-generate alert for the new configuration
      addAlert({
        type: configType === 'crowd_detection' ? 'crowd_detection' : 'intrusion_alert',
        cameraId: selectedCamera,
        cameraName: camera.name,
        zoneId: `zone-${Date.now()}`,
        zoneName: `${configType === 'crowd_detection' ? 'Crowd Zone' : 'Intrusion Line'} - ${camera.name}`,
        count: configType === 'crowd_detection' ? parseInt(threshold) : undefined,
        severity: 'Medium',
        timestamp: new Date().toISOString(),
        snapshotUrl: snapshotUrl,
      });
    }

    setIsAddDialogOpen(false);
    setConfigStep(1);
    setUploadedPreview('');
  };

  const handleAnnotate = (config: Configuration) => {
    setEditingConfig(config);
    setConfigType(config.type);
    setSelectedCamera(config.cameraId);
    setSelectedSite(config.site);
    setThreshold(config.threshold.toString());
    setConfigStep(2);
    setIsAddDialogOpen(true);
  };

  const renderConfigTable = (configs: Configuration[], type: ConfigType) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Camera</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Threshold</TableHead>
          <TableHead>Zone Points</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No configurations yet
            </TableCell>
          </TableRow>
        ) : (
          configs.map((config) => (
            <TableRow key={config.id}>
              <TableCell className="font-medium">{config.cameraName}</TableCell>
              <TableCell>{config.site}</TableCell>
              <TableCell>
                <Badge variant="outline">{config.threshold}</Badge>
              </TableCell>
              <TableCell>{config.zone.length} points</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(config.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleAnnotate(config)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteConfiguration(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground">Manage detection zones and settings</p>
        </div>
        <Button onClick={handleAddConfig}>
          <Plus className="mr-2 h-4 w-4" />
          Add Configuration
        </Button>
      </div>

      <Tabs defaultValue="crowd" className="space-y-6">
        <TabsList>
          <TabsTrigger value="crowd" onClick={() => setConfigType('crowd_detection')}>
            <Users className="mr-2 h-4 w-4" />
            Crowd Detection
          </TabsTrigger>
          <TabsTrigger value="intrusion" onClick={() => setConfigType('intrusion_detection')}>
            <Shield className="mr-2 h-4 w-4" />
            Intrusion Detection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crowd">
          <Card>
            <CardHeader>
              <CardTitle>Crowd Detection Configurations</CardTitle>
              <CardDescription>Polygon zones for crowd monitoring</CardDescription>
            </CardHeader>
            <CardContent>{renderConfigTable(crowdConfigs, 'crowd_detection')}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intrusion">
          <Card>
            <CardHeader>
              <CardTitle>Intrusion Detection Configurations</CardTitle>
              <CardDescription>Line zones for boundary violation</CardDescription>
            </CardHeader>
            <CardContent>{renderConfigTable(intrusionConfigs, 'intrusion_detection')}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
            </DialogTitle>
          </DialogHeader>

          {configStep === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site">Select Site</Label>
                <Select value={selectedSite} onValueChange={handleSiteChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="camera">Select Camera</Label>
                <Select 
                  value={selectedCamera} 
                  onValueChange={setSelectedCamera}
                  disabled={!selectedSite}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedSite ? "Choose a camera" : "Select a site first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">
                  Threshold {configType === 'crowd_detection' ? '(People Count)' : '(Sensitivity)'}
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="Enter threshold value"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleNextStep} disabled={!selectedCamera || !selectedSite || !threshold}>
                  Next: Draw Zone
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                    <p className="text-sm font-medium">
                      {allCameras.find((c) => c.id === selectedCamera)?.name} - {sites.find(s => s.id === selectedSite)?.name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <ZoneEditor
                imageUrl={getSelectedCameraImage()}
                initialZone={editingConfig?.zone}
                mode={configType === 'crowd_detection' ? 'polygon' : 'line'}
                onSave={handleSaveZone}
                onCancel={() => {
                  setIsAddDialogOpen(false);
                  setConfigStep(1);
                  setEditingConfig(null);
                  setUploadedPreview('');
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
