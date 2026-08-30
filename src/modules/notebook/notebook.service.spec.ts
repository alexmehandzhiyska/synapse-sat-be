import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from '../practice-test/entities/question.entity';
import { Domain } from '../practice-test/enums/practice-test.enums';

import { NotebookService } from './notebook.service';
import { NotebookEntry } from './entities/notebook-entry.entity';

type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (entity) => entity),
    delete: jest.fn(),
});

const buildQuestion = () => ({
    id: 'question-1',
    prompt: 'What is 2 + 2?',
    passage: null,
    domain: Domain.ALGEBRA,
    answerChoices: [
        { id: 'choice-b', label: 'B', content: 'Three', isCorrect: false },
        { id: 'choice-a', label: 'A', content: 'Four', isCorrect: true },
    ],
});

const buildEntry = () => ({
    id: 'entry-1',
    userId: 'user-1',
    questionId: 'question-1',
    what: 'What I got wrong',
    why: 'Why I got it wrong',
    how: 'How I will avoid it',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    question: buildQuestion(),
});

describe('NotebookService', () => {
    let service: NotebookService;
    let notebookRepository: MockRepository;
    let questionRepository: MockRepository;

    beforeEach(async () => {
        notebookRepository = createMockRepository();
        questionRepository = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotebookService,
                { provide: getRepositoryToken(NotebookEntry), useValue: notebookRepository },
                { provide: getRepositoryToken(Question), useValue: questionRepository },
            ],
        }).compile();

        service = module.get(NotebookService);
    });

    describe('getByUser', () => {
        it("returns the user's entries with answer choices sorted by label", async () => {
            notebookRepository.find!.mockResolvedValue([buildEntry()]);

            const [entry] = await service.getByUser('user-1');

            expect(notebookRepository.find).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                relations: { question: { answerChoices: true } },
                order: { createdAt: 'DESC' },
            });
            expect(entry.question.answerChoices.map((choice) => choice.label)).toEqual(['A', 'B']);
        });
    });

    describe('create', () => {
        it('throws NotFoundException when the question does not exist', async () => {
            questionRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.create('user-1', { questionId: 'question-1', what: 'w', why: 'w', how: 'h' }),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws ConflictException when the question is already in the notebook', async () => {
            questionRepository.findOne!.mockResolvedValue(buildQuestion());
            notebookRepository.findOne!.mockResolvedValue(buildEntry());

            await expect(
                service.create('user-1', { questionId: 'question-1', what: 'w', why: 'w', how: 'h' }),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        it('creates a new entry when the question exists and is not already saved', async () => {
            questionRepository.findOne!.mockResolvedValue(buildQuestion());
            notebookRepository.findOne!.mockResolvedValue(null);

            const entry = await service.create('user-1', {
                questionId: 'question-1',
                what: 'What I got wrong',
                why: 'Why I got it wrong',
                how: 'How I will avoid it',
            });

            expect(notebookRepository.save).toHaveBeenCalled();
            expect(entry).toMatchObject({
                questionId: 'question-1',
                what: 'What I got wrong',
                why: 'Why I got it wrong',
                how: 'How I will avoid it',
            });
        });
    });

    describe('update', () => {
        it('throws NotFoundException when the entry does not exist', async () => {
            notebookRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.update('user-1', 'missing-id', { what: 'w', why: 'w', how: 'h' }),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws NotFoundException when the entry belongs to another user', async () => {
            notebookRepository.findOne!.mockResolvedValue({ ...buildEntry(), userId: 'other-user' });

            await expect(
                service.update('user-1', 'entry-1', { what: 'w', why: 'w', how: 'h' }),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('updates the entry fields when owned by the user', async () => {
            notebookRepository.findOne!.mockResolvedValue(buildEntry());

            const result = await service.update('user-1', 'entry-1', {
                what: 'Updated what',
                why: 'Updated why',
                how: 'Updated how',
            });

            expect(result).toMatchObject({ what: 'Updated what', why: 'Updated why', how: 'Updated how' });
        });
    });

    describe('remove', () => {
        it('throws NotFoundException when the entry does not exist', async () => {
            notebookRepository.findOne!.mockResolvedValue(null);

            await expect(service.remove('user-1', 'missing-id')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws NotFoundException when the entry belongs to another user', async () => {
            notebookRepository.findOne!.mockResolvedValue({ ...buildEntry(), userId: 'other-user' });

            await expect(service.remove('user-1', 'entry-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('deletes the entry when owned by the user', async () => {
            notebookRepository.findOne!.mockResolvedValue(buildEntry());

            await service.remove('user-1', 'entry-1');

            expect(notebookRepository.delete).toHaveBeenCalledWith('entry-1');
        });
    });
});