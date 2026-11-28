import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateFlashcardDto } from './update-flashcard.dto';

async function validatePayload(payload: Record<string, unknown>) {
    const instance = plainToInstance(UpdateFlashcardDto, payload);
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('UpdateFlashcardDto', () => {
    it('passes with definition', async () => {
        const errors = await validatePayload({ definition: 'Definition' });

        expect(errors).toHaveLength(0);
    });

    it('rejects missing definition', async () => {
        const errors = await validatePayload({});

        expect(hasErrorFor(errors, 'definition')).toBe(true);
    });

    it('rejects empty definition', async () => {
        const errors = await validatePayload({ definition: '' });

        expect(hasErrorFor(errors, 'definition')).toBe(true);
    });

    it('rejects non-string definition', async () => {
        const errors = await validatePayload({ definition: 1 });

        expect(hasErrorFor(errors, 'definition')).toBe(true);
    });
});
