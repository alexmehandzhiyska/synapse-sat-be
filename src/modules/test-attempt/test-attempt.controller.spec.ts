import { GUARDS_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { TestAttemptController } from './test-attempt.controller';
import { TestAttemptService } from './test-attempt.service';

const request = {
    user: { userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT },
} as AuthenticatedRequest;

describe('TestAttemptController', () => {
    let controller: TestAttemptController;
    let testAttemptService: Record<
        'getAllCompleted'
        | 'getOne'
        | 'getScore'
        | 'getScoreDistribution'
        | 'startOrResume'
        | 'upsertAnswer'
        | 'advanceModule'
        | 'submit',
        jest.Mock
    >;

    beforeEach(async () => {
        testAttemptService = {
            getAllCompleted: jest.fn().mockResolvedValue('get-all-completed-result'),
            getOne: jest.fn().mockResolvedValue('get-one-result'),
            getScore: jest.fn().mockResolvedValue('get-score-result'),
            getScoreDistribution: jest.fn().mockResolvedValue('get-score-distribution-result'),
            startOrResume: jest.fn().mockResolvedValue('start-or-resume-result'),
            upsertAnswer: jest.fn().mockResolvedValue(undefined),
            advanceModule: jest.fn().mockResolvedValue('advance-module-result'),
            submit: jest.fn().mockResolvedValue('submit-result'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TestAttemptController],
            providers: [{ provide: TestAttemptService, useValue: testAttemptService }],
        }).compile();

        controller = module.get(TestAttemptController);
    });

    describe('getAllCompleted', () => {
        it('returns the completed attempts of the authenticated user', async () => {
            const result = await controller.getAllCompleted(request);

            expect(testAttemptService.getAllCompleted).toHaveBeenCalledWith('user-1');
            expect(result).toBe('get-all-completed-result');
        });
    });

    describe('getOne', () => {
        it('returns the attempt of the authenticated user', async () => {
            const result = await controller.getOne('attempt-1', request);

            expect(testAttemptService.getOne).toHaveBeenCalledWith('attempt-1', 'user-1');
            expect(result).toBe('get-one-result');
        });
    });

    describe('getScore', () => {
        it('returns the score of the attempt', async () => {
            const result = await controller.getScore('attempt-1', request);

            expect(testAttemptService.getScore).toHaveBeenCalledWith('attempt-1', 'user-1');
            expect(result).toBe('get-score-result');
        });
    });

    describe('getScoreDistribution', () => {
        it('returns the score distribution of the attempt', async () => {
            const result = await controller.getScoreDistribution('attempt-1', request);

            expect(testAttemptService.getScoreDistribution).toHaveBeenCalledWith('attempt-1', 'user-1');
            expect(result).toBe('get-score-distribution-result');
        });
    });

    describe('startOrResume', () => {
        it('starts or resumes the given test for the authenticated user', async () => {
            const result = await controller.startOrResume({ testId: 'test-1' }, request);

            expect(testAttemptService.startOrResume).toHaveBeenCalledWith('test-1', 'user-1');
            expect(result).toBe('start-or-resume-result');
        });
    });

    describe('upsertAnswer', () => {
        it('saves the answer for the given question', async () => {
            const dto = { selectedChoiceId: 'choice-a' };
            await controller.upsertAnswer('attempt-1', 'question-1', dto, request);

            expect(testAttemptService.upsertAnswer).toHaveBeenCalledWith('attempt-1', 'question-1', dto, 'user-1');
        });

        it('responds with 204 No Content', () => {
            expect(Reflect.getMetadata(HTTP_CODE_METADATA, TestAttemptController.prototype.upsertAnswer)).toBe(204);
        });
    });

    describe('advanceModule', () => {
        it('advances the attempt to the next module', async () => {
            const result = await controller.advanceModule('attempt-1', request);

            expect(testAttemptService.advanceModule).toHaveBeenCalledWith('attempt-1', 'user-1');
            expect(result).toBe('advance-module-result');
        });
    });

    describe('submit', () => {
        it('submits the attempt', async () => {
            const result = await controller.submit('attempt-1', request);

            expect(testAttemptService.submit).toHaveBeenCalledWith('attempt-1', 'user-1');
            expect(result).toBe('submit-result');
        });
    });

    describe('guards', () => {
        it('requires a valid token for every route', () => {
            expect(Reflect.getMetadata(GUARDS_METADATA, TestAttemptController)).toEqual([JwtAuthGuard]);
        });
    });
});