import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateProfileDto } from './update-profile.dto';

const validPayload = {
    firstName: 'Pencho',
    lastName: 'Dimitrov',
    country: 'Bulgaria',
    city: 'Sofia',
    school: 'SMG',
};

async function validatePayload(overrides: Partial<typeof validPayload>) {
    const instance = plainToInstance(UpdateProfileDto, { ...validPayload, ...overrides });
    return validate(instance);
}

describe('UpdateProfileDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    it('passes without the optional country/city/school fields', async () => {
        const errors = await validatePayload({ country: undefined, city: undefined, school: undefined });

        expect(errors).toHaveLength(0);
    });

    describe('firstName / lastName', () => {
        it('rejects an empty firstName', async () => {
            const errors = await validatePayload({ firstName: '' });

            expect(errors.some((error) => error.property === 'firstName')).toBe(true);
        });

        it('rejects an empty lastName', async () => {
            const errors = await validatePayload({ lastName: '' });

            expect(errors.some((error) => error.property === 'lastName')).toBe(true);
        });

        it('rejects a firstName longer than 100 characters', async () => {
            const errors = await validatePayload({ firstName: 'a'.repeat(101) });

            expect(errors.some((error) => error.property === 'firstName')).toBe(true);
        });

        it('rejects a lastName longer than 100 characters', async () => {
            const errors = await validatePayload({ lastName: 'a'.repeat(101) });

            expect(errors.some((error) => error.property === 'lastName')).toBe(true);
        });
    });
});
