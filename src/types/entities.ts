// Core entity types for backend integration

export interface Site {
  id: string;
  name: string;
  address: string;
  location?: string;
  status: 'active' | 'inactive';
  cameras: Camera[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Camera {
  id: string;
  cameraId: string;
  name: string;
  siteId: string;
  streamUrl: string;
  uploadedMedia?: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone {
  id: string;
  type: 'crowd_detection' | 'intrusion_detection';
  cameraId: string;
  siteId: string;
  points: ZonePoint[];
  threshold?: number;
  direction?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left';
  createdAt?: string;
  updatedAt?: string;
}

export interface ZonePoint {
  x: number;
  y: number;
}

export interface Alert {
  id: string;
  type: 'crowd_detection' | 'intrusion_alert';
  cameraId: string;
  cameraName: string;
  zoneId: string;
  zoneName: string;
  count?: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  snapshotUrl: string;
  acknowledged: boolean;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Security' | 'Viewer';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// API Response wrapper types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
