import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Flashcard } from './entities/flashcard.entity';
import { FlashcardRating } from './enums/flashcard-rating.enum';
import { FlashcardsService, getNextIntervalDays } from './flashcards.service';

type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (entity) => entity),
    delete: jest.fn(),
});

const buildFlashcard = (overrides: Partial<Flashcard> = {}) => ({
    id: 'flashcard-1',
    userId: 'user-1',
    word: 'word',
    definition: 'Definition',
    context: null,
    questionId: null,
    intervalDays: 0,
    dueAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
});

const mockFetchResponse = (response: Partial<Response>) =>
    jest.spyOn(global, 'fetch').mockResolvedValue(response as Response);

describe('getNextIntervalDays', () => {
    it('returns 1 day when forgot', () => {
        expect(getNextIntervalDays(8, FlashcardRating.FORGOT)).toBe(1);
    });

    it('returns 1 day when new card is forgot', () => {
        expect(getNextIntervalDays(0, FlashcardRating.FORGOT)).toBe(1);
    });

    it('returns 3 days when new card is known', () => {
        expect(getNextIntervalDays(0, FlashcardRating.KNEW_IT)).toBe(3);
    });

    it('doubles interval when reviewed card is known', () => {
        expect(getNextIntervalDays(3, FlashcardRating.KNEW_IT)).toBe(6);
    });
});

describe('FlashcardsService', () => {
    let service: FlashcardsService;
    let flashcardRepository: MockRepository;

    beforeEach(async () => {
        flashcardRepository = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlashcardsService,
                { provide: getRepositoryToken(Flashcard), useValue: flashcardRepository },
            ],
        }).compile();

        service = module.get(FlashcardsService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    describe('getAll', () => {
        it("returns user's flashcards newest first", async () => {
            const flashcards = [buildFlashcard()];
            flashcardRepository.find!.mockResolvedValue(flashcards);

            const result = await service.getAll('user-1');

            expect(flashcardRepository.find).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                order: { createdAt: 'DESC' },
            });

            expect(result).toBe(flashcards);
        });
    });

    describe('create', () => {
        it('saves flashcard with trimmed lowercase word', async () => {
            flashcardRepository.findOne!.mockResolvedValue(null);

            await service.create('user-1', {
                word: '  Word  ',
                definition: 'Definition',
                context: 'Context',
                questionId: 'question-1',
            });

            expect(flashcardRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1', word: 'word' } });
            expect(flashcardRepository.save).toHaveBeenCalledWith({
                userId: 'user-1',
                word: 'word',
                definition: 'Definition',
                context: 'Context',
                questionId: 'question-1',
            });
        });

        it('defaults context and question id to null', async () => {
            flashcardRepository.findOne!.mockResolvedValue(null);

            await service.create('user-1', { word: 'Word', definition: 'Definition' });

            expect(flashcardRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ context: null, questionId: null }),
            );
        });

        it('throws ConflictException for duplicate word', async () => {
            flashcardRepository.findOne!.mockResolvedValue(buildFlashcard());

            await expect(
                service.create('user-1', { word: 'WORD', definition: 'Definition' }),
            ).rejects.toBeInstanceOf(ConflictException);

            expect(flashcardRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('updates definition', async () => {
            flashcardRepository.findOne!.mockResolvedValue(buildFlashcard());

            const result = await service.update('user-1', 'flashcard-1', { definition: 'New definition' });

            expect(flashcardRepository.findOne).toHaveBeenCalledWith({ where: { id: 'flashcard-1', userId: 'user-1' } });
            expect(result.definition).toBe('New definition');
        });

        it('throws NotFoundException when flashcard is not owned', async () => {
            flashcardRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.update('user-1', 'flashcard-1', { definition: 'New definition' }),
            ).rejects.toBeInstanceOf(NotFoundException);

            expect(flashcardRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('deletes owned flashcard', async () => {
            flashcardRepository.delete!.mockResolvedValue({ affected: 1 });

            await service.delete('user-1', 'flashcard-1');

            expect(flashcardRepository.delete).toHaveBeenCalledWith({ id: 'flashcard-1', userId: 'user-1' });
        });

        it('throws NotFoundException when nothing is deleted', async () => {
            flashcardRepository.delete!.mockResolvedValue({ affected: 0 });

            await expect(service.delete('user-1', 'flashcard-1')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('review', () => {
        beforeEach(() => {
            jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
        });

        it('schedules new known card 3 days out', async () => {
            flashcardRepository.findOne!.mockResolvedValue(buildFlashcard());

            const result = await service.review('user-1', 'flashcard-1', { rating: FlashcardRating.KNEW_IT });

            expect(result).toMatchObject({ intervalDays: 3, dueAt: new Date('2026-01-04T00:00:00.000Z') });
            expect(flashcardRepository.save).toHaveBeenCalledWith(result);
        });

        it('schedules forgotten card 1 day out', async () => {
            flashcardRepository.findOne!.mockResolvedValue(buildFlashcard({ intervalDays: 6 }));

            const result = await service.review('user-1', 'flashcard-1', { rating: FlashcardRating.FORGOT });

            expect(result).toMatchObject({ intervalDays: 1, dueAt: new Date('2026-01-02T00:00:00.000Z') });
        });

        it('throws NotFoundException when flashcard is not owned', async () => {
            flashcardRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.review('user-1', 'flashcard-1', { rating: FlashcardRating.KNEW_IT }),
            ).rejects.toBeInstanceOf(NotFoundException);
            
            expect(flashcardRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getSuggestedDefinition', () => {
        it('returns first definition from dictionary', async () => {
            const fetchSpy = mockFetchResponse({
                ok: true,
                json: async () => [
                    { meanings: [{ definitions: [{ definition: 'Definition' }, { definition: 'Other' }] }] },
                ],
            });

            const result = await service.getSuggestedDefinition('  Word  ');

            expect(fetchSpy).toHaveBeenCalledWith('https://api.dictionaryapi.dev/api/v2/entries/en/word');
            expect(result).toEqual({ definition: 'Definition' });
        });

        it('encodes word in url', async () => {
            const fetchSpy = mockFetchResponse({ ok: true, json: async () => [] });

            await service.getSuggestedDefinition('a/b');

            expect(fetchSpy).toHaveBeenCalledWith('https://api.dictionaryapi.dev/api/v2/entries/en/a%2Fb');
        });

        it('returns null when word is not found', async () => {
            mockFetchResponse({ ok: false });

            await expect(service.getSuggestedDefinition('word')).resolves.toEqual({ definition: null });
        });

        it('returns null when response has no definitions', async () => {
            mockFetchResponse({ ok: true, json: async () => [{ meanings: [] }] });

            await expect(service.getSuggestedDefinition('word')).resolves.toEqual({ definition: null });
        });

        it('returns null when request fails', async () => {
            jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

            await expect(service.getSuggestedDefinition('word')).resolves.toEqual({ definition: null });
        });
    });
});
