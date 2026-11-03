import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { StudyPlanController } from './study-plan.controller';
import { StudyPlanService } from './study-plan.service';

const request = {
    user: { userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT },
} as AuthenticatedRequest;

describe('StudyPlanController', () => {
    let controller: StudyPlanController;
    let studyPlanService: Record<'getTestDates' | 'getOne' | 'upsert', jest.Mock>;

    beforeEach(async () => {
        studyPlanService = {
            getTestDates: jest.fn().mockReturnValue('get-test-dates-result'),
            getOne: jest.fn().mockResolvedValue('get-one-result'),
            upsert: jest.fn().mockResolvedValue('upsert-result'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [StudyPlanController],
            providers: [{ provide: StudyPlanService, useValue: studyPlanService }],
        }).compile();

        controller = module.get(StudyPlanController);
    });

    describe('getTestDates', () => {
        it('returns the available test dates', () => {
            const result = controller.getTestDates();

            expect(studyPlanService.getTestDates).toHaveBeenCalled();
            expect(result).toBe('get-test-dates-result');
        });
    });

    describe('getOne', () => {
        it('returns the study plan of the authenticated user', async () => {
            const result = await controller.getOne(request);

            expect(studyPlanService.getOne).toHaveBeenCalledWith('user-1');
            expect(result).toBe('get-one-result');
        });
    });

    describe('upsert', () => {
        it('saves the study plan of the authenticated user', async () => {
            const dto = { goalScore: 1200, prepStartDate: '2026-09-01', testDate: '2026-12-05' };
            const result = await controller.upsert(dto, request);

            expect(studyPlanService.upsert).toHaveBeenCalledWith('user-1', dto);
            expect(result).toBe('upsert-result');
        });
    });

    describe('guards', () => {
        it('requires a valid token for every route', () => {
            expect(Reflect.getMetadata(GUARDS_METADATA, StudyPlanController)).toEqual([JwtAuthGuard]);
        });
    });
});