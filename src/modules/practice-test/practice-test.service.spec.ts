import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PracticeTestService } from './practice-test.service';
import { PracticeTest } from './entities/practice-test.entity';
import { Module as PracticeTestModule } from './entities/module.entity';
import { Question } from './entities/question.entity';
import { AnswerChoice } from './entities/answer-choice.entity';
import { UserAnswer } from '../test-attempt/entities/user-answer.entity';
import { Difficulty, Domain, Section, TestType } from './enums/practice-test.enums';

type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (entity) => entity),
    count: jest.fn(),
    delete: jest.fn(),
});

describe('PracticeTestService', () => {
    let service: PracticeTestService;
    let practiceTestRepository: MockRepository;
    let moduleRepository: MockRepository;
    let questionRepository: MockRepository;
    let answerChoiceRepository: MockRepository;

    beforeEach(async () => {
        practiceTestRepository = createMockRepository();
        moduleRepository = createMockRepository();
        questionRepository = createMockRepository();
        answerChoiceRepository = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PracticeTestService,
                { provide: getRepositoryToken(PracticeTest), useValue: practiceTestRepository },
                { provide: getRepositoryToken(PracticeTestModule), useValue: moduleRepository },
                { provide: getRepositoryToken(Question), useValue: questionRepository },
                { provide: getRepositoryToken(AnswerChoice), useValue: answerChoiceRepository },
                { provide: getRepositoryToken(UserAnswer), useValue: createMockRepository() },
            ],
        }).compile();

        service = module.get(PracticeTestService);
    });

    describe('create', () => {
        it('throws BadRequestException for a check-in test with no domain', async () => {
            await expect(
                service.create({ title: 'Check-in', type: TestType.CHECK_IN } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('throws BadRequestException when a check-in test for the domain already exists', async () => {
            practiceTestRepository.findOne!.mockResolvedValue({ id: 'existing-test' });

            await expect(
                service.create({
                    title: 'Check-in',
                    type: TestType.CHECK_IN,
                    domain: Domain.ALGEBRA,
                } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('creates a check-in test scoped to a single domain section', async () => {
            practiceTestRepository.findOne!.mockResolvedValue(null);

            await service.create({
                title: 'Algebra Check-in',
                type: TestType.CHECK_IN,
                domain: Domain.ALGEBRA,
            } as any);

            const createdArg = practiceTestRepository.create!.mock.calls[0][0];
            expect(createdArg.domain).toBe(Domain.ALGEBRA);
            expect(createdArg.sections).toEqual([{ name: Section.MATH, modules: [{ position: 1 }] }]);
        });

        it('creates a standard test with both sections and two modules each', async () => {
            await service.create({ title: 'Standard Test', type: TestType.STANDARD } as any);

            const createdArg = practiceTestRepository.create!.mock.calls[0][0];
            expect(createdArg.domain).toBeNull();
            expect(createdArg.sections).toEqual([
                { name: Section.READING_WRITING, modules: [{ position: 1 }, { position: 2 }] },
                { name: Section.MATH, modules: [{ position: 1 }, { position: 2 }] },
            ]);
        });
    });

    describe('findAll', () => {
        it('sorts each test\'s sections with reading/writing before math', async () => {
            practiceTestRepository.find!.mockResolvedValue([
                { id: 'test-1', sections: [{ name: Section.MATH }, { name: Section.READING_WRITING }] },
            ]);

            const [test] = await service.findAll();

            expect(test.sections.map((section) => section.name)).toEqual([
                Section.READING_WRITING,
                Section.MATH,
            ]);
        });
    });

    describe('findDiagnostic', () => {
        it('throws NotFoundException when no diagnostic test exists', async () => {
            practiceTestRepository.findOne!.mockResolvedValue(null);

            await expect(service.findDiagnostic()).rejects.toBeInstanceOf(NotFoundException);
        });

        it('returns the diagnostic test when one exists', async () => {
            const test = { id: 'diagnostic-1' };
            practiceTestRepository.findOne!.mockResolvedValue(test);

            await expect(service.findDiagnostic()).resolves.toBe(test);
        });
    });

    describe('findOne', () => {
        const buildFullTest = () => ({
            id: 'test-1',
            title: 'Standard Test',
            type: TestType.STANDARD,
            domain: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            sections: [
                {
                    id: 'section-math',
                    name: Section.MATH,
                    directions: null,
                    modules: [],
                },
                {
                    id: 'section-rw',
                    name: Section.READING_WRITING,
                    directions: null,
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
                                    passage: null,
                                    prompt: 'Pick the answer.',
                                    answerChoices: [
                                        { id: 'choice-a', label: 'A', content: 'Correct', isCorrect: true },
                                        { id: 'choice-b', label: 'B', content: 'Wrong', isCorrect: false },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        it('throws NotFoundException when the test does not exist', async () => {
            practiceTestRepository.findOne!.mockResolvedValue(null);

            await expect(service.findOne('missing-id', false)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('hides answer correctness from students', async () => {
            practiceTestRepository.findOne!.mockResolvedValue(buildFullTest());

            const result = await service.findOne('test-1', false);

            const [choice] = result.sections[0].modules[0].questions[0].answerChoices;
            expect(choice).not.toHaveProperty('isCorrect');
        });

        it('exposes answer correctness to teachers and sorts sections', async () => {
            practiceTestRepository.findOne!.mockResolvedValue(buildFullTest());

            const result = await service.findOne('test-1', true);

            expect(result.sections.map((section) => section.name)).toEqual([
                Section.READING_WRITING,
                Section.MATH,
            ]);
            const [choice] = result.sections[0].modules[0].questions[0].answerChoices;
            expect(choice).toMatchObject({ isCorrect: true });
        });
    });

    describe('createQuestion', () => {
        it('throws NotFoundException when the module does not exist', async () => {
            moduleRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.createQuestion('missing-module', {
                    domain: Domain.ALGEBRA,
                    prompt: 'What is 2 + 2?',
                    answerChoices: [],
                } as any),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('positions the question after the existing ones and copies the module\'s section', async () => {
            moduleRepository.findOne!.mockResolvedValue({ id: 'module-1', section: { name: Section.MATH } });
            questionRepository.count!.mockResolvedValue(2);

            const question = await service.createQuestion('module-1', {
                domain: Domain.ALGEBRA,
                prompt: 'What is 2 + 2?',
                answerChoices: [{ label: 'A', content: '4', isCorrect: true }],
            } as any);

            expect(question).toMatchObject({
                moduleId: 'module-1',
                section: Section.MATH,
                position: 3,
                prompt: 'What is 2 + 2?',
            });
        });

        it('does not set a difficulty when the DTO omits it', async () => {
            moduleRepository.findOne!.mockResolvedValue({ id: 'module-1', section: { name: Section.MATH } });
            questionRepository.count!.mockResolvedValue(0);

            const question = await service.createQuestion('module-1', {
                domain: Domain.ALGEBRA,
                prompt: 'What is 2 + 2?',
                answerChoices: [],
            } as any);

            expect(question).not.toHaveProperty('difficulty');
        });

        it('sets the provided difficulty', async () => {
            moduleRepository.findOne!.mockResolvedValue({ id: 'module-1', section: { name: Section.MATH } });
            questionRepository.count!.mockResolvedValue(0);

            const question = await service.createQuestion('module-1', {
                domain: Domain.ALGEBRA,
                prompt: 'What is 2 + 2?',
                difficulty: Difficulty.HARD,
                answerChoices: [],
            } as any);

            expect(question.difficulty).toBe(Difficulty.HARD);
        });
    });

    describe('updateQuestion', () => {
        const buildQuestion = () => ({
            id: 'question-1',
            domain: Domain.ALGEBRA,
            difficulty: Difficulty.EASY,
            passage: 'Original passage',
            prompt: 'Original prompt',
            answerChoices: [
                { id: 'choice-a', label: 'A', content: 'Old A', isCorrect: false },
                { id: 'choice-b', label: 'B', content: 'Old B', isCorrect: true },
            ],
        });

        it('throws NotFoundException when the question does not exist', async () => {
            questionRepository.findOne!.mockResolvedValue(null);

            await expect(service.updateQuestion('missing-id', {})).rejects.toBeInstanceOf(NotFoundException);
        });

        it('only updates the fields provided in the DTO', async () => {
            questionRepository.findOne!.mockResolvedValue(buildQuestion());

            const result = await service.updateQuestion('question-1', { prompt: 'New prompt' });

            expect(result.prompt).toBe('New prompt');
            expect(result.domain).toBe(Domain.ALGEBRA);
            expect(result.passage).toBe('Original passage');
        });

        it('converts an empty passage to null', async () => {
            questionRepository.findOne!.mockResolvedValue(buildQuestion());

            const result = await service.updateQuestion('question-1', { passage: '' });

            expect(result.passage).toBeNull();
        });

        it('updates matching answer choices and re-sorts them by label', async () => {
            questionRepository.findOne!.mockResolvedValue(buildQuestion());

            const result = await service.updateQuestion('question-1', {
                answerChoices: [
                    { id: 'choice-b', content: 'New B', isCorrect: false },
                    { id: 'choice-a', content: 'New A', isCorrect: true },
                ],
            } as any);

            expect(result.answerChoices.map((choice) => choice.label)).toEqual(['A', 'B']);
            expect(result.answerChoices[0]).toMatchObject({ content: 'New A', isCorrect: true });
            expect(result.answerChoices[1]).toMatchObject({ content: 'New B', isCorrect: false });
        });
    });

    describe('remove', () => {
        it('throws NotFoundException when the test does not exist', async () => {
            practiceTestRepository.findOne!.mockResolvedValue(null);

            await expect(service.remove('missing-id')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('deletes the test when it exists', async () => {
            practiceTestRepository.findOne!.mockResolvedValue({ id: 'test-1' });

            await service.remove('test-1');

            expect(practiceTestRepository.delete).toHaveBeenCalledWith('test-1');
        });
    });
});