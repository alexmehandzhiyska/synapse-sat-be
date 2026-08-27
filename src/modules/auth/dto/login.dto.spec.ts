import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from './login.dto';

const validPayload = {
    email: 'pencho@test.com',
    password: 'asdasdasd1!',
};

async function validatePayload(overrides: Partial<typeof validPayload>) {
    const instance = plainToInstance(LoginDto, { ...validPayload, ...overrides });
    return validate(instance);
}

describe('LoginDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('email', () => {
        it('rejects a malformed email', async () => {
            const errors = await validatePayload({ email: 'not-an-email' });

            expect(errors.some((error) => error.property === 'email')).toBe(true);
        });
    });

    describe('password', () => {
        it('rejects an empty password', async () => {
            const errors = await validatePayload({ password: '' });

            expect(errors.some((error) => error.property === 'password')).toBe(true);
        });
    });
});