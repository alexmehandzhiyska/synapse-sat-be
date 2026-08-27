import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RegisterDto } from './register.dto';

const validPayload = {
    firstName: 'Pencho',
    lastName: 'Dimitrov',
    email: 'pencho@test.com',
    password: 'asdasdasd1!',
};

async function validatePayload(overrides: Partial<typeof validPayload>) {
    const instance = plainToInstance(RegisterDto, { ...validPayload, ...overrides });
    return validate(instance);
}

describe('RegisterDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('password', () => {
        it('rejects a password shorter than 8 characters', async () => {
            const errors = await validatePayload({ password: 'Sh0rt!' });

            expect(errors.some((error) => error.property === 'password')).toBe(true);
        });

        it('rejects a password longer than 72 characters', async () => {
            const errors = await validatePayload({ password: `A1!${'a'.repeat(70)}` });

            expect(errors.some((error) => error.property === 'password')).toBe(true);
        });

        it('rejects a password missing a digit', async () => {
            const errors = await validatePayload({ password: 'NoDigits!' });

            expect(errors.some((error) => error.property === 'password')).toBe(true);
        });

        it('rejects a password missing a special character', async () => {
            const errors = await validatePayload({ password: 'NoSpecial1' });

            expect(errors.some((error) => error.property === 'password')).toBe(true);
        });

        it('accepts a password with a digit and a special character', async () => {
            const errors = await validatePayload({ password: 'asdasdasd1!' });

            expect(errors.some((error) => error.property === 'password')).toBe(false);
        });
    });

    describe('email', () => {
        it('rejects a malformed email', async () => {
            const errors = await validatePayload({ email: 'not-an-email' });

            expect(errors.some((error) => error.property === 'email')).toBe(true);
        });

        it('rejects an email shorter than 5 characters', async () => {
            const errors = await validatePayload({ email: 'a@b' });

            expect(errors.some((error) => error.property === 'email')).toBe(true);
        });
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
    });
});
