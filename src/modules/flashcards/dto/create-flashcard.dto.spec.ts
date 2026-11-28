import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateFlashcardDto } from './create-flashcard.dto';

async function validatePayload(payload: Record<string, unknown>) {
    const instance = plainToInstance(CreateFlashcardDto, payload);
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

const validPayload = { word: 'Word', definition: 'Definition' };

describe('CreateFlashcardDto', () => {
    it('passes with word and definition', async () => {
        const errors = await validatePayload(validPayload);

        expect(errors).toHaveLength(0);
    });

    it('passes with context and question id', async () => {
        const errors = await validatePayload({
            ...validPayload,
            context: 'Context',
            questionId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        });

        expect(errors).toHaveLength(0);
    });

    it('passes with 100 character word', async () => {
        const errors = await validatePayload({ ...validPayload, word: 'a'.repeat(100) });

        expect(errors).toHaveLength(0);
    });

    it('rejects word longer than 100 characters', async () => {
        const errors = await validatePayload({ ...validPayload, word: 'a'.repeat(101) });

        expect(hasErrorFor(errors, 'word')).toBe(true);
    });

    it('rejects missing word', async () => {
        const errors = await validatePayload({ definition: 'Definition' });

        expect(hasErrorFor(errors, 'word')).toBe(true);
    });

    it('rejects empty word', async () => {
        const errors = await validatePayload({ ...validPayload, word: '' });

        expect(hasErrorFor(errors, 'word')).toBe(true);
    });

    it('rejects non-string word', async () => {
        const errors = await validatePayload({ ...validPayload, word: 1 });

        expect(hasErrorFor(errors, 'word')).toBe(true);
    });

    it('rejects missing definition', async () => {
        const errors = await validatePayload({ word: 'Word' });

        expect(hasErrorFor(errors, 'definition')).toBe(true);
    });

    it('rejects empty definition', async () => {
        const errors = await validatePayload({ ...validPayload, definition: '' });

        expect(hasErrorFor(errors, 'definition')).toBe(true);
    });

    it('rejects non-string context', async () => {
        const errors = await validatePayload({ ...validPayload, context: 1 });

        expect(hasErrorFor(errors, 'context')).toBe(true);
    });

    it('rejects question id that is not UUID', async () => {
        const errors = await validatePayload({ ...validPayload, questionId: 'question-1' });

        expect(hasErrorFor(errors, 'questionId')).toBe(true);
    });
});