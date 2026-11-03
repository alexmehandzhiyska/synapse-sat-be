import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UserRole } from '../../auth/entities/user.entity';

import { UpdateUserDto } from './update-user.dto';

const validPayload = {
    firstName: 'Ivan',
    lastName: 'Dimitrov',
    country: 'Bulgaria',
    city: 'Sofia',
    school: 'SMG',
    role: UserRole.STUDENT,
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(UpdateUserDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('UpdateUserDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('firstName', () => {
        it('rejects an empty first name', async () => {
            const errors = await validatePayload({ firstName: '' });

            expect(hasErrorFor(errors, 'firstName')).toBe(true);
        });

        it('rejects a missing first name', async () => {
            const errors = await validatePayload({ firstName: undefined });

            expect(hasErrorFor(errors, 'firstName')).toBe(true);
        });

        it('accepts a first name of exactly 100 characters', async () => {
            const errors = await validatePayload({ firstName: 'A'.repeat(100) });

            expect(errors).toHaveLength(0);
        });

        it('rejects a first name longer than 100 characters', async () => {
            const errors = await validatePayload({ firstName: 'A'.repeat(101) });

            expect(hasErrorFor(errors, 'firstName')).toBe(true);
        });
    });

    describe('lastName', () => {
        it('rejects an empty last name', async () => {
            const errors = await validatePayload({ lastName: '' });

            expect(hasErrorFor(errors, 'lastName')).toBe(true);
        });

        it('rejects a missing last name', async () => {
            const errors = await validatePayload({ lastName: undefined });

            expect(hasErrorFor(errors, 'lastName')).toBe(true);
        });

        it('accepts a last name of exactly 100 characters', async () => {
            const errors = await validatePayload({ lastName: 'A'.repeat(100) });

            expect(errors).toHaveLength(0);
        });

        it('rejects a last name longer than 100 characters', async () => {
            const errors = await validatePayload({ lastName: 'A'.repeat(101) });

            expect(hasErrorFor(errors, 'lastName')).toBe(true);
        });
    });

    describe('country, city and school', () => {
        it('are optional', async () => {
            const errors = await validatePayload({ country: undefined, city: undefined, school: undefined });

            expect(errors).toHaveLength(0);
        });

        it('reject values that are not strings', async () => {
            const errors = await validatePayload({ country: 1, city: 2, school: 3 });

            expect(errors.map((error) => error.property)).toEqual(['country', 'city', 'school']);
        });
    });

    describe('role', () => {
        it('accepts every role', async () => {
            for (const role of Object.values(UserRole)) {
                const errors = await validatePayload({ role });

                expect(errors).toHaveLength(0);
            }
        });

        it('rejects an unknown role', async () => {
            const errors = await validatePayload({ role: 'principal' });

            expect(hasErrorFor(errors, 'role')).toBe(true);
        });

        it('rejects a missing role', async () => {
            const errors = await validatePayload({ role: undefined });

            expect(hasErrorFor(errors, 'role')).toBe(true);
        });
    });
});