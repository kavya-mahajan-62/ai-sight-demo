# Surveillance AI Platform

A modern surveillance management system with AI-powered crowd and intrusion detection, ready for backend integration.

## 🚀 Features

- 🎯 **Crowd Detection** - Monitor crowd density and people count in real-time
- 🛡️ **Intrusion Detection** - Detect unauthorized access and boundary violations
- 📊 **Analytics Dashboard** - View trends and insights from detection data
- 🚨 **Real-time Alerts** - Get instant notifications for security events
- 🎨 **Zone Configuration** - Draw custom detection zones with visual editor
- 🏢 **Multi-site Management** - Manage cameras across multiple locations
- 🔐 **Authentication** - Role-based access control (Admin, Security, Viewer)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **State**: Zustand with persistence
- **API**: Centralized REST client with auto-retry & auth
- **WebSocket**: Production-ready client with auto-reconnect
- **Canvas**: Konva for zone drawing
- **Charts**: Recharts

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun
- Backend API server (optional for development)

### Setup

```bash
# Install dependencies
npm install
# or
bun install

# Copy environment template
cp .env.example .env

# Configure your environment (see Environment Setup below)
```

### Environment Setup

Configure `.env` with your backend URLs:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_BASE_URL=ws://localhost:3000

# Environment
VITE_ENV=development
```

### Development

```bash
# Start development server (with proxy)
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:8080`

**Dev Proxy**: API requests to `/api` and WebSocket connections to `/ws` are automatically proxied to your backend (no CORS issues).

### Build

```bash
# Build for production
npm run build
# or
bun run build

# Preview production build
npm run preview
```

## 🔐 Demo Accounts

Use these credentials (mock mode):

| Role     | Email                      | Password |
|----------|---------------------------|----------|
| Admin    | admin@surveillance.ai     | demo123  |
| Security | security@surveillance.ai  | demo123  |
| Viewer   | viewer@surveillance.ai    | demo123  |

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   ├── Layout.tsx    # Main layout with auth
│   ├── Header.tsx    # Top navigation
│   ├── Sidebar.tsx   # Side navigation
│   └── ZoneEditor.tsx # Canvas-based zone drawing
├── pages/            # Route pages (lazy-loaded)
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   ├── Alerts.tsx
│   ├── Configuration.tsx
│   ├── Sites.tsx
│   └── Settings.tsx
├── stores/           # Zustand state management
│   ├── authStore.ts  # Authentication + token
│   ├── alertStore.ts # Real-time alerts
│   ├── configStore.ts # Detection zones
│   └── siteStore.ts  # Sites & cameras
├── services/         # Backend integration
│   ├── api.ts        # REST API client
│   └── websocket.ts  # WebSocket client
├── types/            # TypeScript definitions
│   ├── entities.ts   # Core data types
│   └── index.ts
├── hooks/            # Custom React hooks
│   ├── useErrorHandler.ts
│   └── use-mobile.tsx
├── lib/              # Utilities
│   ├── utils.ts
│   └── mockData.ts
└── App.tsx          # Root component
```

## 🔌 Backend Integration

The frontend is **production-ready** for backend integration.

### API Client (`src/services/api.ts`)

Centralized REST API client with:
- ✅ Automatic auth token injection from localStorage
- ✅ 401 handling (auto-logout + redirect)
- ✅ Proper error parsing & propagation
- ✅ Type-safe requests with TypeScript generics
- ✅ `Content-Type: application/json` headers

**Usage**:
```typescript
import { api } from '@/services/api';

// GET request
const sites = await api.get<Site[]>('/sites');

// POST request
const newSite = await api.post<Site>('/sites', { name: 'HQ', address: '123 Main' });

// PUT, PATCH, DELETE also available
```

### WebSocket Client (`src/services/websocket.ts`)

Production-ready WebSocket with:
- ✅ Auto-reconnect with exponential backoff
- ✅ Max retry attempts (configurable)
- ✅ Proper cleanup on unmount
- ✅ Message handler subscription system
- ✅ Connection state tracking

**Usage**:
```typescript
import { getWebSocketInstance } from '@/services/websocket';

const ws = getWebSocketInstance({ 
  reconnect: true,
  maxReconnectAttempts: 10 
});

ws.onMessage((message) => {
  console.log('Received:', message);
});

ws.connect();
```

### Expected Backend Endpoints

#### Authentication
- `POST /auth/login` - User login
  - Body: `{ email: string, password: string }`
  - Returns: `{ user: User, token: string }`

#### Sites
- `GET /sites` - List all sites
- `POST /sites` - Create site
- `PUT /sites/:id` - Update site
- `DELETE /sites/:id` - Delete site

#### Cameras
- `GET /sites/:siteId/cameras` - List cameras
- `POST /sites/:siteId/cameras` - Add camera
- `PUT /cameras/:id` - Update camera
- `DELETE /cameras/:id` - Delete camera

#### Configurations
- `GET /configurations` - List detection zones
- `POST /configurations` - Create zone
- `PUT /configurations/:id` - Update zone
- `DELETE /configurations/:id` - Delete zone

#### Alerts
- `GET /alerts` - List alerts (paginated)
- `PATCH /alerts/:id/acknowledge` - Acknowledge alert

### WebSocket Events

The frontend expects these WebSocket message types:

```typescript
// Alert event
{
  type: 'alert',
  data: {
    type: 'crowd_detection' | 'intrusion_alert',
    cameraId: string,
    cameraName: string,
    zoneId: string,
    zoneName: string,
    count?: number,
    severity: 'Low' | 'Medium' | 'High' | 'Critical',
    timestamp: string,
    snapshotUrl: string
  }
}
```

## 🔒 State Management

All Zustand stores use **persistence middleware** with proper serialization:

- ✅ Only serializable data is persisted
- ✅ Functions excluded from localStorage
- ✅ `partialize` used to whitelist keys
- ✅ Initial state clearly defined

**Stores**:
- `authStore` - User, token, auth state
- `alertStore` - Real-time alerts (in-memory only)
- `configStore` - Detection zone configurations
- `siteStore` - Sites & cameras

## ⚡ Performance Optimizations

- **Lazy Loading**: Heavy components (Analytics, Configuration, Sites) load on-demand
- **Code Splitting**: Route-based chunks for faster initial load
- **Query Caching**: React Query with 5-minute stale time
- **Image Optimization**: Lazy loading images in cards/tables
- **Suspense Boundaries**: Loading states for async routes

## 🛡️ Error Handling

- **Global Error Handler**: Catches unhandled promise rejections
- **API Error Boundary**: Displays user-friendly error messages
- **401 Auto-logout**: Expired tokens trigger automatic redirect
- **Toast Notifications**: Visual feedback for all errors
- **Network Retry**: Query client retries failed requests once

## 🧪 Development vs Production

| Feature | Development | Production |
|---------|------------|-----------|
| WebSocket | Disabled (logs only) | Enabled with backend URL |
| API Calls | Proxied via Vite | Direct to `VITE_API_BASE_URL` |
| Mock Data | Used for initial state | Replaced by API data |
| Error Logging | Full console output | User-friendly messages |

## 🚀 Deployment Checklist

Before deploying to production:

1. ✅ Set `VITE_API_BASE_URL` to production API
2. ✅ Set `VITE_WS_BASE_URL` to production WebSocket
3. ✅ Set `VITE_ENV=production`
4. ✅ Remove or disable mock data
5. ✅ Test authentication flow end-to-end
6. ✅ Verify WebSocket reconnection
7. ✅ Check error handling for all API failures
8. ✅ Run `npm run build` and check for warnings

## 🧰 Development Features

- 🔄 Hot Module Replacement (HMR)
- 🔍 TypeScript strict mode
- 🎨 Tailwind CSS with semantic tokens
- 📦 Lazy loading with React.lazy
- 🛡️ Global error boundaries
- 💾 Persistent state (localStorage)
- 🔌 Auto-reconnecting WebSocket
- 🔧 Vite dev proxy (no CORS issues)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ using React + TypeScript + Vite**
