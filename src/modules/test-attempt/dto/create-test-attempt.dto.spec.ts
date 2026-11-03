import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateTestAttemptDto } from './create-test-attempt.dto';

async function validatePayload(payload: Record<string, unknown>) {
    const instance = plainToInstance(CreateTestAttemptDto, payload);
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('CreateTestAttemptDto', () => {
    it('passes with a valid test id', async () => {
        const errors = await validatePayload({ testId: '7c9e6679-7425-40de-944b-e07fc1f90ae7' });

        expect(errors).toHaveLength(0);
    });

    it('rejects a test id that is not a UUID', async () => {
        const errors = await validatePayload({ testId: 'test-1' });

        expect(hasErrorFor(errors, 'testId')).toBe(true);
    });

    it('rejects a missing test id', async () => {
        const errors = await validatePayload({});

        expect(hasErrorFor(errors, 'testId')).toBe(true);
    });
});