import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { healthCheck, getAdminToken } from '@/lib/api/client';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const setIsApiConnected = useAppStore((s) => s.setIsApiConnected);
  const isApiConnected = useAppStore((s) => s.isApiConnected);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const isConnected = await healthCheck();
      setIsApiConnected(isConnected);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [setIsApiConnected]);

  const hasToken = Boolean(getAdminToken());
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-[100dvh] overflow-hidden bg-background">
      <Sidebar
        className="hidden lg:flex"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden border-b border-border bg-background">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <Sidebar onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="font-semibold text-foreground">UniNav</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  isApiConnected ? 'bg-success' : 'bg-warning'
                )}
              />
              {isApiConnected ? 'API ulangan' : 'API ulanmagan'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
