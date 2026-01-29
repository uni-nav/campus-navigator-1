/**
 * Kiosk Validation Schemas
 */

import { z } from 'zod';

/**
 * Kiosk Creation Schema
 */
export const kioskCreateSchema = z.object({
    name: z
        .string()
        .min(1, "Kiosk nomi bo'sh bo'lishi mumkin emas")
        .max(100, 'Kiosk nomi 100 ta belgidan oshmasligi kerak')
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
            required_error: 'Waypoint tanlanishi shart',
            invalid_type_error: 'Waypoint ID raqam bo\'lishi kerak',
        })
        .int('Waypoint ID butun son bo\'lishi kerak')
        .positive('Waypoint ID musbat son bo\'lishi kerak'),
});

export type KioskCreateInput = z.infer<typeof kioskCreateSchema>;

/**
 * Kiosk Update Schema
 */
export const kioskUpdateSchema = kioskCreateSchema.partial();

export type KioskUpdateInput = z.infer<typeof kioskUpdateSchema>;
