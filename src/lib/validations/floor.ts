/**
 * Floor Validation Schemas
 */

import { z } from 'zod';

/**
 * Floor Creation Schema
 */
export const floorCreateSchema = z.object({
    name: z
        .string()
        .min(1, "Qavat nomi bo'sh bo'lishi mumkin emas")
        .max(100, 'Qavat nomi 100 ta belgidan oshmasligi kerak')
        .trim(),

    building_id: z
        .number({
            required_error: 'Bino ID kerak',
            invalid_type_error: 'Bino ID raqam bo\'lishi kerak',
        })
        .int('Bino ID butun son bo\'lishi kerak')
        .positive('Bino ID musbat son bo\'lishi kerak'),

    floor_number: z
        .number({
            required_error: 'Qavat raqami kerak',
            invalid_type_error: 'Qavat raqami son bo\'lishi kerak',
        })
        .int('Qavat raqami butun son bo\'lishi kerak'),
});

export type FloorCreateInput = z.infer<typeof floorCreateSchema>;

/**
 * Floor Update Schema
 */
export const floorUpdateSchema = floorCreateSchema.partial();

export type FloorUpdateInput = z.infer<typeof floorUpdateSchema>;

/**
 * Floor Image Upload Schema
 */
export const floorImageSchema = z.object({
    image: z
        .instanceof(File, { message: 'Fayl tanlanishi shart' })
        .refine(
            (file) => file.size <= 10 * 1024 * 1024, // 10MB
            'Fayl hajmi 10MB dan oshmasligi kerak'
        )
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            'Faqat JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi'
        ),
});

export type FloorImageInput = z.infer<typeof floorImageSchema>;
