import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { Difficulty, Domain, QuestionStatusFilter, Section } from '../enums/practice-test.enums';

import { GenerateCustomPacketDto } from './generate-custom-packet.dto';

const validPayload = {
    section: Section.MATH,
    domains: [Domain.ALGEBRA, Domain.ADVANCED_MATH],
    difficulties: [Difficulty.EASY, Difficulty.HARD],
    statuses: [QuestionStatusFilter.INCORRECT],
    count: 10,
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(GenerateCustomPacketDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) =>
    errors.some((error) => error.property === property);

describe('GenerateCustomPacketDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    it('passes with empty filter lists', async () => {
        const errors = await validatePayload({ domains: [], difficulties: [], statuses: [] });

        expect(errors).toHaveLength(0);
    });

    describe('section', () => {
        it('rejects an unknown section', async () => {
            const errors = await validatePayload({ section: 'science' });

            expect(hasErrorFor(errors, 'section')).toBe(true);
        });

        it('rejects a missing section', async () => {
            const errors = await validatePayload({ section: undefined });

            expect(hasErrorFor(errors, 'section')).toBe(true);
        });
    });

    describe('domains', () => {
        it('rejects a value that is not an array', async () => {
            const errors = await validatePayload({ domains: Domain.ALGEBRA });

            expect(hasErrorFor(errors, 'domains')).toBe(true);
        });

        it('rejects an unknown domain in the list', async () => {
            const errors = await validatePayload({ domains: [Domain.ALGEBRA, 'astronomy'] });

            expect(hasErrorFor(errors, 'domains')).toBe(true);
        });
    });

    describe('difficulties', () => {
        it('rejects a value that is not an array', async () => {
            const errors = await validatePayload({ difficulties: Difficulty.EASY });

            expect(hasErrorFor(errors, 'difficulties')).toBe(true);
        });

        it('rejects an unknown difficulty in the list', async () => {
            const errors = await validatePayload({ difficulties: ['impossible'] });

            expect(hasErrorFor(errors, 'difficulties')).toBe(true);
        });
    });

    describe('statuses', () => {
        it('rejects a value that is not an array', async () => {
            const errors = await validatePayload({ statuses: QuestionStatusFilter.CORRECT });

            expect(hasErrorFor(errors, 'statuses')).toBe(true);
        });

        it('rejects an unknown status in the list', async () => {
            const errors = await validatePayload({ statuses: ['skipped'] });

            expect(hasErrorFor(errors, 'statuses')).toBe(true);
        });
    });

    describe('count', () => {
        it('accepts a count of 1', async () => {
            const errors = await validatePayload({ count: 1 });

            expect(errors).toHaveLength(0);
        });

        it('rejects a count of 0', async () => {
            const errors = await validatePayload({ count: 0 });

            expect(hasErrorFor(errors, 'count')).toBe(true);
        });

        it('rejects a negative count', async () => {
            const errors = await validatePayload({ count: -5 });

            expect(hasErrorFor(errors, 'count')).toBe(true);
        });

        it('rejects a decimal count', async () => {
            const errors = await validatePayload({ count: 2.5 });

            expect(hasErrorFor(errors, 'count')).toBe(true);
        });

        it('rejects a count sent as a string', async () => {
            const errors = await validatePayload({ count: '10' });

            expect(hasErrorFor(errors, 'count')).toBe(true);
        });
    });
});