import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PracticeTest } from '../practice-test/entities/practice-test.entity';
import { Domain, TestType } from '../practice-test/enums/practice-test.enums';
import { StudyPlanService } from '../study-plan/study-plan.service';
import { TestAttemptService } from '../test-attempt/test-attempt.service';

import { LessonsService } from './lessons.service';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';

type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (entity) => entity),
    delete: jest.fn(),
});

const buildLesson = (id: string, domain: Domain, position: number) => ({ id, domain, position });

const dateDaysFromNow = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

describe('LessonsService', () => {
    let service: LessonsService;
    let lessonRepository: MockRepository;
    let lessonProgressRepository: MockRepository;
    let practiceTestRepository: MockRepository;
    let testAttemptService: { getDomainAccuracy: jest.Mock; getCompletedTestIds: jest.Mock };
    let studyPlanService: { getOne: jest.Mock };

    beforeEach(async () => {
        lessonRepository = createMockRepository();
        lessonProgressRepository = createMockRepository();
        practiceTestRepository = createMockRepository();
        testAttemptService = {
            getDomainAccuracy: jest.fn().mockResolvedValue(null),
            getCompletedTestIds: jest.fn().mockResolvedValue(new Set()),
        };
        studyPlanService = { getOne: jest.fn().mockResolvedValue(null) };

        lessonProgressRepository.find!.mockResolvedValue([]);
        practiceTestRepository.find!.mockResolvedValue([]);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonsService,
                { provide: getRepositoryToken(Lesson), useValue: lessonRepository },
                { provide: getRepositoryToken(LessonProgress), useValue: lessonProgressRepository },
                { provide: getRepositoryToken(PracticeTest), useValue: practiceTestRepository },
                { provide: TestAttemptService, useValue: testAttemptService },
                { provide: StudyPlanService, useValue: studyPlanService },
            ],
        }).compile();

        service = module.get(LessonsService);
    });

    describe('getAll', () => {
        it('returns lessons ordered by position', async () => {
            lessonRepository.find!.mockResolvedValue([buildLesson('lesson-1', Domain.ALGEBRA, 1)]);

            const result = await service.getAll();

            expect(lessonRepository.find).toHaveBeenCalledWith({ order: { position: 'ASC' } });
            expect(result).toEqual([buildLesson('lesson-1', Domain.ALGEBRA, 1)]);
        });
    });

    describe('add', () => {
        it("positions the new lesson after the domain's existing lessons", async () => {
            lessonRepository.count!.mockResolvedValue(2);

            const lesson = await service.add(Domain.ALGEBRA, {
                title: 'Solving equations',
                videoUrl: 'https://www.youtube.com/watch',
            });

            expect(lessonRepository.count).toHaveBeenCalledWith({ where: { domain: Domain.ALGEBRA } });
            expect(lesson).toMatchObject({
                domain: Domain.ALGEBRA,
                position: 3,
                title: 'Solving equations',
                videoUrl: 'https://www.youtube.com/watch',
            });
        });
    });

    describe('update', () => {
        const buildExistingLesson = () => ({
            id: 'lesson-1',
            domain: Domain.ALGEBRA,
            position: 1,
            title: 'Original title',
            videoUrl: 'https://www.youtube.com/watch',
        });

        it('throws NotFoundException when the lesson does not exist', async () => {
            lessonRepository.findOne!.mockResolvedValue(null);

            await expect(service.update('missing-id', {})).rejects.toBeInstanceOf(NotFoundException);
        });

        it('only updates the fields provided in the DTO', async () => {
            lessonRepository.findOne!.mockResolvedValue(buildExistingLesson());

            const result = await service.update('lesson-1', { title: 'New title' });

            expect(result.title).toBe('New title');
            expect(result.videoUrl).toBe('https://www.youtube.com/watch');
        });

        it('updates the video url', async () => {
            lessonRepository.findOne!.mockResolvedValue(buildExistingLesson());

            const result = await service.update('lesson-1', { videoUrl: 'https://www.youtube.com/watch?v=new' });

            expect(result.title).toBe('Original title');
            expect(result.videoUrl).toBe('https://www.youtube.com/watch?v=new');
        });
    });

    describe('delete', () => {
        it('throws NotFoundException when the lesson does not exist', async () => {
            lessonRepository.findOne!.mockResolvedValue(null);

            await expect(service.delete('missing-id')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('deletes the lesson when it exists', async () => {
            lessonRepository.findOne!.mockResolvedValue({ id: 'lesson-1' });

            await service.delete('lesson-1');

            expect(lessonRepository.delete).toHaveBeenCalledWith('lesson-1');
        });
    });

    describe('completeLesson', () => {
        it('does nothing when the lesson is already marked watched', async () => {
            lessonProgressRepository.findOne!.mockResolvedValue({ id: 'progress-1' });

            await service.completeLesson('lesson-1', 'user-1');

            expect(lessonProgressRepository.create).not.toHaveBeenCalled();
            expect(lessonProgressRepository.save).not.toHaveBeenCalled();
        });

        it('records a new watched entry when none exists', async () => {
            lessonProgressRepository.findOne!.mockResolvedValue(null);

            await service.completeLesson('lesson-1', 'user-1');

            expect(lessonProgressRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'user-1', lessonId: 'lesson-1', watchedAt: expect.any(Date) }),
            );
        });
    });

    describe('getProgress', () => {
        it('sequences domains from weakest to strongest and unlocks only the first when there is no study plan', async () => {
            lessonRepository.find!.mockResolvedValue([
                buildLesson('lesson-algebra', Domain.ALGEBRA, 1),
                buildLesson('lesson-geometry', Domain.GEOMETRY_AND_TRIGONOMETRY, 1),
            ]);
            testAttemptService.getDomainAccuracy.mockResolvedValue(
                new Map([
                    [Domain.ALGEBRA, 0.9],
                    [Domain.GEOMETRY_AND_TRIGONOMETRY, 0.2],
                ]),
            );

            const result = await service.getProgress('user-1');

            expect(result.map((domainProgress) => domainProgress.domain)).toEqual([
                Domain.GEOMETRY_AND_TRIGONOMETRY,
                Domain.ALGEBRA,
            ]);
            expect(result[0]).toMatchObject({ status: 'current', isRecommended: true });
            expect(result[1]).toMatchObject({ status: 'locked', isRecommended: true });
        });

        it('treats domains without a diagnostic score as 0% accuracy when there is no study plan', async () => {
            lessonRepository.find!.mockResolvedValue([
                buildLesson('lesson-algebra', Domain.ALGEBRA, 1),
                buildLesson('lesson-geometry', Domain.GEOMETRY_AND_TRIGONOMETRY, 1),
                buildLesson('lesson-advanced-math', Domain.ADVANCED_MATH, 1),
                buildLesson('lesson-problem-solving', Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS, 1),
            ]);
            testAttemptService.getDomainAccuracy.mockResolvedValue(
                new Map([
                    [Domain.ALGEBRA, 0.5],
                    [Domain.ADVANCED_MATH, 0.9],
                ]),
            );

            const result = await service.getProgress('user-1');

            expect(result.map((domainProgress) => domainProgress.domain)).toEqual([
                Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
                Domain.GEOMETRY_AND_TRIGONOMETRY,
                Domain.ALGEBRA,
                Domain.ADVANCED_MATH,
            ]);
        });

        it('puts domains without a diagnostic score first and includes a domain that only has a check-in test', async () => {
            lessonRepository.find!.mockResolvedValue([
                buildLesson('lesson-algebra', Domain.ALGEBRA, 1),
                buildLesson('lesson-advanced-math', Domain.ADVANCED_MATH, 1),
                buildLesson('lesson-problem-solving', Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS, 1),
            ]);
            practiceTestRepository.find!.mockResolvedValue([
                { id: 'checkin-geometry', domain: Domain.GEOMETRY_AND_TRIGONOMETRY, type: TestType.CHECK_IN },
            ]);
            testAttemptService.getDomainAccuracy.mockResolvedValue(
                new Map([
                    [Domain.ALGEBRA, 0.5],
                    [Domain.ADVANCED_MATH, 0.9],
                ]),
            );
            studyPlanService.getOne.mockResolvedValue({
                goalScore: 1000,
                testDate: dateDaysFromNow(60),
                prepStartDate: dateDaysFromNow(-30),
            });

            const result = await service.getProgress('user-1');

            expect(result.map((domainProgress) => domainProgress.domain).slice(0, 2)).toEqual([
                Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
                Domain.GEOMETRY_AND_TRIGONOMETRY,
            ]);
            
            expect(result[1]).toMatchObject({
                domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
                lessons: [],
                checkInTestId: 'checkin-geometry',
                isRecommended: true,
            });
        });

        it('keeps a stretch domain locked until the recommended (in-budget) domains are complete', async () => {
            lessonRepository.find!.mockResolvedValue([
                buildLesson('lesson-algebra', Domain.ALGEBRA, 1),
                buildLesson('lesson-geometry', Domain.GEOMETRY_AND_TRIGONOMETRY, 1),
            ]);
            testAttemptService.getDomainAccuracy.mockResolvedValue(
                new Map([
                    [Domain.ALGEBRA, 0.2],
                    [Domain.GEOMETRY_AND_TRIGONOMETRY, 0.4],
                ]),
            );
            studyPlanService.getOne.mockResolvedValue({
                goalScore: 1000,
                testDate: dateDaysFromNow(1),
                prepStartDate: dateDaysFromNow(-30),
            });

            const result = await service.getProgress('user-1');

            expect(result.map((domainProgress) => domainProgress.domain)).toEqual([
                Domain.ALGEBRA,
                Domain.GEOMETRY_AND_TRIGONOMETRY,
            ]);
            expect(result[0]).toMatchObject({ status: 'current', isRecommended: true });
            expect(result[1]).toMatchObject({ status: 'locked', isRecommended: false });
        });

        it('unlocks the stretch domain once every recommended domain is complete', async () => {
            lessonRepository.find!.mockResolvedValue([
                buildLesson('lesson-algebra', Domain.ALGEBRA, 1),
                buildLesson('lesson-geometry', Domain.GEOMETRY_AND_TRIGONOMETRY, 1),
            ]);
            testAttemptService.getDomainAccuracy.mockResolvedValue(
                new Map([
                    [Domain.ALGEBRA, 0.2],
                    [Domain.GEOMETRY_AND_TRIGONOMETRY, 0.4],
                ]),
            );
            studyPlanService.getOne.mockResolvedValue({
                goalScore: 1000,
                testDate: dateDaysFromNow(1),
                prepStartDate: dateDaysFromNow(-30),
            });
            lessonProgressRepository.find!.mockResolvedValue([{ lessonId: 'lesson-algebra' }]);

            const result = await service.getProgress('user-1');

            expect(result[0]).toMatchObject({ domain: Domain.ALGEBRA, status: 'complete', isRecommended: true });
            expect(result[1]).toMatchObject({
                domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
                status: 'current',
                isRecommended: false,
            });
        });

        it("keeps a domain incomplete when its check-in test hasn't been passed, even with every lesson watched", async () => {
            lessonRepository.find!.mockResolvedValue([buildLesson('lesson-algebra', Domain.ALGEBRA, 1)]);
            lessonProgressRepository.find!.mockResolvedValue([{ lessonId: 'lesson-algebra' }]);
            practiceTestRepository.find!.mockResolvedValue([
                { id: 'checkin-algebra', domain: Domain.ALGEBRA, type: TestType.CHECK_IN },
            ]);
            testAttemptService.getCompletedTestIds.mockResolvedValue(new Set());

            const [domainProgress] = await service.getProgress('user-1');

            expect(domainProgress).toMatchObject({
                checkInTestId: 'checkin-algebra',
                isCheckInComplete: false,
                status: 'current',
            });
        });

        it('completes a domain once its check-in test is passed', async () => {
            lessonRepository.find!.mockResolvedValue([buildLesson('lesson-algebra', Domain.ALGEBRA, 1)]);
            lessonProgressRepository.find!.mockResolvedValue([{ lessonId: 'lesson-algebra' }]);
            practiceTestRepository.find!.mockResolvedValue([
                { id: 'checkin-algebra', domain: Domain.ALGEBRA, type: TestType.CHECK_IN },
            ]);
            testAttemptService.getCompletedTestIds.mockResolvedValue(new Set(['checkin-algebra']));

            const [domainProgress] = await service.getProgress('user-1');

            expect(domainProgress).toMatchObject({ isCheckInComplete: true, status: 'complete' });
        });
    });
});