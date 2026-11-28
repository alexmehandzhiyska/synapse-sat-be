import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { FlashcardRating } from '../enums/flashcard-rating.enum';
import { ReviewFlashcardDto } from './review-flashcard.dto';

async function validatePayload(payload: Record<string, unknown>) {
    const instance = plainToInstance(ReviewFlashcardDto, payload);
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('ReviewFlashcardDto', () => {
    it.each(Object.values(FlashcardRating))('passes with %s rating', async (rating) => {
        const errors = await validatePayload({ rating });

        expect(errors).toHaveLength(0);
    });

    it('rejects unknown rating', async () => {
        const errors = await validatePayload({ rating: 'easy' });

        expect(hasErrorFor(errors, 'rating')).toBe(true);
    });

    it('rejects missing rating', async () => {
        const errors = await validatePayload({});

        expect(hasErrorFor(errors, 'rating')).toBe(true);
    });
});