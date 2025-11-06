export const SITES = [
  'Pantry Area',
  'Office Area',
  'Reception Area',
  'Entry Area',
] as const;

export interface Camera {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  location: string;
  streamUrl: string;
}

export const MOCK_CAMERAS: Camera[] = [
  {
    id: 'cam-001',
    name: 'Camera 1 - Main Entrance',
    status: 'active',
    location: 'Entry Area',
    streamUrl: '/placeholder.svg',
  },
  {
    id: 'cam-002',
    name: 'Camera 2 - Office Floor',
    status: 'active',
    location: 'Office Area',
    streamUrl: '/placeholder.svg',
  },
  {
    id: 'cam-003',
    name: 'Camera 3 - Reception',
    status: 'active',
    location: 'Reception Area',
    streamUrl: '/placeholder.svg',
  },
  {
    id: 'cam-004',
    name: 'Camera 4 - Pantry',
    status: 'active',
    location: 'Pantry Area',
    streamUrl: '/placeholder.svg',
  },
  {
    id: 'cam-005',
    name: 'Camera 5 - Parking',
    status: 'inactive',
    location: 'Parking Area',
    streamUrl: '/placeholder.svg',
  },
];

export const getActiveCameras = () => MOCK_CAMERAS.filter((cam) => cam.status === 'active');

export const generateMockPeopleData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 60 * 60 * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      count: Math.floor(Math.random() * 50) + 10,
    });
  }
  return data;
};

export const generateMockIntrusionData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: Math.floor(Math.random() * 10),
    });
  }
  return data;
};
