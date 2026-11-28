import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateTimeRemainingDto } from './update-time-remaining.dto';

async function validatePayload(payload: Record<string, unknown>) {
    const instance = plainToInstance(UpdateTimeRemainingDto, payload);
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('UpdateTimeRemainingDto', () => {
    it('passes with positive integer', async () => {
        const errors = await validatePayload({ secondsRemaining: 120 });

        expect(errors).toHaveLength(0);
    });

    it('passes with zero', async () => {
        const errors = await validatePayload({ secondsRemaining: 0 });

        expect(errors).toHaveLength(0);
    });

    it('rejects negative value', async () => {
        const errors = await validatePayload({ secondsRemaining: -1 });

        expect(hasErrorFor(errors, 'secondsRemaining')).toBe(true);
    });

    it('rejects non-integer', async () => {
        const errors = await validatePayload({ secondsRemaining: 1.5 });

        expect(hasErrorFor(errors, 'secondsRemaining')).toBe(true);
    });

    it('rejects string', async () => {
        const errors = await validatePayload({ secondsRemaining: '120' });

        expect(hasErrorFor(errors, 'secondsRemaining')).toBe(true);
    });

    it('rejects missing value', async () => {
        const errors = await validatePayload({});

        expect(hasErrorFor(errors, 'secondsRemaining')).toBe(true);
    });
});