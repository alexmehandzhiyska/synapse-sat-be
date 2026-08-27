import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ResetPasswordDto } from './reset-password.dto';

const validPayload = {
    email: 'pencho@test.com',
    code: '123456',
    newPassword: 'asdasdasd1!',
};

async function validatePayload(overrides: Partial<typeof validPayload>) {
    const instance = plainToInstance(ResetPasswordDto, { ...validPayload, ...overrides });
    return validate(instance);
}

describe('ResetPasswordDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('newPassword', () => {
        it('rejects a password shorter than 8 characters', async () => {
            const errors = await validatePayload({ newPassword: 'Sh0rt!' });

            expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
        });

        it('rejects a password longer than 72 characters', async () => {
            const errors = await validatePayload({ newPassword: `A1!${'a'.repeat(70)}` });

            expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
        });

        it('rejects a password missing a digit', async () => {
            const errors = await validatePayload({ newPassword: 'NoDigits!' });

            expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
        });

        it('rejects a password missing a special character', async () => {
            const errors = await validatePayload({ newPassword: 'NoSpecial1' });

            expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
        });

        it('accepts a password with a digit and a special character', async () => {
            const errors = await validatePayload({ newPassword: 'asdasdasd1!' });

            expect(errors.some((error) => error.property === 'newPassword')).toBe(false);
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
