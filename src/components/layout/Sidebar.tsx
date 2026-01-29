import { NavLink, useLocation } from 'react-router-dom';
import { 
  Layers, 
  MapPin, 
  DoorOpen, 
  Settings, 
  Navigation,
  Monitor,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const navItems = [
  { path: '/floors', label: 'Qavatlar', icon: Layers },
  { path: '/waypoints', label: 'Nuqtalar', icon: MapPin },
  { path: '/rooms', label: 'Xonalar', icon: DoorOpen },
  { path: '/kiosks', label: 'Kiosklar', icon: Monitor },
  { path: '/kiosk-launch', label: 'Kiosk ekrani', icon: Monitor },
  { path: '/navigation', label: 'Navigatsiya', icon: Navigation },
  { path: '/settings', label: 'Sozlamalar', icon: Settings },
];

export function Sidebar({
  onNavigate,
  className,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const location = useLocation();
  const isApiConnected = useAppStore((s) => s.isApiConnected);

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-all duration-200',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-foreground">UniNav</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                'ml-auto rounded-md border border-border bg-background/40 p-1 text-muted-foreground hover:text-foreground',
                collapsed && 'ml-0'
              )}
              aria-label={collapsed ? 'Sidebarni kengaytirish' : 'Sidebarni yig\'ish'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 p-4 space-y-1', collapsed && 'px-2')}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/floors' && location.pathname === '/');
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'nav-item',
                isActive && 'nav-item-active',
                collapsed && 'justify-center px-0'
              )}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3 px-3 py-2', collapsed && 'justify-center px-0')}>
          <div className={cn(
            'status-indicator',
            isApiConnected ? 'status-online' : 'status-offline'
          )} />
          {!collapsed && (
            <span className="text-sm text-muted-foreground">
              {isApiConnected ? 'API ulangan' : 'API ulanmagan'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
