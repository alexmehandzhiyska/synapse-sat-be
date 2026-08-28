import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PracticeTest } from '../practice-test/entities/practice-test.entity';
import { Difficulty, Domain, Section, TestType } from '../practice-test/enums/practice-test.enums';

import { TestAttemptService } from './test-attempt.service';
import { TestAttempt } from './entities/test-attempt.entity';
import { UserAnswer } from './entities/user-answer.entity';

type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>>;

const createMockQueryBuilder = () => {
    const queryBuilder: any = {};
    queryBuilder.insert = jest.fn(() => queryBuilder);
    queryBuilder.into = jest.fn(() => queryBuilder);
    queryBuilder.values = jest.fn(() => queryBuilder);
    queryBuilder.orIgnore = jest.fn(() => queryBuilder);
    queryBuilder.execute = jest.fn(async () => ({}));
    return queryBuilder;
};

const createMockRepository = (): MockRepository => ({
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (entity) => entity),
    createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
});

const buildQuestion = (id: string, position: number, domain: Domain) => ({
    id,
    position,
    domain,
    difficulty: Difficulty.EASY,
    passage: null,
    prompt: `Question ${position}`,
    answerChoices: [
        { id: `${id}-correct`, label: 'A', content: 'Correct', isCorrect: true },
        { id: `${id}-wrong`, label: 'B', content: 'Wrong', isCorrect: false },
    ],
});

const buildTest = () => ({
    id: 'test-1',
    type: TestType.STANDARD,
    sections: [
        {
            name: Section.READING_WRITING,
            modules: [
                {
                    position: 1,
                    questions: [
                        buildQuestion('q1', 1, Domain.CRAFT_AND_STRUCTURE),
                        buildQuestion('q2', 2, Domain.CRAFT_AND_STRUCTURE),
                    ],
                },
            ],
        },
        {
            name: Section.MATH,
            modules: [
                {
                    position: 1,
                    questions: [buildQuestion('q3', 1, Domain.ALGEBRA)],
                },
            ],
        },
    ],
});

describe('TestAttemptService', () => {
    let service: TestAttemptService;
    let testAttemptRepository: MockRepository;
    let userAnswerRepository: MockRepository;
    let practiceTestRepository: MockRepository;

    beforeEach(async () => {
        testAttemptRepository = createMockRepository();
        userAnswerRepository = createMockRepository();
        practiceTestRepository = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TestAttemptService,
                { provide: getRepositoryToken(TestAttempt), useValue: testAttemptRepository },
                { provide: getRepositoryToken(UserAnswer), useValue: userAnswerRepository },
                { provide: getRepositoryToken(PracticeTest), useValue: practiceTestRepository },
            ],
        }).compile();

        service = module.get(TestAttemptService);
    });

    describe('getOne', () => {
        it('throws NotFoundException when the attempt does not exist', async () => {
            testAttemptRepository.findOne!.mockResolvedValue(null);

            await expect(service.getOne('missing-id', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws NotFoundException when the attempt belongs to another user', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({ id: 'attempt-1', userId: 'other-user', answers: [] });

            await expect(service.getOne('attempt-1', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('returns the attempt mapped to its response shape', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({
                id: 'attempt-1',
                userId: 'user-1',
                testId: 'test-1',
                currentModuleIndex: 0,
                completedAt: null,
                answers: [{ questionId: 'q1', selectedChoiceId: 'choice-1' }],
            });

            const result = await service.getOne('attempt-1', 'user-1');

            expect(result).toEqual({
                id: 'attempt-1',
                testId: 'test-1',
                status: 'in_progress',
                currentModuleIndex: 0,
                answers: [{ questionId: 'q1', selectedChoiceId: 'choice-1' }],
            });
        });
    });

    describe('startOrResume', () => {
        it('throws NotFoundException when the practice test does not exist', async () => {
            practiceTestRepository.findOne!.mockResolvedValue(null);

            await expect(service.startOrResume('missing-test', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('creates the attempt if needed and returns the active attempt', async () => {
            practiceTestRepository.findOne!.mockResolvedValue({ id: 'test-1' });
            testAttemptRepository.findOneOrFail!.mockResolvedValue({
                id: 'attempt-1',
                testId: 'test-1',
                currentModuleIndex: 0,
                completedAt: null,
                answers: [],
            });

            const result = await service.startOrResume('test-1', 'user-1');

            const queryBuilder = testAttemptRepository.createQueryBuilder!.mock.results[0].value;
            expect(queryBuilder.values).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'user-1', testId: 'test-1', startedAt: expect.any(Date) }),
            );
            expect(queryBuilder.orIgnore).toHaveBeenCalled();
            expect(result.id).toBe('attempt-1');
        });
    });

    describe('upsertAnswer', () => {
        it('throws NotFoundException when the attempt is not owned by the user', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({ id: 'attempt-1', userId: 'other-user', answers: [] });

            await expect(
                service.upsertAnswer('attempt-1', 'question-1', {} as any, 'user-1'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('creates a new answer and marks it answered when a choice is selected', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({ id: 'attempt-1', userId: 'user-1', answers: [] });
            userAnswerRepository.findOne!.mockResolvedValue(null);

            await service.upsertAnswer('attempt-1', 'question-1', { selectedChoiceId: 'choice-1' } as any, 'user-1');

            expect(userAnswerRepository.create).toHaveBeenCalledTimes(1);
            const savedAnswer = userAnswerRepository.save!.mock.calls[0][0];
            expect(savedAnswer).toMatchObject({ testAttemptId: 'attempt-1', questionId: 'question-1' });
            expect(savedAnswer.selectedChoiceId).toBe('choice-1');
            expect(savedAnswer.answeredAt).toBeInstanceOf(Date);
        });

        it("updates an existing answer's selected choice", async () => {
            testAttemptRepository.findOne!.mockResolvedValue({ id: 'attempt-1', userId: 'user-1', answers: [] });
            const existingAnswer = {
                id: 'answer-1',
                testAttemptId: 'attempt-1',
                questionId: 'question-1',
                selectedChoiceId: 'choice-old',
                answeredAt: null,
            };
            userAnswerRepository.findOne!.mockResolvedValue(existingAnswer);

            await service.upsertAnswer('attempt-1', 'question-1', { selectedChoiceId: 'choice-new' } as any, 'user-1');

            expect(userAnswerRepository.create).not.toHaveBeenCalled();
            expect(userAnswerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'answer-1', selectedChoiceId: 'choice-new' }),
            );
        });

        it('clears the selection without setting answeredAt when no choice is provided', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({ id: 'attempt-1', userId: 'user-1', answers: [] });
            userAnswerRepository.findOne!.mockResolvedValue(null);

            await service.upsertAnswer('attempt-1', 'question-1', {} as any, 'user-1');

            const savedAnswer = userAnswerRepository.save!.mock.calls[0][0];
            expect(savedAnswer.selectedChoiceId).toBeNull();
            expect(savedAnswer.answeredAt).toBeUndefined();
        });
    });

    describe('advanceModule', () => {
        it('throws NotFoundException when the attempt is not owned', async () => {
            testAttemptRepository.findOne!.mockResolvedValue(null);

            await expect(service.advanceModule('attempt-1', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('increments the current module index', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({
                id: 'attempt-1',
                userId: 'user-1',
                testId: 'test-1',
                currentModuleIndex: 1,
                completedAt: null,
                answers: [],
            });

            const result = await service.advanceModule('attempt-1', 'user-1');

            expect(testAttemptRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ currentModuleIndex: 2 }),
            );
            expect(result.currentModuleIndex).toBe(2);
        });
    });

    describe('submit', () => {
        it('throws NotFoundException when the attempt is not owned', async () => {
            testAttemptRepository.findOne!.mockResolvedValue(null);

            await expect(service.submit('attempt-1', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('marks an in-progress attempt as completed', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({
                id: 'attempt-1',
                userId: 'user-1',
                testId: 'test-1',
                currentModuleIndex: 3,
                completedAt: null,
                answers: [],
            });

            const result = await service.submit('attempt-1', 'user-1');

            expect(testAttemptRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ completedAt: expect.any(Date) }),
            );
            expect(result.status).toBe('completed');
        });

        it('does not re-save an already completed attempt', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({
                id: 'attempt-1',
                userId: 'user-1',
                testId: 'test-1',
                currentModuleIndex: 3,
                completedAt: new Date('2024-01-01T00:00:00.000Z'),
                answers: [],
            });

            await service.submit('attempt-1', 'user-1');

            expect(testAttemptRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getScore', () => {
        it('throws NotFoundException when the attempt is not owned', async () => {
            testAttemptRepository.findOne!.mockResolvedValue(null);

            await expect(service.getScore('attempt-1', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('scores the attempt against the test, section by section', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({
                id: 'attempt-1',
                userId: 'user-1',
                testId: 'test-1',
                answers: [
                    { questionId: 'q1', selectedChoiceId: 'q1-correct' },
                    { questionId: 'q2', selectedChoiceId: 'q2-wrong' },
                ],
            });
            practiceTestRepository.findOneOrFail!.mockResolvedValue(buildTest());

            const result = await service.getScore('attempt-1', 'user-1');

            expect(result.totalRaw).toBe(1);
            expect(result.totalScaled).toBe(700);
            expect(result.sections.map((section) => section.name)).toEqual([
                Section.READING_WRITING,
                Section.MATH,
            ]);
        });
    });

    describe('getScoreDistribution', () => {
        it('throws NotFoundException when the attempt is not owned', async () => {
            testAttemptRepository.findOne!.mockResolvedValue(null);

            await expect(service.getScoreDistribution('attempt-1', 'user-1')).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });

        it('builds the distribution from every completed attempt on the test', async () => {
            const attempt = {
                id: 'attempt-1',
                userId: 'user-1',
                testId: 'test-1',
                answers: [
                    { questionId: 'q1', selectedChoiceId: 'q1-correct' },
                    { questionId: 'q2', selectedChoiceId: 'q2-correct' },
                ],
            };
            testAttemptRepository.findOne!.mockResolvedValue(attempt);
            practiceTestRepository.findOneOrFail!.mockResolvedValue(buildTest());
            testAttemptRepository.find!.mockResolvedValue([attempt]);

            const result = await service.getScoreDistribution('attempt-1', 'user-1');

            expect(result.totalAttempts).toBe(1);
            expect(result.yourScore).toBe(1000);
            expect(result.percentile).toBe(0);
        });
    });

    describe('getDomainAccuracy', () => {
        it('returns null when the user has no completed diagnostic attempt', async () => {
            testAttemptRepository.findOne!.mockResolvedValue(null);

            await expect(service.getDomainAccuracy('user-1')).resolves.toBeNull();
        });

        it('returns per-domain accuracy from the diagnostic attempt', async () => {
            testAttemptRepository.findOne!.mockResolvedValue({
                id: 'attempt-1',
                testId: 'test-1',
                answers: [
                    { questionId: 'q1', selectedChoiceId: 'q1-correct' },
                    { questionId: 'q2', selectedChoiceId: 'q2-wrong' },
                ],
            });
            practiceTestRepository.findOneOrFail!.mockResolvedValue(buildTest());

            const accuracy = await service.getDomainAccuracy('user-1');

            expect(accuracy!.get(Domain.CRAFT_AND_STRUCTURE)).toBe(0.5);
            expect(accuracy!.get(Domain.ALGEBRA)).toBe(0);
        });
    });

    describe('getCompletedTestIds', () => {
        it('returns an empty set without querying when no test ids are given', async () => {
            const result = await service.getCompletedTestIds('user-1', []);

            expect(result).toEqual(new Set());
            expect(testAttemptRepository.find).not.toHaveBeenCalled();
        });

        it('returns the set of completed test ids', async () => {
            testAttemptRepository.find!.mockResolvedValue([{ testId: 'test-1' }, { testId: 'test-2' }]);

            const result = await service.getCompletedTestIds('user-1', ['test-1', 'test-2', 'test-3']);

            expect(result).toEqual(new Set(['test-1', 'test-2']));
        });
    });

    describe('getAllCompleted', () => {
        it('maps each completed attempt to a summary with section scores', async () => {
            const attempt = {
                id: 'attempt-1',
                testId: 'test-1',
                completedAt: new Date('2024-01-01T00:00:00.000Z'),
                test: { title: 'Standard Test' },
                answers: [
                    { questionId: 'q1', selectedChoiceId: 'q1-correct' },
                    { questionId: 'q2', selectedChoiceId: 'q2-correct' },
                ],
            };
            testAttemptRepository.find!.mockResolvedValue([attempt]);
            practiceTestRepository.findOneOrFail!.mockResolvedValue(buildTest());

            const [summary] = await service.getAllCompleted('user-1');

            expect(summary).toMatchObject({
                id: 'attempt-1',
                testId: 'test-1',
                testTitle: 'Standard Test',
                totalScaled: 1000,
            });
            expect(summary.sections).toEqual([
                { name: Section.READING_WRITING, scaled: 800 },
                { name: Section.MATH, scaled: 200 },
            ]);
        });
    });
});