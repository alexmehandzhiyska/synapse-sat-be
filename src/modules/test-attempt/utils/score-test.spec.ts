import { PracticeTest } from '../../practice-test/entities/practice-test.entity';
import { Difficulty, Domain, Section, TestType } from '../../practice-test/enums/practice-test.enums';

import { buildScoreReport } from './score-test';

interface ChoiceFixture {
    id: string;
    label: string;
    isCorrect: boolean;
}

interface QuestionFixture {
    id: string;
    position: number;
    domain: Domain;
    choices?: ChoiceFixture[];
}

const buildChoices = (questionId: string): ChoiceFixture[] => [
    { id: `${questionId}-a`, label: 'A', isCorrect: true },
    { id: `${questionId}-b`, label: 'B', isCorrect: false },
    { id: `${questionId}-c`, label: 'C', isCorrect: false },
    { id: `${questionId}-d`, label: 'D', isCorrect: false },
];

const buildQuestion = ({ id, position, domain, choices }: QuestionFixture) => ({
    id,
    position,
    domain,
    difficulty: Difficulty.MEDIUM,
    passage: null,
    prompt: `Prompt for ${id}`,
    answerChoices: (choices ?? buildChoices(id)).map((choice) => ({
        ...choice,
        content: `Content for ${choice.id}`,
    })),
});

const buildModule = (position: number, questions: QuestionFixture[]) => ({
    position,
    questions: questions.map(buildQuestion),
});

const buildSection = (name: Section, modules: ReturnType<typeof buildModule>[]) => ({ name, modules });

const buildTest = (
    sections: ReturnType<typeof buildSection>[],
    type: TestType = TestType.STANDARD,
): PracticeTest => ({ type, sections }) as unknown as PracticeTest;

const correct = (questionId: string) => ({ questionId, selectedChoiceId: `${questionId}-a` });
const incorrect = (questionId: string) => ({ questionId, selectedChoiceId: `${questionId}-b` });

// Builds a single reading & writing section with `count` questions in one module.
const buildSingleSectionTest = (count: number): PracticeTest =>
    buildTest([
        buildSection(Section.READING_WRITING, [
            buildModule(
                1,
                Array.from({ length: count }, (_, index) => ({
                    id: `q${index + 1}`,
                    position: index + 1,
                    domain: Domain.CRAFT_AND_STRUCTURE,
                })),
            ),
        ]),
    ]);

describe('buildScoreReport', () => {
    describe('question status', () => {
        const test = buildSingleSectionTest(3);

        it('marks a question as correct when the selected choice is the correct one', () => {
            const report = buildScoreReport('attempt-1', test, [correct('q1')]);

            expect(report.sections[0].modules[0].questions[0].status).toBe('correct');
        });

        it('marks a question as incorrect when the selected choice is not the correct one', () => {
            const report = buildScoreReport('attempt-1', test, [incorrect('q1')]);

            expect(report.sections[0].modules[0].questions[0].status).toBe('incorrect');
        });

        it('marks a question as omitted when there is no answer for it', () => {
            const report = buildScoreReport('attempt-1', test, []);

            expect(report.sections[0].modules[0].questions[0].status).toBe('omitted');
        });

        it('marks a question as omitted when its answer has a null selected choice', () => {
            const report = buildScoreReport('attempt-1', test, [{ questionId: 'q1', selectedChoiceId: null }]);

            expect(report.sections[0].modules[0].questions[0].status).toBe('omitted');
            expect(report.sections[0].modules[0].questions[0].selectedChoiceId).toBeNull();
        });

        it('marks an answered question as incorrect when it has no correct choice', () => {
            const noCorrectChoice = buildTest([
                buildSection(Section.MATH, [
                    buildModule(1, [
                        {
                            id: 'q1',
                            position: 1,
                            domain: Domain.ALGEBRA,
                            choices: [
                                { id: 'q1-a', label: 'A', isCorrect: false },
                                { id: 'q1-b', label: 'B', isCorrect: false },
                            ],
                        },
                    ]),
                ]),
            ]);

            const report = buildScoreReport('attempt-1', noCorrectChoice, [correct('q1')]);

            expect(report.sections[0].modules[0].questions[0].status).toBe('incorrect');
        });
    });

    describe('question result', () => {
        it('includes the question fields and the selected choice id', () => {
            const report = buildScoreReport('attempt-1', buildSingleSectionTest(1), [incorrect('q1')]);

            expect(report.sections[0].modules[0].questions[0]).toEqual({
                id: 'q1',
                position: 1,
                status: 'incorrect',
                domain: Domain.CRAFT_AND_STRUCTURE,
                difficulty: Difficulty.MEDIUM,
                passage: null,
                prompt: 'Prompt for q1',
                selectedChoiceId: 'q1-b',
                answerChoices: [
                    { id: 'q1-a', label: 'A', content: 'Content for q1-a', isCorrect: true },
                    { id: 'q1-b', label: 'B', content: 'Content for q1-b', isCorrect: false },
                    { id: 'q1-c', label: 'C', content: 'Content for q1-c', isCorrect: false },
                    { id: 'q1-d', label: 'D', content: 'Content for q1-d', isCorrect: false },
                ],
            });
        });

        it('sorts answer choices by label without mutating the original question', () => {
            const unorderedChoices = [
                { id: 'q1-c', label: 'C', isCorrect: false },
                { id: 'q1-a', label: 'A', isCorrect: true },
                { id: 'q1-b', label: 'B', isCorrect: false },
            ];
            const test = buildTest([
                buildSection(Section.MATH, [
                    buildModule(1, [{ id: 'q1', position: 1, domain: Domain.ALGEBRA, choices: unorderedChoices }]),
                ]),
            ]);

            const report = buildScoreReport('attempt-1', test, []);

            expect(report.sections[0].modules[0].questions[0].answerChoices.map((choice) => choice.label)).toEqual([
                'A',
                'B',
                'C',
            ]);
            expect(test.sections[0].modules[0].questions[0].answerChoices.map((choice) => choice.label)).toEqual([
                'C',
                'A',
                'B',
            ]);
        });
    });

    describe('module score', () => {
        it('counts correct, incorrect and omitted questions', () => {
            const report = buildScoreReport('attempt-1', buildSingleSectionTest(4), [
                correct('q1'),
                correct('q2'),
                incorrect('q3'),
            ]);

            expect(report.sections[0].modules[0]).toMatchObject({
                position: 1,
                correct: 2,
                incorrect: 1,
                omitted: 1,
                total: 4,
            });
        });

        it('orders questions by position', () => {
            const test = buildTest([
                buildSection(Section.MATH, [
                    buildModule(1, [
                        { id: 'q3', position: 3, domain: Domain.ALGEBRA },
                        { id: 'q1', position: 1, domain: Domain.ALGEBRA },
                        { id: 'q2', position: 2, domain: Domain.ALGEBRA },
                    ]),
                ]),
            ]);

            const report = buildScoreReport('attempt-1', test, []);

            expect(report.sections[0].modules[0].questions.map((question) => question.id)).toEqual([
                'q1',
                'q2',
                'q3',
            ]);
        });
    });

    describe('section score', () => {
        it('orders modules by position and sums their raw scores', () => {
            const test = buildTest([
                buildSection(Section.MATH, [
                    buildModule(2, [{ id: 'q3', position: 1, domain: Domain.ALGEBRA }]),
                    buildModule(1, [
                        { id: 'q1', position: 1, domain: Domain.ALGEBRA },
                        { id: 'q2', position: 2, domain: Domain.GEOMETRY_AND_TRIGONOMETRY },
                    ]),
                ]),
            ]);

            const report = buildScoreReport('attempt-1', test, [correct('q1'), incorrect('q2'), correct('q3')]);

            expect(report.sections[0].modules.map((module) => module.position)).toEqual([1, 2]);
            expect(report.sections[0]).toMatchObject({ name: Section.MATH, raw: 2, total: 3 });
        });

        it('groups domain scores across all modules of the section', () => {
            const test = buildTest([
                buildSection(Section.MATH, [
                    buildModule(1, [
                        { id: 'q1', position: 1, domain: Domain.ALGEBRA },
                        { id: 'q2', position: 2, domain: Domain.GEOMETRY_AND_TRIGONOMETRY },
                    ]),
                    buildModule(2, [
                        { id: 'q3', position: 1, domain: Domain.ALGEBRA },
                        { id: 'q4', position: 2, domain: Domain.ALGEBRA },
                    ]),
                ]),
            ]);

            const report = buildScoreReport('attempt-1', test, [correct('q1'), correct('q3'), incorrect('q4')]);

            expect(report.sections[0].domains).toEqual([
                { domain: Domain.ALGEBRA, correct: 2, total: 3 },
                { domain: Domain.GEOMETRY_AND_TRIGONOMETRY, correct: 0, total: 1 },
            ]);
        });
    });

    describe('scaled score', () => {
        const answerFirst = (count: number) =>
            Array.from({ length: count }, (_, index) => correct(`q${index + 1}`));

        it('returns 200 when no questions are answered correctly', () => {
            const report = buildScoreReport('attempt-1', buildSingleSectionTest(4), []);

            expect(report.sections[0].scaled).toBe(200);
        });

        it('returns 800 when every question is answered correctly', () => {
            const report = buildScoreReport('attempt-1', buildSingleSectionTest(4), answerFirst(4));

            expect(report.sections[0].scaled).toBe(800);
        });

        it('maps the raw score linearly onto the 200-800 scale', () => {
            const report = buildScoreReport('attempt-1', buildSingleSectionTest(4), answerFirst(2));

            expect(report.sections[0].scaled).toBe(500);
        });

        it('rounds the scaled score to the nearest 10', () => {
            // 200 + (1 / 7) * 600 = 285.71 -> 290
            const roundedUp = buildScoreReport('attempt-1', buildSingleSectionTest(7), answerFirst(1));
            // 200 + (1 / 9) * 600 = 266.67 -> 270
            const roundedFromNine = buildScoreReport('attempt-1', buildSingleSectionTest(9), answerFirst(1));
            // 200 + (1 / 11) * 600 = 254.55 -> 250
            const roundedDown = buildScoreReport('attempt-1', buildSingleSectionTest(11), answerFirst(1));

            expect(roundedUp.sections[0].scaled).toBe(290);
            expect(roundedFromNine.sections[0].scaled).toBe(270);
            expect(roundedDown.sections[0].scaled).toBe(250);
        });

        it('returns 200 for a section with no questions', () => {
            const report = buildScoreReport(
                'attempt-1',
                buildTest([buildSection(Section.MATH, [buildModule(1, [])])]),
                [],
            );

            expect(report.sections[0]).toMatchObject({ raw: 0, total: 0, scaled: 200, domains: [] });
        });
    });

    describe('report', () => {
        const fullTest = (type?: TestType) =>
            buildTest(
                [
                    buildSection(Section.MATH, [buildModule(1, [{ id: 'm1', position: 1, domain: Domain.ALGEBRA }])]),
                    buildSection(Section.READING_WRITING, [
                        buildModule(1, [
                            { id: 'rw1', position: 1, domain: Domain.CRAFT_AND_STRUCTURE },
                            { id: 'rw2', position: 2, domain: Domain.CRAFT_AND_STRUCTURE },
                        ]),
                    ]),
                ],
                type,
            );

        it('orders sections reading & writing first, then math', () => {
            const report = buildScoreReport('attempt-1', fullTest(), []);

            expect(report.sections.map((section) => section.name)).toEqual([Section.READING_WRITING, Section.MATH]);
        });

        it('skips sections the test does not have', () => {
            const report = buildScoreReport('attempt-1', buildSingleSectionTest(2), []);

            expect(report.sections.map((section) => section.name)).toEqual([Section.READING_WRITING]);
        });

        it('sums raw and scaled scores across sections', () => {
            const report = buildScoreReport('attempt-1', fullTest(), [correct('m1'), correct('rw1')]);

            // Reading & writing: 1 / 2 -> 500, math: 1 / 1 -> 800
            expect(report).toMatchObject({ attemptId: 'attempt-1', totalRaw: 2, totalScaled: 1300 });
        });

        it('returns empty totals for a test without sections', () => {
            const report = buildScoreReport('attempt-1', buildTest([]), []);

            expect(report).toMatchObject({ totalRaw: 0, totalScaled: 0, sections: [] });
        });

        it('flags a diagnostic test', () => {
            const report = buildScoreReport('attempt-1', fullTest(TestType.DIAGNOSTIC), []);

            expect(report).toMatchObject({ isDiagnostic: true, isCustom: false });
        });

        it('flags a custom test', () => {
            const report = buildScoreReport('attempt-1', fullTest(TestType.CUSTOM), []);

            expect(report).toMatchObject({ isDiagnostic: false, isCustom: true });
        });

        it('does not flag a standard test', () => {
            const report = buildScoreReport('attempt-1', fullTest(TestType.STANDARD), []);

            expect(report).toMatchObject({ isDiagnostic: false, isCustom: false });
        });

        it('ignores answers for questions that are not in the test', () => {
            const report = buildScoreReport('attempt-1', fullTest(), [correct('unknown-question')]);

            expect(report.totalRaw).toBe(0);
        });
    });
});
