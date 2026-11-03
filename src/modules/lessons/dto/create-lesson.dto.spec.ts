import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateLessonDto } from './create-lesson.dto';

const validPayload = {
    title: 'A lesson',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(CreateLessonDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('CreateLessonDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('title', () => {
        it('rejects an empty title', async () => {
            const errors = await validatePayload({ title: '' });

            expect(hasErrorFor(errors, 'title')).toBe(true);
        });

        it('rejects a missing title', async () => {
            const errors = await validatePayload({ title: undefined });

            expect(hasErrorFor(errors, 'title')).toBe(true);
        });

        it('accepts a title of exactly 200 characters', async () => {
            const errors = await validatePayload({ title: 'A'.repeat(200) });

            expect(errors).toHaveLength(0);
        });

        it('rejects a title longer than 200 characters', async () => {
            const errors = await validatePayload({ title: 'A'.repeat(201) });

            expect(hasErrorFor(errors, 'title')).toBe(true);
        });
    });

    describe('videoUrl', () => {
        it('rejects a value that is not a URL', async () => {
            const errors = await validatePayload({ videoUrl: 'not a url' });

            expect(hasErrorFor(errors, 'videoUrl')).toBe(true);
        });

        it('rejects an empty URL', async () => {
            const errors = await validatePayload({ videoUrl: '' });

            expect(hasErrorFor(errors, 'videoUrl')).toBe(true);
        });

        it('rejects a missing URL', async () => {
            const errors = await validatePayload({ videoUrl: undefined });

            expect(hasErrorFor(errors, 'videoUrl')).toBe(true);
        });
    });
});