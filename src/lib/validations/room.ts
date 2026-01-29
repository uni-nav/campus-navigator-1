/**
 * Room Validation Schemas
 */

import { z } from 'zod';

/**
 * Room Type Enum
 */
export const roomTypeEnum = z.enum([
    'classroom',
    'office',
    'lab',
    'hall',
    'bathroom',
    'library',
    'cafeteria',
    'auditorium',
    'other',
], {
    errorMap: () => ({ message: "Xona turi noto'g'ri tanlangan" }),
});

/**
 * Room Creation Schema
 */
export const roomCreateSchema = z.object({
    name: z
        .string()
        .min(1, "Xona nomi bo'sh bo'lishi mumkin emas")
        .max(200, 'Xona nomi 200 ta belgidan oshmasligi kerak')
        .trim(),

    floor_id: z
        .number({
            required_error: 'Qavat tanlanishi shart',
            invalid_type_error: 'Qavat ID raqam bo\'lishi kerak',
        })
        .int('Qavat ID butun son bo\'lishi kerak')
        .positive('Qavat ID musbat son bo\'lishi kerak'),

    waypoint_id: z
        .number({
            invalid_type_error: 'Waypoint ID raqam bo\'lishi kerak',
        })
        .int('Waypoint ID butun son bo\'lishi kerak')
        .positive('Waypoint ID musbat son bo\'lishi kerak')
        .nullable()
        .optional(),

    room_type: roomTypeEnum,

    description: z
        .string()
        .max(500, 'Tavsif 500 ta belgidan oshmasligi kerak')
        .trim()
        .optional()
        .or(z.literal('')),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;

/**
 * Room Update Schema
 */
export const roomUpdateSchema = roomCreateSchema.partial();

export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;

/**
 * Room Search/Filter Schema
 */
export const roomSearchSchema = z.object({
    query: z.string().max(100).optional(),
    floorId: z.number().int().positive().optional(),
    roomType: roomTypeEnum.optional(),
    hasWaypoint: z.boolean().optional(),
});

export type RoomSearchInput = z.infer<typeof roomSearchSchema>;
