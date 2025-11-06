import { create } from 'zustand';

export type AlertType = 'crowd_detection' | 'intrusion_alert';
export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Alert {
  id: string;
  type: AlertType;
  cameraId: string;
  cameraName: string;
  zoneId: string;
  zoneName: string;
  count?: number;
  severity: AlertSeverity;
  timestamp: string;
  snapshotUrl: string;
  acknowledged: boolean;
}

interface AlertState {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'acknowledged'>) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (alert) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      acknowledged: false,
    };
    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
  },
  acknowledgeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      ),
    }));
  },
  clearAlerts: () => set({ alerts: [] }),
}));
