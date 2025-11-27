import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SiteCamera {
  id: string;
  name: string;
  cameraId: string;
  streamUrl: string;
  uploadedMedia?: string[]; // Array of base64 encoded media files
  active: boolean;
  siteId: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  location?: string;
  status: 'active' | 'inactive';
  cameras: SiteCamera[];
  createdAt: string;
}

interface SiteState {
  sites: Site[];
  addSite: (site: Omit<Site, 'id' | 'cameras' | 'createdAt'>) => void;
  updateSite: (id: string, site: Partial<Site>) => void;
  deleteSite: (id: string) => void;
  addCamera: (siteId: string, camera: Omit<SiteCamera, 'id' | 'siteId'>) => void;
  updateCamera: (siteId: string, cameraId: string, camera: Partial<SiteCamera>) => void;
  deleteCamera: (siteId: string, cameraId: string) => void;
}

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      sites: [
        {
          id: 'site-1',
          name: 'Headquarters Building',
          address: '123 Main Street, Downtown',
          location: 'Ground Floor',
          status: 'active',
          cameras: [
            {
              id: 'cam-001',
              name: 'Main Entrance',
              cameraId: 'CAM-001',
              streamUrl: '/placeholder.svg',
              active: true,
              siteId: 'site-1',
            },
            {
              id: 'cam-002',
              name: 'Lobby Area',
              cameraId: 'CAM-002',
              streamUrl: '/placeholder.svg',
              active: true,
              siteId: 'site-1',
            },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'site-2',
          name: 'North Wing Office',
          address: '456 Oak Avenue, Suite 200',
          status: 'active',
          cameras: [
            {
              id: 'cam-003',
              name: 'Reception Desk',
              cameraId: 'CAM-003',
              streamUrl: '/placeholder.svg',
              active: true,
              siteId: 'site-2',
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      addSite: (site) => {
        const newSite: Site = {
          ...site,
          id: Math.random().toString(36).substr(2, 9),
          cameras: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ sites: [...state.sites, newSite] }));
      },
      updateSite: (id, siteUpdate) => {
        set((state) => ({
          sites: state.sites.map((site) =>
            site.id === id ? { ...site, ...siteUpdate } : site
          ),
        }));
      },
      deleteSite: (id) => {
        set((state) => ({
          sites: state.sites.filter((site) => site.id !== id),
        }));
      },
      addCamera: (siteId, camera) => {
        const newCamera: SiteCamera = {
          ...camera,
          id: Math.random().toString(36).substr(2, 9),
          siteId,
        };
        set((state) => ({
          sites: state.sites.map((site) =>
            site.id === siteId
              ? { ...site, cameras: [...site.cameras, newCamera] }
              : site
          ),
        }));
      },
      updateCamera: (siteId, cameraId, cameraUpdate) => {
        set((state) => ({
          sites: state.sites.map((site) =>
            site.id === siteId
              ? {
                  ...site,
                  cameras: site.cameras.map((cam) =>
                    cam.id === cameraId ? { ...cam, ...cameraUpdate } : cam
                  ),
                }
              : site
          ),
        }));
      },
      deleteCamera: (siteId, cameraId) => {
        set((state) => ({
          sites: state.sites.map((site) =>
            site.id === siteId
              ? {
                  ...site,
                  cameras: site.cameras.filter((cam) => cam.id !== cameraId),
                }
              : site
          ),
        }));
      },
    }),
    {
      name: 'surveillance-sites',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sites: state.sites,
      }),
    }
  )
);
