// API Types for University Navigation

export type WaypointType = 'hallway' | 'room' | 'stairs' | 'elevator' | 'hall';

export interface Floor {
  id: number;
  name: string;
  floor_number: number;
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  created_at: string;
}

export interface FloorCreate {
  name: string;
  floor_number: number;
  image_url?: string | null;
  image_width?: number | null;
  image_height?: number | null;
}

export interface FloorUpdate {
  name?: string | null;
  floor_number?: number | null;
  image_url?: string | null;
  image_width?: number | null;
  image_height?: number | null;
}

export interface Waypoint {
  id: string;
  floor_id: number;
  x: number;
  y: number;
  type: WaypointType;
  label: string | null;
  connects_to_floor: number | null;
  connects_to_waypoint: string | null;
}

export interface WaypointCreate {
  id: string;
  floor_id: number;
  x: number;
  y: number;
  type: WaypointType;
  label?: string | null;
  connects_to_floor?: number | null;
  connects_to_waypoint?: string | null;
}

export interface WaypointUpdate {
  x?: number | null;
  y?: number | null;
  type?: WaypointType | null;
  label?: string | null;
  connects_to_floor?: number | null;
  connects_to_waypoint?: string | null;
}

export interface Connection {
  id: string;
  from_waypoint_id: string;
  to_waypoint_id: string;
  distance: number;
}

export interface ConnectionCreate {
  id?: string;
  from_waypoint_id: string;
  to_waypoint_id: string;
  distance: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number | null;
  building: string | null;
  waypoint_id: string | null;
  floor_id: number;
}

export interface RoomCreate {
  id: string;
  name: string;
  capacity?: number | null;
  building?: string | null;
  waypoint_id?: string | null;
  floor_id: number;
}

export interface NavigationRequest {
  start_waypoint_id?: string | null;
  start_room_id?: string | null;
  end_waypoint_id?: string | null;
  end_room_id?: string | null;
  kiosk_id?: string | null;
}

export interface PathStep {
  waypoint_id: string;
  floor_id: number;
  x: number;
  y: number;
  type: string;
  label: string | null;
  instruction: string | null;
}

export interface NavigationResponse {
  path: PathStep[];
  total_distance: number;
  floor_changes: number;
  estimated_time_minutes: number;
}

export interface ApiError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}