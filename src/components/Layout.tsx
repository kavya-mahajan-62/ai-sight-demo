import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useEffect } from 'react';
import { mockWebSocket } from '@/lib/websocket';
import { useAlertStore } from '@/stores/alertStore';
import { toast } from 'sonner';

export const Layout = () => {
  const { isAuthenticated } = useAuthStore();
  const addAlert = useAlertStore((state) => state.addAlert);

  useEffect(() => {
    if (isAuthenticated) {
      mockWebSocket.connect();

      const handleMessage = (message: any) => {
        addAlert({
          type: message.type,
          cameraId: message.data.cameraId,
          cameraName: message.data.cameraName,
          zoneId: message.data.zoneId,
          zoneName: message.data.zoneName,
          count: message.data.count,
          severity: message.data.severity,
          timestamp: message.data.timestamp,
          snapshotUrl: message.data.snapshotUrl,
        });

        toast.error(`New ${message.type === 'crowd_detection' ? 'Crowd' : 'Intrusion'} Alert`, {
          description: `${message.data.cameraName} - ${message.data.zoneName}`,
        });
      };

      mockWebSocket.on(handleMessage);

      return () => {
        mockWebSocket.off(handleMessage);
        mockWebSocket.disconnect();
      };
    }
  }, [isAuthenticated, addAlert]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
