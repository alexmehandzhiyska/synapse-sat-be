import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { VerifyResetCodeDto } from './verify-reset-code.dto';

const validPayload = {
    email: 'pencho@test.com',
    code: '123456',
};

async function validatePayload(overrides: Partial<typeof validPayload>) {
    const instance = plainToInstance(VerifyResetCodeDto, { ...validPayload, ...overrides });
    return validate(instance);
}

describe('VerifyResetCodeDto', () => {
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

    describe('code', () => {
        it('rejects a code shorter than 6 digits', async () => {
            const errors = await validatePayload({ code: '12345' });

            expect(errors.some((error) => error.property === 'code')).toBe(true);
        });

        it('rejects a code longer than 6 digits', async () => {
            const errors = await validatePayload({ code: '1234567' });

            expect(errors.some((error) => error.property === 'code')).toBe(true);
        });

        it('rejects a non-numeric code', async () => {
            const errors = await validatePayload({ code: 'abcdef' });

            expect(errors.some((error) => error.property === 'code')).toBe(true);
        });

        it('accepts a 6-digit code', async () => {
            const errors = await validatePayload({ code: '654321' });

            expect(errors.some((error) => error.property === 'code')).toBe(false);
        });
    });
});