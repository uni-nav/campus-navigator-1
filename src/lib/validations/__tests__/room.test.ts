import { describe, it, expect } from 'vitest';
import { roomCreateSchema, roomTypeEnum } from '../room';

describe('Room Validation Schemas', () => {
    describe('roomCreateSchema', () => {
        it('should validate correct room data', () => {
            const validData = {
                name: 'Room 101',
                floor_id: 1,
                waypoint_id: 10,
                room_type: 'classroom',
                description: 'Large classroom',
            };
            expect(() => roomCreateSchema.parse(validData)).not.toThrow();
        });

        it('should reject empty name', () => {
            const invalidData = {
                name: '',
                floor_id: 1,
                room_type: 'classroom',
            };
            expect(() => roomCreateSchema.parse(invalidData)).toThrow();
        });

        it('should reject too long name', () => {
            const invalidData = {
                name: 'a'.repeat(201),
                floor_id: 1,
                room_type: 'classroom',
            };
            expect(() => roomCreateSchema.parse(invalidData)).toThrow();
        });

        it('should accept optional waypoint_id', () => {
            const validData = {
                name: 'Room 102',
                floor_id: 1,
                room_type: 'office',
            };
            expect(() => roomCreateSchema.parse(validData)).not.toThrow();
        });

        it('should accept null waypoint_id', () => {
            const validData = {
                name: 'Room 103',
                floor_id: 1,
                waypoint_id: null,
                room_type: 'lab',
            };
            expect(() => roomCreateSchema.parse(validData)).not.toThrow();
        });

        it('should reject invalid room type', () => {
            const invalidData = {
                name: 'Room 104',
                floor_id: 1,
                room_type: 'invalid_type',
            };
            expect(() => roomCreateSchema.parse(invalidData)).toThrow();
        });

        it('should accept all valid room types', () => {
            const validTypes = [
                'classroom',
                'office',
                'lab',
                'hall',
                'bathroom',
                'library',
                'cafeteria',
                'auditorium',
                'other',
            ];

            validTypes.forEach((type) => {
                const validData = {
                    name: 'Test Room',
                    floor_id: 1,
                    room_type: type,
                };
                expect(() => roomCreateSchema.parse(validData)).not.toThrow();
            });
        });

        it('should accept empty description', () => {
            const validData = {
                name: 'Room 105',
                floor_id: 1,
                room_type: 'classroom',
                description: '',
            };
            expect(() => roomCreateSchema.parse(validData)).not.toThrow();
        });

        it('should reject too long description', () => {
            const invalidData = {
                name: 'Room 106',
                floor_id: 1,
                room_type: 'classroom',
                description: 'a'.repeat(501),
            };
            expect(() => roomCreateSchema.parse(invalidData)).toThrow();
        });
    });
});
