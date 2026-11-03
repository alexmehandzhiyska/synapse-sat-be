import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { TestType } from '../enums/practice-test.enums';

import { UpdatePracticeTestDto } from './update-practice-test.dto';

async function validatePayload(payload: Record<string, unknown>) {
    const instance = plainToInstance(UpdatePracticeTestDto, payload);
    return validate(instance);
}

const hasErrorFor = (errors: Awaited<ReturnType<typeof validate>>, property: string) => errors.some((error) => error.property === property);

describe('UpdatePracticeTestDto', () => {
    it('passes with an empty payload', async () => {
        const errors = await validatePayload({});

        expect(errors).toHaveLength(0);
    });

    it('passes when only the title is updated', async () => {
        const errors = await validatePayload({ title: 'Practice Test 2' });

        expect(errors).toHaveLength(0);
    });

    it('keeps the title rules from the create dto', async () => {
        const emptyTitleErrors = await validatePayload({ title: '' });
        const longTitleErrors = await validatePayload({ title: 'A'.repeat(201) });

        expect(hasErrorFor(emptyTitleErrors, 'title')).toBe(true);
        expect(hasErrorFor(longTitleErrors, 'title')).toBe(true);
    });

    it('keeps the type rules from the create dto', async () => {
        const errors = await validatePayload({ type: 'final' });

        expect(hasErrorFor(errors, 'type')).toBe(true);
    });

    it('passes with a valid type', async () => {
        const errors = await validatePayload({ type: TestType.CUSTOM });

        expect(errors).toHaveLength(0);
    });

    it('keeps the domain rules from the create dto', async () => {
        const errors = await validatePayload({ domain: 'astronomy' });

        expect(hasErrorFor(errors, 'domain')).toBe(true);
    });
});