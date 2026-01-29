/**
 * Waypoint Validation Schemas
 */

import { z } from 'zod';

/**
 * Waypoint Type Enum
 */
export const waypointTypeEnum = z.enum([
    'hallway',
    'room',
    'stairs',
    'elevator',
    'hall',
    'entrance',
    'exit',
], {
    errorMap: () => ({ message: "Nuqta turi noto'g'ri tanlangan" }),
});

/**
 * Waypoint Creation Schema
 */
export const waypointCreateSchema = z.object({
    floor_id: z
        .number({
            required_error: 'Qavat tanlanishi shart',
            invalid_type_error: 'Qavat ID raqam bo\'lishi kerak',
        })
        .int('Qavat ID butun son bo\'lishi kerak')
        .positive('Qavat ID musbat son bo\'lishi kerak'),

    x: z
        .number({
            required_error: 'X koordinata kerak',
            invalid_type_error: 'X koordinata raqam bo\'lishi kerak',
        })
        .min(0, 'X koordinata 0 dan katta yoki teng bo\'lishi kerak'),

    y: z
        .number({
            required_error: 'Y koordinata kerak',
            invalid_type_error: 'Y koordinata raqam bo\'lishi kerak',
        })
        .min(0, 'Y koordinata 0 dan katta yoki teng bo\'lishi kerak'),

    type: waypointTypeEnum,

    label: z
        .string()
        .max(100, 'Yorliq 100 ta belgidan oshmasligi kerak')
        .trim()
        .optional()
        .or(z.literal('')),
});

export type WaypointCreateInput = z.infer<typeof waypointCreateSchema>;

/**
 * Waypoint Update Schema
 */
export const waypointUpdateSchema = waypointCreateSchema.partial().extend({
    id: z.number().int().positive(),
});

export type WaypointUpdateInput = z.infer<typeof waypointUpdateSchema>;

/**
 * Waypoint Position Update Schema
 * For dragging waypoints on canvas
 */
export const waypointPositionSchema = z.object({
    id: z.number().int().positive(),
    x: z.number().min(0),
    y: z.number().min(0),
});

export type WaypointPositionInput = z.infer<typeof waypointPositionSchema>;
