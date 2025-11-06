# Smart Surveillance AI - Frontend Demo

A complete frontend-only surveillance monitoring system with AI-powered crowd detection and intrusion alerts. Built with React, TypeScript, and modern web technologies.

## 🚀 Features

### Core Capabilities
- **Role-Based Access Control (RBAC)**: Three user roles with different permissions
  - **Admin**: Full system access
  - **Security**: Limited operational access
  - **Viewer**: Read-only access

- **Crowd Detection Service**: Monitor people count and density in real-time with polygon zone drawing
- **Intrusion Detection Service**: Detect boundary violations with line-based zone configuration
- **Real-Time Alerts**: Live WebSocket simulation for instant notifications
- **Analytics Dashboard**: Interactive charts and KPI tracking
- **Zone Editor**: Draw and manage detection zones with react-konva
- **Media Upload & Simulation**: Upload photos/videos, annotate zones, and simulate detections

### Technical Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand with persistence
- **Charts**: Recharts
- **Zone Drawing**: react-konva + Konva
- **Animations**: Framer Motion
- **API Mocking**: MSW (Mock Service Worker)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Demo Accounts

Use these credentials to test different user roles:

| Role     | Email                      | Password |
|----------|---------------------------|----------|
| Admin    | admin@surveillance.ai     | demo123  |
| Security | security@surveillance.ai  | demo123  |
| Viewer   | viewer@surveillance.ai    | demo123  |

## 🎯 Key Features Implementation

### 1. Authentication
- Mock authentication with localStorage token storage
- Automatic route protection
- Role-based UI permissions

### 2. Dashboard
- Service status cards (Crowd Detection, Intrusion Detection)
- Quick stats overview
- Navigation to service-specific analytics

### 3. Analytics
- **KPI Cards**:
  - Total People Detected
  - Intrusion Alerts
- **Charts**:
  - Line chart: People Count Trend (24-hour)
  - Bar chart: Intrusion Frequency (7-day)
- Time range filters (Today, Last 7 Days, Custom)

### 4. Alerts & Events
- Real-time alert table with filtering
- Search by Event ID, Camera, or Zone
- Filter by Type (Crowd/Intrusion) and Camera
- Alert detail modal with snapshot
- Acknowledge functionality
- Live toast notifications for new alerts

### 5. Configuration
- Tab-based interface (Crowd Detection | Intrusion Detection)
- Two-step configuration wizard:
  - **Step 1**: Select Camera, Site, and Threshold
  - **Step 2**: Draw Zone with interactive editor
- Zone management (Edit, Delete)
- Site options: Pantry Area, Office Area, Reception Area, Entry Area
- Active cameras only

### 6. Zone Editor
- **Crowd Detection**: Polygon drawing
  - Click to add points
  - Double-click to close polygon
  - Visual feedback with cyan highlighting
- **Intrusion Detection**: Line drawing
  - Click start and end points
  - Define intrusion boundaries
- Edit, undo, and clear functionality
- Normalized coordinates (0-1 range) for responsive scaling

### 7. Upload & Simulate
- Upload images (JPG, PNG) and videos (MP4, WEBM)
- Thumbnail grid view
- **Annotate**: Draw zones on uploaded media
- **Simulate**: Generate mock detection events
- Delete uploaded files

### 8. Settings
- **Profile**: Update name and view account info
- **Password**: Change password form
- **Appearance**: Dark/Light mode toggle

## 🌐 Mock Data & Real-Time Behavior

### WebSocket Simulation
The app includes a mock WebSocket that emits events every 10-30 seconds:

- **people_detection**: Crowd count events with snapshot
- **intrusion_alert**: Boundary violation events with severity

Events automatically populate the alerts table and trigger toast notifications.

### Mock Cameras
- 4 active cameras across different locations
- 1 inactive camera (filtered out in dropdowns)

### Sites
Fixed locations:
- Pantry Area
- Office Area
- Reception Area
- Entry Area

## 🎨 Design System

### Color Palette
- **Primary**: Deep Cyan (HSL: 195, 92%, 48%)
- **Secondary**: Slate Gray
- **Accent**: Teal
- **Success**: Green (142, 71%, 45%)
- **Warning**: Amber (38, 92%, 50%)
- **Destructive**: Red (0, 72%, 51%)

### Theme
- **Dark Mode** as default
- Professional surveillance aesthetic
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)

### Components
All UI components use shadcn/ui with custom variants and semantic tokens from the design system.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Top navigation bar
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── ZoneEditor.tsx   # Zone drawing component
├── pages/
│   ├── Login.tsx        # Authentication page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Analytics.tsx    # Charts and KPIs
│   ├── Alerts.tsx       # Events table
│   ├── Configuration.tsx # Zone management
│   ├── Upload.tsx       # Media upload
│   └── Settings.tsx     # User settings
├── stores/
│   ├── authStore.ts     # Authentication state
│   ├── alertStore.ts    # Alerts state
│   └── configStore.ts   # Configurations state
├── lib/
│   ├── mockData.ts      # Mock cameras, sites, data
│   ├── websocket.ts     # WebSocket simulation
│   └── utils.ts         # Helper functions
└── App.tsx              # Main app component
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- ZoneEditor: Draw, save, and edit polygon/line zones
- Upload: Media upload and simulation triggers
- Storybook stories for ZoneEditor component

## 📚 Storybook

```bash
# Run Storybook
npm run storybook
```

View component stories including ZoneEditor with draw, edit, and save states.

## 🔧 Development Notes

### Mock Implementation
All backend functionality is mocked:
- Authentication uses localStorage
- Alerts are generated via WebSocket simulation
- Configurations stored in Zustand with localStorage persistence
- No real API calls or server required

### Zone Coordinates
Zones are stored as normalized coordinates (0-1 range) for responsive scaling across different screen sizes.

### Real-Time Updates
WebSocket mock automatically emits events while authenticated. Listen for:
- `people_detection` events
- `intrusion_alert` events

## 🚀 Deployment

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

The `dist/` folder contains the production-ready application.

## 📄 License

This project is a demo application for educational and demonstration purposes.

## 🤝 Contributing

This is a frontend-only demo. For production use, integrate with real backend services:
- Replace mock authentication with real auth service
- Connect WebSocket to real event stream
- Integrate with camera management API
- Add database for persistent storage

## 📞 Support

For questions or issues, please refer to the project documentation or create an issue in the repository.

---

**Built with ❤️ using React + TypeScript + Vite**
