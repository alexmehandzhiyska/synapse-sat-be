import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { Difficulty, Domain } from '../enums/practice-test.enums';

import { CreateQuestionDto } from './create-question.dto';

const validChoices = [
    { label: 'A', content: 'choice-a', isCorrect: true },
    { label: 'B', content: 'choice-b', isCorrect: false },
];

const validPayload = {
    domain: Domain.ALGEBRA,
    passage: 'A passage',
    prompt: 'A prompt',
    difficulty: Difficulty.MEDIUM,
    answerChoices: validChoices,
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(CreateQuestionDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) =>
    errors.some((error) => error.property === property);

const withChoice = (overrides: Record<string, unknown>) => [{ ...validChoices[0], ...overrides }, validChoices[1]];

describe('CreateQuestionDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    describe('domain', () => {
        it('rejects an unknown domain', async () => {
            const errors = await validatePayload({ domain: 'astronomy' });

            expect(hasErrorFor(errors, 'domain')).toBe(true);
        });

        it('rejects a missing domain', async () => {
            const errors = await validatePayload({ domain: undefined });

            expect(hasErrorFor(errors, 'domain')).toBe(true);
        });
    });

    describe('passage', () => {
        it('is optional', async () => {
            const errors = await validatePayload({ passage: undefined });

            expect(errors).toHaveLength(0);
        });

        it('rejects a passage that is not a string', async () => {
            const errors = await validatePayload({ passage: 123 });

            expect(hasErrorFor(errors, 'passage')).toBe(true);
        });
    });

    describe('prompt', () => {
        it('rejects an empty prompt', async () => {
            const errors = await validatePayload({ prompt: '' });

            expect(hasErrorFor(errors, 'prompt')).toBe(true);
        });

        it('rejects a missing prompt', async () => {
            const errors = await validatePayload({ prompt: undefined });

            expect(hasErrorFor(errors, 'prompt')).toBe(true);
        });
    });

    describe('difficulty', () => {
        it('is optional', async () => {
            const errors = await validatePayload({ difficulty: undefined });

            expect(errors).toHaveLength(0);
        });

        it('rejects an unknown difficulty', async () => {
            const errors = await validatePayload({ difficulty: 'impossible' });

            expect(hasErrorFor(errors, 'difficulty')).toBe(true);
        });
    });

    describe('answerChoices', () => {
        it('rejects fewer than two choices', async () => {
            const errors = await validatePayload({ answerChoices: [validChoices[0]] });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
        });

        it('rejects a value that is not an array', async () => {
            const errors = await validatePayload({ answerChoices: validChoices[0] });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
        });

        it('rejects a choice with an empty label', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ label: '' }) });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
        });

        it('rejects a choice with a label longer than 10 characters', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ label: 'A'.repeat(11) }) });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
        });

        it('accepts a choice with a label of exactly 10 characters', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ label: 'A'.repeat(10) }) });

            expect(errors).toHaveLength(0);
        });

        it('rejects a choice with empty content', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ content: '' }) });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
        });

        it('rejects a choice where isCorrect is not a boolean', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ isCorrect: 'true' }) });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
        });

        it('reports which choice and field are invalid', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ content: '' }) });
            const choiceErrors = errors.find((error) => error.property === 'answerChoices')!.children!;

            expect(choiceErrors[0].property).toBe('0');
            expect(choiceErrors[0].children!.map((error) => error.property)).toEqual(['content']);
        });
    });
});