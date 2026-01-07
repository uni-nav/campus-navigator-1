import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useEffect } from 'react';
import { healthCheck } from '@/lib/api/client';
import { useAppStore } from '@/lib/store';

export function AdminLayout() {
  const setIsApiConnected = useAppStore((s) => s.setIsApiConnected);

  useEffect(() => {
    const checkHealth = async () => {
      const isConnected = await healthCheck();
      setIsApiConnected(isConnected);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [setIsApiConnected]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}