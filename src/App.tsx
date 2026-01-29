import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { FeedbackWidget } from "@/components/FeedbackWidget";

// Lazy load heavy pages for code splitting
const FloorEditorPage = lazy(() => import("./pages/FloorEditorPage"));
const PublicNavigationPage = lazy(() => import("./pages/PublicNavigationPage"));
const NavigationPage = lazy(() => import("./pages/NavigationPage"));
const KioskLauncherPage = lazy(() => import("./pages/KioskLauncherPage"));

// Regular imports for lighter pages
import FloorsPage from "./pages/FloorsPage";
import WaypointsPage from "./pages/WaypointsPage";
import RoomsPage from "./pages/RoomsPage";
import SettingsPage from "./pages/SettingsPage";
import KiosksPage from "./pages/KiosksPage";
import NotFound from "./pages/NotFound";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-pulse text-muted-foreground">Yuklanmoqda...</div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/floors" replace />} />
              <Route path="/floors" element={<FloorsPage />} />
              <Route path="/floors/:floorId/edit" element={
                <Suspense fallback={<PageLoader />}>
                  <FloorEditorPage />
                </Suspense>
              } />
              <Route path="/waypoints" element={<WaypointsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/kiosks" element={<KiosksPage />} />
              <Route path="/kiosk-launch" element={
                <Suspense fallback={<PageLoader />}>
                  <KioskLauncherPage />
                </Suspense>
              } />
              <Route path="/navigation" element={
                <Suspense fallback={<PageLoader />}>
                  <NavigationPage />
                </Suspense>
              } />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="/kiosk" element={
              <Suspense fallback={<PageLoader />}>
                <PublicNavigationPage />
              </Suspense>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {/* User Feedback Widget */}
        <FeedbackWidget position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
