import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StudyPlanService } from './study-plan.service';
import { StudyPlan } from './entities/study-plan.entity';

type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (entity) => entity),
});

describe('StudyPlanService', () => {
    let service: StudyPlanService;
    let studyPlanRepository: MockRepository;

    beforeEach(async () => {
        studyPlanRepository = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [StudyPlanService, { provide: getRepositoryToken(StudyPlan), useValue: studyPlanRepository }],
        }).compile();

        service = module.get(StudyPlanService);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getTestDates', () => {
        it('excludes dates before today and keeps today and future dates', () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-09-12T12:00:00Z'));

            const result = service.getTestDates();

            expect(result).toEqual(['2026-09-12', '2026-10-03', '2026-11-07', '2026-12-05', '2027-03-06', '2027-05-01', '2027-06-05']);
        });
    });

    describe('getOne', () => {
        it('returns null when the user has no study plan', async () => {
            studyPlanRepository.findOne!.mockResolvedValue(null);

            const result = await service.getOne('user-1');

            expect(result).toBeNull();
        });

        it("returns the user's study plan", async () => {
            studyPlanRepository.findOne!.mockResolvedValue({
                userId: 'user-1',
                goalScore: 1400,
                prepStartDate: '2026-01-01',
                testDate: '2026-09-12',
            });

            const result = await service.getOne('user-1');

            expect(result).toEqual({ goalScore: 1400, prepStartDate: '2026-01-01', testDate: '2026-09-12' });
        });
    });

    describe('upsert', () => {
        it('creates a new study plan when none exists', async () => {
            studyPlanRepository.findOne!.mockResolvedValue(null);

            const result = await service.upsert('user-1', {
                goalScore: 1200,
                prepStartDate: '2026-01-01',
                testDate: '2026-09-12',
            });

            expect(studyPlanRepository.create).toHaveBeenCalledWith({ userId: 'user-1' });
            expect(studyPlanRepository.save).toHaveBeenCalled();
            expect(result).toEqual({ goalScore: 1200, prepStartDate: '2026-01-01', testDate: '2026-09-12' });
        });

        it('overwrites an existing study plan', async () => {
            studyPlanRepository.findOne!.mockResolvedValue({
                userId: 'user-1',
                goalScore: 1000,
                prepStartDate: '2025-06-01',
                testDate: '2026-08-22',
            });

            const result = await service.upsert('user-1', {
                goalScore: 1500,
                prepStartDate: '2026-01-01',
                testDate: '2026-12-05',
            });

            expect(studyPlanRepository.create).not.toHaveBeenCalled();
            expect(result).toEqual({ goalScore: 1500, prepStartDate: '2026-01-01', testDate: '2026-12-05' });
        });
    });
});