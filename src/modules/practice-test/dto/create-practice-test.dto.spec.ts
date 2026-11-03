import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { Domain, TestType } from '../enums/practice-test.enums';

import { CreatePracticeTestDto } from './create-practice-test.dto';

const validPayload = {
    title: 'Practice Test 1',
    type: TestType.STANDARD,
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(CreatePracticeTestDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('CreatePracticeTestDto', () => {
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

    describe('type', () => {
        it('rejects an unknown type', async () => {
            const errors = await validatePayload({ type: 'final' });

            expect(hasErrorFor(errors, 'type')).toBe(true);
        });

        it('rejects a missing type', async () => {
            const errors = await validatePayload({ type: undefined });

            expect(hasErrorFor(errors, 'type')).toBe(true);
        });
    });

    describe('domain', () => {
        it('accepts a check-in test scoped to a domain', async () => {
            const errors = await validatePayload({ type: TestType.CHECK_IN, domain: Domain.ALGEBRA });

            expect(errors).toHaveLength(0);
        });

        it('rejects an unknown domain', async () => {
            const errors = await validatePayload({ domain: 'astronomy' });

            expect(hasErrorFor(errors, 'domain')).toBe(true);
        });
    });
});