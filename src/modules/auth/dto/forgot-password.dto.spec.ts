import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ForgotPasswordDto } from './forgot-password.dto';

const validPayload = {
    email: 'pencho@test.com',
};

async function validatePayload(overrides: Partial<typeof validPayload>) {
    const instance = plainToInstance(ForgotPasswordDto, { ...validPayload, ...overrides });
    return validate(instance);
}

describe('ForgotPasswordDto', () => {
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
});