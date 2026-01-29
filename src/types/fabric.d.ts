/**
 * Fabric.js Type Definitions
 * Custom types for Fabric.js objects and events used in the application
 */

import type {
    Circle,
    Line,
    TPointerEvent,
    TPointerEventInfo,
    BasicTransformEvent,
    Canvas,
    FabricImage
} from 'fabric';
import type { Waypoint, Connection } from '@/lib/api/types';

// ============================================================================
// Custom Fabric Objects with Data
// ============================================================================

/**
 * Waypoint Circle - Fabric.js circle with waypoint data attached
 */
export interface WaypointCircle extends Circle {
    data?: {
        waypoint: Waypoint;
        isKiosk: boolean;
    };
}

/**
 * Connection Line - Fabric.js line representing connection between waypoints
 */
export interface ConnectionLine extends Line {
    isConnection?: boolean;
    data?: {
        fromWaypointId: number;
        toWaypointId: number;
        connection?: Connection;
    };
}

/**
 * Floor Plan Image - Fabric.js image for floor layouts
 */
export interface FloorPlanImage extends FabricImage {
    selectable: false;
    evented: false;
}

// ============================================================================
// Fabric.js Event Types
// ============================================================================

/**
 * Mouse event from Fabric.js canvas
 */
export type FabricMouseEvent = TPointerEventInfo<TPointerEvent>;

/**
 * Object modified event (after drag, scale, rotate)
 */
export type FabricObjectModifiedEvent = BasicTransformEvent<TPointerEvent>;

/**
 * Object moving event (during drag)
 */
export type FabricObjectMovingEvent = BasicTransformEvent<TPointerEvent>;

/**
 * Mouse down event
 */
export type FabricMouseDownEvent = TPointerEventInfo<TPointerEvent>;

/**
 * Mouse up event
 */
export type FabricMouseUpEvent = TPointerEventInfo<TPointerEvent>;

// ============================================================================
// Fabric.js Canvas with Custom Types
// ============================================================================

/**
 * Extended Canvas type with typed getObjects method
 */
export interface TypedCanvas extends Canvas {
    getObjects(): Array<WaypointCircle | ConnectionLine | FloorPlanImage>;
}

// ============================================================================
// Helper Type Guards
// ============================================================================

/**
 * Type guard to check if object is a WaypointCircle
 */
export function isWaypointCircle(obj: unknown): obj is WaypointCircle {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'data' in obj &&
        obj.data !== null &&
        typeof obj.data === 'object' &&
        'waypoint' in obj.data
    );
}

/**
 * Type guard to check if object is a ConnectionLine
 */
export function isConnectionLine(obj: unknown): obj is ConnectionLine {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'isConnection' in obj &&
        (obj as ConnectionLine).isConnection === true
    );
}

/**
 * Type guard to check if event has target
 */
export function hasTarget(event: FabricMouseEvent): event is FabricMouseEvent & { target: WaypointCircle | ConnectionLine } {
    return event.target !== undefined && event.target !== null;
}

// ============================================================================
// Fabric.js Object Options
// ============================================================================

/**
 * Common options for creating waypoint circles
 */
export interface WaypointCircleOptions {
    left: number;
    top: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    selectable: boolean;
    hasBorders: boolean;
    hasControls: boolean;
    originX: 'center';
    originY: 'center';
}

/**
 * Common options for creating connection lines
 */
export interface ConnectionLineOptions {
    stroke: string;
    strokeWidth: number;
    selectable: boolean;
    evented: boolean;
    strokeDashArray?: number[];
}

/**
 * Fabric.js load image options with proper typing
 */
export interface FabricLoadImageOptions {
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
}
