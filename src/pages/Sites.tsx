import { useState } from 'react';
import { useSiteStore, Site, SiteCamera } from '@/stores/siteStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, Video, Building2, Upload, X, Play } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

export default function Sites() {
  const { sites, addSite, updateSite, deleteSite, addCamera, updateCamera, deleteCamera } = useSiteStore();
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [editingCamera, setEditingCamera] = useState<SiteCamera | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [expandedSites, setExpandedSites] = useState<string[]>([]);

  // Site form state
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [siteStatus, setSiteStatus] = useState<'active' | 'inactive'>('active');

  // Camera form state
  const [cameraName, setCameraName] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleOpenSiteDialog = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setSiteName(site.name);
      setSiteAddress(site.address);
      setSiteLocation(site.location || '');
      setSiteStatus(site.status);
    } else {
      setEditingSite(null);
      setSiteName('');
      setSiteAddress('');
      setSiteLocation('');
      setSiteStatus('active');
    }
    setIsSiteDialogOpen(true);
  };

  const handleSaveSite = () => {
    if (!siteName || !siteAddress) {
      toast.error('Site name and address are required');
      return;
    }

    if (editingSite) {
      updateSite(editingSite.id, {
        name: siteName,
        address: siteAddress,
        location: siteLocation,
        status: siteStatus,
      });
      toast.success('Site updated successfully');
    } else {
      addSite({
        name: siteName,
        address: siteAddress,
        location: siteLocation,
        status: siteStatus,
      });
      toast.success('Site created successfully');
    }

    setIsSiteDialogOpen(false);
  };

  const handleDeleteSite = (id: string) => {
    deleteSite(id);
    toast.success('Site deleted');
  };

  const handleOpenCameraDialog = (siteId: string, camera?: SiteCamera) => {
    setSelectedSiteId(siteId);
    if (camera) {
      setEditingCamera(camera);
      setCameraName(camera.name);
      setCameraId(camera.cameraId);
      setStreamUrl(camera.streamUrl);
      setCameraActive(camera.active);
      setUploadedFiles(camera.uploadedMedia || []);
    } else {
      setEditingCamera(null);
      setCameraName('');
      setCameraId('');
      setStreamUrl('');
      setCameraActive(true);
      setUploadedFiles([]);
    }
    setIsCameraDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 50MB.`);
        return;
      }

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported format.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedFiles((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    toast.success('Files uploaded successfully');
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveCamera = () => {
    if (!cameraName || !cameraId) {
      toast.error('Camera name and ID are required');
      return;
    }

    if (editingCamera) {
      updateCamera(selectedSiteId, editingCamera.id, {
        name: cameraName,
        cameraId: cameraId,
        streamUrl: streamUrl || (uploadedFiles.length > 0 ? uploadedFiles[0] : '/placeholder.svg'),
        uploadedMedia: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        active: cameraActive,
      });
      toast.success('Camera updated successfully');
    } else {
      addCamera(selectedSiteId, {
        name: cameraName,
        cameraId: cameraId,
        streamUrl: streamUrl || (uploadedFiles.length > 0 ? uploadedFiles[0] : '/placeholder.svg'),
        uploadedMedia: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        active: cameraActive,
      });
      toast.success('Camera added successfully');
    }

    setIsCameraDialogOpen(false);
    setEditingCamera(null);
  };

  const handleDeleteCamera = (siteId: string, cameraId: string) => {
    deleteCamera(siteId, cameraId);
    toast.success('Camera removed');
  };

  const toggleSiteExpansion = (siteId: string) => {
    setExpandedSites((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
          <p className="text-muted-foreground">Manage surveillance sites and cameras</p>
        </div>
        <Button onClick={() => handleOpenSiteDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Site
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sites</CardTitle>
          <CardDescription>View and manage all surveillance locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sites.map((site) => (
              <Collapsible
                key={site.id}
                open={expandedSites.includes(site.id)}
                onOpenChange={() => toggleSiteExpansion(site.id)}
              >
                <div className="rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                          {expandedSites.includes(site.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{site.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{site.address}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{site.cameras.length}</p>
                          <p className="text-xs text-muted-foreground">Cameras</p>
                        </div>

                        <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                          {site.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenSiteDialog(site)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSite(site.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="border-t border-border p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold">Cameras</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCameraDialog(site.id)}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Camera
                        </Button>
                      </div>

                      {site.cameras.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          No cameras added yet
                        </p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {site.cameras.map((camera) => (
                            <div
                              key={camera.id}
                              className="rounded-lg border border-border bg-card p-3"
                            >
                              <div className="aspect-video overflow-hidden rounded-md bg-muted mb-2">
                                {camera.uploadedMedia && camera.uploadedMedia.length > 0 ? (
                                  camera.uploadedMedia[0].startsWith('data:video') ? (
                                    <video
                                      src={camera.uploadedMedia[0]}
                                      className="h-full w-full object-cover"
                                      controls
                                    />
                                  ) : (
                                    <img
                                      src={camera.uploadedMedia[0]}
                                      alt={camera.name}
                                      className="h-full w-full object-cover"
                                    />
                                  )
                                ) : (
                                  <img
                                    src={camera.streamUrl}
                                    alt={camera.name}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{camera.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      ID: {camera.cameraId}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={camera.active ? 'default' : 'secondary'}
                                    className="ml-2 text-xs"
                                  >
                                    {camera.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleOpenCameraDialog(site.id, camera)}
                                  >
                                    <Pencil className="mr-2 h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteCamera(site.id, camera.id)}
                                  >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Dialog */}
      <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSite ? 'Edit Site' : 'Create New Site'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">
                Site Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g., Headquarters Building"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="e.g., 123 Main Street"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="e.g., Ground Floor, Building A"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="status">Active Status</Label>
              <Switch
                id="status"
                checked={siteStatus === 'active'}
                onCheckedChange={(checked) => setSiteStatus(checked ? 'active' : 'inactive')}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSiteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSite}>
                {editingSite ? 'Save Changes' : 'Create Site'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCamera ? 'Edit Camera' : 'Add Camera'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="camera-name">
                Camera Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="camera-name"
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                placeholder="e.g., Main Entrance Camera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="camera-id">
                Camera ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="camera-id"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                placeholder="e.g., CAM-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-url">Stream URL (Optional)</Label>
              <Input
                id="stream-url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="e.g., rtsp://camera-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-upload">Upload Media (JPG, PNG, MP4, WEBM)</Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('media-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images/Videos
                </Button>
                <input
                  id="media-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                          {file.startsWith('data:video') ? (
                            <div className="relative h-full w-full flex items-center justify-center bg-muted">
                              <Play className="h-8 w-8 text-muted-foreground" />
                              <video src={file} className="absolute inset-0 h-full w-full object-cover opacity-50" />
                            </div>
                          ) : (
                            <img src={file} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="camera-active">Active</Label>
              <Switch
                id="camera-active"
                checked={cameraActive}
                onCheckedChange={setCameraActive}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCameraDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCamera}>
                {editingCamera ? 'Save Changes' : 'Add Camera'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
