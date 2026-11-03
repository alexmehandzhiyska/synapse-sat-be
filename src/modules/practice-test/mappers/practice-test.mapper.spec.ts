import { PracticeTest } from '../entities/practice-test.entity';
import { Difficulty, Domain, Section, TestType } from '../enums/practice-test.enums';

import { toFullPracticeTestResponse } from './practice-test.mapper';

const createdAt = new Date('2026-09-01T10:00:00Z');
const updatedAt = new Date('2026-09-02T10:00:00Z');

const buildChoice = (id: string, label: string, isCorrect: boolean) => ({
    id,
    label,
    content: id,
    isCorrect,
    questionId: 'question-1',
});

const buildTest = (): PracticeTest =>
    ({
        id: 'test-1',
        title: 'Practice Test 1',
        type: TestType.STANDARD,
        domain: null,
        createdAt,
        updatedAt,
        sections: [
            {
                id: 'section-1',
                name: Section.READING_WRITING,
                directions: 'Read each passage carefully.',
                testId: 'test-1',
                modules: [
                    {
                        id: 'module-1',
                        position: 1,
                        sectionId: 'section-1',
                        questions: [
                            {
                                id: 'question-1',
                                position: 1,
                                domain: Domain.CRAFT_AND_STRUCTURE,
                                difficulty: Difficulty.EASY,
                                passage: 'A passage',
                                prompt: 'What is the main idea?',
                                section: Section.READING_WRITING,
                                moduleId: 'module-1',
                                answerChoices: [
                                    buildChoice('choice-a', 'A', true),
                                    buildChoice('choice-b', 'B', false),
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    }) as unknown as PracticeTest;

describe('toFullPracticeTestResponse', () => {
    it('maps the full test hierarchy to the response shape', () => {
        const result = toFullPracticeTestResponse(buildTest(), true);

        expect(result).toEqual({
            id: 'test-1',
            title: 'Practice Test 1',
            type: TestType.STANDARD,
            domain: null,
            createdAt,
            updatedAt,
            sections: [
                {
                    id: 'section-1',
                    name: Section.READING_WRITING,
                    directions: 'Read each passage carefully.',
                    modules: [
                        {
                            id: 'module-1',
                            position: 1,
                            questions: [
                                {
                                    id: 'question-1',
                                    position: 1,
                                    domain: Domain.CRAFT_AND_STRUCTURE,
                                    difficulty: Difficulty.EASY,
                                    passage: 'A passage',
                                    prompt: 'What is the main idea?',
                                    answerChoices: [
                                        { id: 'choice-a', label: 'A', content: 'choice-a', isCorrect: true },
                                        { id: 'choice-b', label: 'B', content: 'choice-b', isCorrect: false },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    it('hides which answer is correct by default', () => {
        const result = toFullPracticeTestResponse(buildTest());
        const choices = result.sections[0].modules[0].questions[0].answerChoices;

        expect(choices).toEqual([
            { id: 'choice-a', label: 'A', content: 'choice-a' },
            { id: 'choice-b', label: 'B', content: 'choice-b' },
        ]);
        
        expect(choices[0]).not.toHaveProperty('isCorrect');
    });

    it('hides which answer is correct when correctness is not included', () => {
        const result = toFullPracticeTestResponse(buildTest(), false);
        const choices = result.sections[0].modules[0].questions[0].answerChoices;

        expect(choices.every((choice) => !('isCorrect' in choice))).toBe(true);
    });

    it('returns an empty sections list for a test without sections', () => {
        const test = { ...buildTest(), sections: [] } as unknown as PracticeTest;
        const result = toFullPracticeTestResponse(test);

        expect(result.sections).toEqual([]);
    });
});