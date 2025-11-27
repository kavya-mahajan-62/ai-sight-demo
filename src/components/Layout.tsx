import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useEffect } from 'react';
import { getWebSocketInstance, type WebSocketMessage } from '@/services/websocket';
import { useAlertStore } from '@/stores/alertStore';
import { toast } from 'sonner';

export const Layout = () => {
  const { isAuthenticated } = useAuthStore();
  const addAlert = useAlertStore((state) => state.addAlert);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Only use production WebSocket in production mode
    if (import.meta.env.DEV) {
      console.log('[Layout] Development mode - WebSocket disabled');
      return;
    }

    const ws = getWebSocketInstance({
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
    });

    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === 'alert') {
        const data = message.data as any;
        addAlert({
          type: data.type,
          cameraId: data.cameraId,
          cameraName: data.cameraName,
          zoneId: data.zoneId,
          zoneName: data.zoneName,
          count: data.count,
          severity: data.severity,
          timestamp: data.timestamp,
          snapshotUrl: data.snapshotUrl,
        });

        toast.error(`New ${data.type === 'crowd_detection' ? 'Crowd' : 'Intrusion'} Alert`, {
          description: `${data.cameraName} - ${data.zoneName}`,
        });
      }
    };

    const unsubscribe = ws.onMessage(handleMessage);
    ws.connect();

    return () => {
      unsubscribe();
      ws.disconnect();
    };
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
