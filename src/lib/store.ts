import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Waypoint } from './api/types';
import { config } from './config';

interface AppState {
  // API Settings
  apiUrl: string;
  setApiUrl: (url: string) => void;

  // Selected Floor
  selectedFloorId: number | null;
  setSelectedFloorId: (id: number | null) => void;

  // Editor State
  editorMode: 'select' | 'pan' | 'waypoint' | 'connection' | 'delete';
  setEditorMode: (mode: 'select' | 'pan' | 'waypoint' | 'connection' | 'delete') => void;

  selectedWaypointType: 'hallway' | 'room' | 'stairs' | 'elevator' | 'hall';
  setSelectedWaypointType: (type: 'hallway' | 'room' | 'stairs' | 'elevator' | 'hall') => void;

  // Connection drawing
  connectionStartWaypoint: Waypoint | null;
  setConnectionStartWaypoint: (waypoint: Waypoint | null) => void;

  // Selected items for editing
  selectedWaypoint: Waypoint | null;
  setSelectedWaypoint: (waypoint: Waypoint | null) => void;

  // API health
  isApiConnected: boolean;
  setIsApiConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // API Settings - use config default
      apiUrl: config.apiUrl,
      setApiUrl: (url) => set({ apiUrl: url }),

      // Selected Floor
      selectedFloorId: null,
      setSelectedFloorId: (id) => set({ selectedFloorId: id }),

      // Editor State
      editorMode: 'select',
      setEditorMode: (mode) => set({ editorMode: mode, connectionStartWaypoint: null }),

      selectedWaypointType: 'hallway',
      setSelectedWaypointType: (type) => set({ selectedWaypointType: type }),

      // Connection drawing
      connectionStartWaypoint: null,
      setConnectionStartWaypoint: (waypoint) => set({ connectionStartWaypoint: waypoint }),

      // Selected items
      selectedWaypoint: null,
      setSelectedWaypoint: (waypoint) => set({ selectedWaypoint: waypoint }),

      // API health
      isApiConnected: false,
      setIsApiConnected: (connected) => set({ isApiConnected: connected }),
    }),
    {
      name: 'university-nav-storage',
      partialize: (state) => ({
        apiUrl: state.apiUrl,
      }),
    }
  )
);
