import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  Settings,
  Upload,
  Video,
  Shield,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['Admin', 'Security', 'Viewer'] },
  { name: 'Analytics', to: '/analytics', icon: BarChart3, roles: ['Admin', 'Security', 'Viewer'] },
  { name: 'Alerts', to: '/alerts', icon: AlertTriangle, roles: ['Admin', 'Security', 'Viewer'] },
  { name: 'Configuration', to: '/configuration', icon: Settings, roles: ['Admin', 'Security'] },
  { name: 'Site Management', to: '/sites', icon: Building2, roles: ['Admin'] },
  { name: 'Upload', to: '/upload', icon: Upload, roles: ['Admin', 'Security'] },
  { name: 'Settings', to: '/settings', icon: Video, roles: ['Admin', 'Security', 'Viewer'] },
];

export const Sidebar = () => {
  const { user } = useAuthStore();
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Surveillance AI</h1>
          <p className="text-xs text-muted-foreground">Smart Monitoring</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};
