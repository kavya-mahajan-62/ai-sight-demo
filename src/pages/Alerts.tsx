import { useState } from 'react';
import { useAlertStore, Alert as AlertType } from '@/stores/alertStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, CheckCircle, AlertTriangle, Users, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { getActiveCameras } from '@/lib/mockData';

export default function Alerts() {
  const { alerts, acknowledgeAlert } = useAlertStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cameraFilter, setCameraFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cameras = getActiveCameras();

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.cameraName.toLowerCase().includes(search.toLowerCase()) ||
      alert.zoneName.toLowerCase().includes(search.toLowerCase()) ||
      alert.id.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesCamera = cameraFilter === 'all' || alert.cameraId === cameraFilter;

    return matchesSearch && matchesType && matchesCamera && !alert.acknowledged;
  });

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-destructive text-destructive-foreground';
      case 'High':
        return 'bg-warning text-warning-foreground';
      case 'Medium':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'crowd_detection' ? Users : Shield;
  };

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts & Events</h1>
        <p className="text-muted-foreground">Monitor and manage active alerts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Real-time alerts from surveillance system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, camera, or zone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="crowd_detection">Crowd Detection</SelectItem>
                <SelectItem value="intrusion_alert">Intrusion Alert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cameraFilter} onValueChange={setCameraFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cameras</SelectItem>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Camera</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No active alerts
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAlerts.map((alert) => {
                    const TypeIcon = getTypeIcon(alert.type);
                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-mono text-xs">{alert.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            <span className="text-sm">
                              {alert.type === 'crowd_detection' ? 'Crowd' : 'Intrusion'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{alert.cameraName}</TableCell>
                        <TableCell>{alert.zoneName}</TableCell>
                        <TableCell>{alert.count || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredAlerts.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAlerts.length)} of{' '}
                {filteredAlerts.length} alerts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={selectedAlert.snapshotUrl}
                  alt="Alert snapshot"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Event ID</p>
                  <p className="font-mono text-sm">{selectedAlert.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {selectedAlert.type === 'crowd_detection' ? 'Crowd Detection' : 'Intrusion Alert'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Camera</p>
                  <p className="font-medium">{selectedAlert.cameraName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zone</p>
                  <p className="font-medium">{selectedAlert.zoneName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {format(new Date(selectedAlert.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                {selectedAlert.count && (
                  <div>
                    <p className="text-sm text-muted-foreground">People Count</p>
                    <p className="font-medium">{selectedAlert.count}</p>
                  </div>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  acknowledgeAlert(selectedAlert.id);
                  setSelectedAlert(null);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Acknowledge Alert
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
