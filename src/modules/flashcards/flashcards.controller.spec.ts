import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../auth/entities/user.entity';
import { StudentGuard } from '../auth/guards/student.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { FlashcardRating } from './enums/flashcard-rating.enum';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';

const request = {
    user: { userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT },
} as AuthenticatedRequest;

describe('FlashcardsController', () => {
    let controller: FlashcardsController;
    let flashcardsService: Record<
        'getAll' | 'getSuggestedDefinition' | 'create' | 'review' | 'update' | 'delete',
        jest.Mock
    >;

    beforeEach(async () => {
        flashcardsService = {
            getAll: jest.fn().mockResolvedValue('get-all-result'),
            getSuggestedDefinition: jest.fn().mockResolvedValue('get-suggested-definition-result'),
            create: jest.fn().mockResolvedValue('create-result'),
            review: jest.fn().mockResolvedValue('review-result'),
            update: jest.fn().mockResolvedValue('update-result'),
            delete: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [FlashcardsController],
            providers: [{ provide: FlashcardsService, useValue: flashcardsService }],
        }).compile();

        controller = module.get(FlashcardsController);
    });

    describe('getAll', () => {
        it("returns authenticated user's flashcards", async () => {
            const result = await controller.getAll(request);

            expect(flashcardsService.getAll).toHaveBeenCalledWith('user-1');
            expect(result).toBe('get-all-result');
        });
    });

    describe('getSuggestedDefinition', () => {
        it('returns suggested definition for word', async () => {
            const result = await controller.getSuggestedDefinition('word');

            expect(flashcardsService.getSuggestedDefinition).toHaveBeenCalledWith('word');
            expect(result).toBe('get-suggested-definition-result');
        });
    });

    describe('create', () => {
        it('creates flashcard for authenticated user', async () => {
            const dto = { word: 'Word', definition: 'Definition' };
            const result = await controller.create(dto, request);

            expect(flashcardsService.create).toHaveBeenCalledWith('user-1', dto);
            expect(result).toBe('create-result');
        });
    });

    describe('review', () => {
        it('reviews flashcard for authenticated user', async () => {
            const dto = { rating: FlashcardRating.KNEW_IT };
            const result = await controller.review('flashcard-1', dto, request);

            expect(flashcardsService.review).toHaveBeenCalledWith('user-1', 'flashcard-1', dto);
            expect(result).toBe('review-result');
        });
    });

    describe('update', () => {
        it('updates flashcard for authenticated user', async () => {
            const dto = { definition: 'Definition' };
            const result = await controller.update('flashcard-1', dto, request);

            expect(flashcardsService.update).toHaveBeenCalledWith('user-1', 'flashcard-1', dto);
            expect(result).toBe('update-result');
        });
    });

    describe('delete', () => {
        it('deletes flashcard for authenticated user', async () => {
            await controller.delete('flashcard-1', request);

            expect(flashcardsService.delete).toHaveBeenCalledWith('user-1', 'flashcard-1');
        });
    });

    describe('guards', () => {
        it('requires student for every route', () => {
            expect(Reflect.getMetadata(GUARDS_METADATA, FlashcardsController)).toEqual([StudentGuard]);
        });
    });
});
