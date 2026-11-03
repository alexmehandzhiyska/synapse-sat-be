import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { Difficulty, Domain } from '../enums/practice-test.enums';

import { UpdateQuestionDto } from './update-question.dto';

const validChoices = [
    { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7', content: 'choice-a', isCorrect: true },
    { id: '9b2f8a4e-3c1d-4e5f-8a6b-1c2d3e4f5a6b', content: 'choice-b', isCorrect: false },
];

const validPayload = {
    domain: Domain.ALGEBRA,
    passage: 'A passage',
    prompt: 'A prompt',
    difficulty: Difficulty.MEDIUM,
    answerChoices: validChoices,
};

async function validatePayload(overrides: Record<string, unknown>) {
    const instance = plainToInstance(UpdateQuestionDto, { ...validPayload, ...overrides });
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);
const withChoice = (overrides: Record<string, unknown>) => [{ ...validChoices[0], ...overrides }, validChoices[1]];

describe('UpdateQuestionDto', () => {
    it('passes with a valid payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    it('passes with an empty payload', async () => {
        const errors = await validate(plainToInstance(UpdateQuestionDto, {}));

        expect(errors).toHaveLength(0);
    });

    describe('domain', () => {
        it('rejects an unknown domain', async () => {
            const errors = await validatePayload({ domain: 'astronomy' });

            expect(hasErrorFor(errors, 'domain')).toBe(true);
        });
    });

    describe('passage', () => {
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
    });

    describe('difficulty', () => {
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

        it('rejects a choice with an id that is not a UUID', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ id: 'choice-a' }) });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
        });

        it('rejects a choice without an id', async () => {
            const errors = await validatePayload({ answerChoices: withChoice({ id: undefined }) });

            expect(hasErrorFor(errors, 'answerChoices')).toBe(true);
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
            const errors = await validatePayload({ answerChoices: withChoice({ id: 'choice-a' }) });
            const choiceErrors = errors.find((error) => error.property === 'answerChoices')!.children!;

            expect(choiceErrors[0].property).toBe('0');
            expect(choiceErrors[0].children!.map((error) => error.property)).toEqual(['id']);
        });
    });
});