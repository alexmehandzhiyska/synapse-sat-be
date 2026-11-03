import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpsertAnswerDto } from './upsert-answer.dto';

async function validatePayload(payload: Record<string, unknown>) {
    const instance = plainToInstance(UpsertAnswerDto, payload);
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('UpsertAnswerDto', () => {
    it('passes with a valid choice id', async () => {
        const errors = await validatePayload({ selectedChoiceId: '7c9e6679-7425-40de-944b-e07fc1f90ae7' });

        expect(errors).toHaveLength(0);
    });

    it('passes with a null choice id to clear the answer', async () => {
        const errors = await validatePayload({ selectedChoiceId: null });

        expect(errors).toHaveLength(0);
    });

    it('passes with an empty payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    it('rejects a choice id that is not a UUID', async () => {
        const errors = await validatePayload({ selectedChoiceId: 'choice-a' });

        expect(hasErrorFor(errors, 'selectedChoiceId')).toBe(true);
    });

    it('rejects an empty string choice id', async () => {
        const errors = await validatePayload({ selectedChoiceId: '' });

        expect(hasErrorFor(errors, 'selectedChoiceId')).toBe(true);
    });
});
