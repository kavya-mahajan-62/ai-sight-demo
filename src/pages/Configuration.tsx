import { useState } from 'react';
import { useConfigStore, type Configuration } from '@/stores/configStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Users, Shield } from 'lucide-react';
import { getActiveCameras, SITES } from '@/lib/mockData';
import { ZoneEditor } from '@/components/ZoneEditor';
import { Badge } from '@/components/ui/badge';

type ConfigType = 'crowd_detection' | 'intrusion_detection';

export default function Configuration() {
  const { configurations, addConfiguration, updateConfiguration, deleteConfiguration } = useConfigStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [configStep, setConfigStep] = useState(1);
  const [configType, setConfigType] = useState<ConfigType>('crowd_detection');
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);

  // Form state
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [threshold, setThreshold] = useState('30');

  const cameras = getActiveCameras();
  const crowdConfigs = configurations.filter((c) => c.type === 'crowd_detection');
  const intrusionConfigs = configurations.filter((c) => c.type === 'intrusion_detection');

  const handleAddConfig = () => {
    setIsAddDialogOpen(true);
    setConfigStep(1);
    setSelectedCamera('');
    setSelectedSite('');
    setThreshold('30');
  };

  const handleNextStep = () => {
    if (selectedCamera && selectedSite && threshold) {
      setConfigStep(2);
    }
  };

  const handleSaveZone = (zone: any) => {
    const camera = cameras.find((c) => c.id === selectedCamera);
    if (!camera) return;

    if (editingConfig) {
      updateConfiguration(editingConfig.id, zone);
      setEditingConfig(null);
    } else {
      addConfiguration({
        type: configType,
        cameraId: selectedCamera,
        cameraName: camera.name,
        site: selectedSite,
        threshold: parseInt(threshold),
        zone,
      });
    }

    setIsAddDialogOpen(false);
    setConfigStep(1);
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
            </DialogTitle>
          </DialogHeader>

          {configStep === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="camera">Select Camera</Label>
                <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {SITES.map((site) => (
                      <SelectItem key={site} value={site}>
                        {site}
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
            <ZoneEditor
              imageUrl="/placeholder.svg"
              initialZone={editingConfig?.zone}
              mode={configType === 'crowd_detection' ? 'polygon' : 'line'}
              onSave={handleSaveZone}
              onCancel={() => {
                setIsAddDialogOpen(false);
                setConfigStep(1);
                setEditingConfig(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
