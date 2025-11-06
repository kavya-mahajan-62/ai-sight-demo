import { AlertType, AlertSeverity } from '@/stores/alertStore';

export interface WebSocketMessage {
  type: AlertType;
  data: {
    cameraId: string;
    cameraName: string;
    zoneId: string;
    zoneName: string;
    count?: number;
    severity: AlertSeverity;
    snapshotUrl: string;
    timestamp: string;
  };
}

class MockWebSocket {
  private listeners: ((message: WebSocketMessage) => void)[] = [];
  private interval: NodeJS.Timeout | null = null;

  connect() {
    // Simulate WebSocket connection
    console.log('[WebSocket] Mock connection established');
    this.startEmitting();
  }

  disconnect() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('[WebSocket] Mock connection closed');
  }

  on(callback: (message: WebSocketMessage) => void) {
    this.listeners.push(callback);
  }

  off(callback: (message: WebSocketMessage) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  private startEmitting() {
    // Emit random events every 10-30 seconds
    const emit = () => {
      const randomDelay = Math.random() * 20000 + 10000; // 10-30 seconds
      setTimeout(() => {
        this.emitRandomEvent();
        emit();
      }, randomDelay);
    };
    emit();
  }

  private emitRandomEvent() {
    const types: AlertType[] = ['crowd_detection', 'intrusion_alert'];
    const severities: AlertSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
    const cameras = [
      { id: 'cam-001', name: 'Camera 1 - Main Entrance' },
      { id: 'cam-002', name: 'Camera 2 - Office Floor' },
      { id: 'cam-003', name: 'Camera 3 - Reception' },
      { id: 'cam-004', name: 'Camera 4 - Pantry' },
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const camera = cameras[Math.floor(Math.random() * cameras.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const message: WebSocketMessage = {
      type,
      data: {
        cameraId: camera.id,
        cameraName: camera.name,
        zoneId: `zone-${Math.random().toString(36).substr(2, 9)}`,
        zoneName: `Zone ${Math.floor(Math.random() * 5) + 1}`,
        count: type === 'crowd_detection' ? Math.floor(Math.random() * 50) + 10 : undefined,
        severity,
        snapshotUrl: '/placeholder.svg',
        timestamp: new Date().toISOString(),
      },
    };

    this.listeners.forEach((listener) => listener(message));
  }
}

export const mockWebSocket = new MockWebSocket();
