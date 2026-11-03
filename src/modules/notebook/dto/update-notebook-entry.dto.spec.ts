import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateNotebookEntryDto } from './update-notebook-entry.dto';

const validPayload = {
    what: 'what',
    why: 'why',
    how: 'how',
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(UpdateNotebookEntryDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('UpdateNotebookEntryDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    it('rejects an empty payload', async () => {
        const errors = await validate(plainToInstance(UpdateNotebookEntryDto, {}));

        expect(errors.map((error) => error.property)).toEqual(['what', 'why', 'how']);
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