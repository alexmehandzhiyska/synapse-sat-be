import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { SAT_TEST_DATES } from '../constants/study-plan.constants';

import { UpsertStudyPlanDto } from './upsert-study-plan.dto';

const validPayload = {
    goalScore: 1200,
    prepStartDate: '2026-09-01',
    testDate: '2026-12-05',
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(UpsertStudyPlanDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('UpsertStudyPlanDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('goalScore', () => {
        it('accepts the minimum score of 400', async () => {
            const errors = await validatePayload({ goalScore: 400 });

            expect(errors).toHaveLength(0);
        });

        it('accepts the maximum score of 1600', async () => {
            const errors = await validatePayload({ goalScore: 1600 });

            expect(errors).toHaveLength(0);
        });

        it('rejects a score below 400', async () => {
            const errors = await validatePayload({ goalScore: 390 });

            expect(hasErrorFor(errors, 'goalScore')).toBe(true);
        });

        it('rejects a score above 1600', async () => {
            const errors = await validatePayload({ goalScore: 1610 });

            expect(hasErrorFor(errors, 'goalScore')).toBe(true);
        });

        it('rejects a decimal score', async () => {
            const errors = await validatePayload({ goalScore: 1200.5 });

            expect(hasErrorFor(errors, 'goalScore')).toBe(true);
        });

        it('rejects a score sent as a string', async () => {
            const errors = await validatePayload({ goalScore: '1200' });

            expect(hasErrorFor(errors, 'goalScore')).toBe(true);
        });
    });

    describe('prepStartDate', () => {
        it('rejects a value that is not a date', async () => {
            const errors = await validatePayload({ prepStartDate: 'not-a-date' });

            expect(hasErrorFor(errors, 'prepStartDate')).toBe(true);
        });

        it('rejects a missing start date', async () => {
            const errors = await validatePayload({ prepStartDate: undefined });

            expect(hasErrorFor(errors, 'prepStartDate')).toBe(true);
        });
    });

    describe('testDate', () => {
        it('accepts every official SAT date', async () => {
            for (const testDate of SAT_TEST_DATES) {
                const errors = await validatePayload({ testDate });

                expect(errors).toHaveLength(0);
            }
        });

        it('rejects a valid date that is not an official SAT date', async () => {
            const errors = await validatePayload({ testDate: '2026-12-06' });

            expect(hasErrorFor(errors, 'testDate')).toBe(true);
        });

        it('rejects a missing test date', async () => {
            const errors = await validatePayload({ testDate: undefined });

            expect(hasErrorFor(errors, 'testDate')).toBe(true);
        });
    });
});