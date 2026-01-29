/**
 * Settings Validation Schemas
 * Validation for API settings and kiosk configuration
 */

import { z } from 'zod';

/**
 * API Settings Schema
 */
export const apiSettingsSchema = z.object({
    apiUrl: z
        .string()
        .min(1, "API manzili bo'sh bo'lishi mumkin emas")
        .url("To'g'ri URL formatda kiriting")
        .startsWith('http', "URL http:// yoki https:// bilan boshlanishi kerak"),

    adminToken: z
        .string()
        .min(10, 'Token kamida 10 ta belgidan iborat bo\'lishi kerak')
        .optional()
        .or(z.literal('')),
});

export type ApiSettingsInput = z.infer<typeof apiSettingsSchema>;

/**
 * Kiosk Location Settings Schema
 */
export const kioskSettingsSchema = z.object({
    kioskId: z
        .number({
            required_error: "Kiosk tanlanishi shart",
            invalid_type_error: "Kiosk ID raqam bo'lishi kerak",
        })
        .int('Kiosk ID butun son bo\'lishi kerak')
        .positive('Kiosk ID musbat son bo\'lishi kerak'),

    waypointId: z
        .number({
            required_error: "Waypoint ID kerak",
            invalid_type_error: "Waypoint ID raqam bo'lishi kerak",
        })
        .int('Waypoint ID butun son bo\'lishi kerak')
        .positive('Waypoint ID musbat son bo\'lishi kerak')
        .nullable(),
});

export type KioskSettingsInput = z.infer<typeof kioskSettingsSchema>;
