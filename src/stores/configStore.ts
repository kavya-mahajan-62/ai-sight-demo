import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ZonePoint {
  x: number;
  y: number;
}

export interface Configuration {
  id: string;
  type: 'crowd_detection' | 'intrusion_detection';
  cameraId: string;
  cameraName: string;
  site: string;
  threshold: number;
  zone: ZonePoint[];
  direction?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left';
  createdAt: string;
}

interface ConfigState {
  configurations: Configuration[];
  addConfiguration: (config: Omit<Configuration, 'id' | 'createdAt'>) => void;
  updateConfiguration: (id: string, zone: ZonePoint[], direction?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left') => void;
  deleteConfiguration: (id: string) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      configurations: [],
      addConfiguration: (config) => {
        const newConfig: Configuration = {
          ...config,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ configurations: [...state.configurations, newConfig] }));
      },
      updateConfiguration: (id, zone, direction) => {
        set((state) => ({
          configurations: state.configurations.map((config) =>
            config.id === id ? { ...config, zone, ...(direction && { direction }) } : config
          ),
        }));
      },
      deleteConfiguration: (id) => {
        set((state) => ({
          configurations: state.configurations.filter((config) => config.id !== id),
        }));
      },
    }),
    {
      name: 'surveillance-config',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
