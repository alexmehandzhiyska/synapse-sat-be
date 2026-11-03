import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateNotebookEntryDto } from './create-notebook-entry.dto';

const validPayload = {
    questionId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    what: 'what',
    why: 'why',
    how: 'how',
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(CreateNotebookEntryDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('CreateNotebookEntryDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('questionId', () => {
        it('rejects a question id that is not a UUID', async () => {
            const errors = await validatePayload({ questionId: 'question-1' });

            expect(hasErrorFor(errors, 'questionId')).toBe(true);
        });

        it('rejects a missing question id', async () => {
            const errors = await validatePayload({ questionId: undefined });

            expect(hasErrorFor(errors, 'questionId')).toBe(true);
        });
    });

    describe('what', () => {
        it('rejects an empty value', async () => {
            const errors = await validatePayload({ what: '' });

            expect(hasErrorFor(errors, 'what')).toBe(true);
        });

        it('rejects a missing value', async () => {
            const errors = await validatePayload({ what: undefined });

            expect(hasErrorFor(errors, 'what')).toBe(true);
        });
    });

    describe('why', () => {
        it('rejects an empty value', async () => {
            const errors = await validatePayload({ why: '' });

            expect(hasErrorFor(errors, 'why')).toBe(true);
        });

        it('rejects a missing value', async () => {
            const errors = await validatePayload({ why: undefined });

            expect(hasErrorFor(errors, 'why')).toBe(true);
        });
    });

    describe('how', () => {
        it('rejects an empty value', async () => {
            const errors = await validatePayload({ how: '' });

            expect(hasErrorFor(errors, 'how')).toBe(true);
        });

        it('rejects a missing value', async () => {
            const errors = await validatePayload({ how: undefined });

            expect(hasErrorFor(errors, 'how')).toBe(true);
        });
    });
});