import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PracticeTest } from '../practice-test/entities/practice-test.entity';
import { Domain, TestType } from '../practice-test/enums/practice-test.enums';
import { StudyPlanService } from '../study-plan/study-plan.service';
import { TestAttemptService } from '../test-attempt/test-attempt.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import {
    computeDaysRemaining,
    computeTargetAccuracy,
    estimateDaysForDomain,
    pickRecommendedDomains,
} from './utils/sequencing';

type LessonProgressStatus = 'complete' | 'current' | 'locked';

interface LessonWithProgress extends Lesson {
    isWatched: boolean;
}

export interface DomainProgress {
    domain: Domain;
    status: LessonProgressStatus;
    isRecommended: boolean;
    lessons: LessonWithProgress[];
    checkInTestId: string | null;
    isCheckInComplete: boolean;
}

function getDomainStatus(
    isComplete: boolean,
    isRecommended: boolean,
    isUnlocked: boolean,
    allRecommendedComplete: boolean,
): LessonProgressStatus {
    if (isComplete) {
        return 'complete';
    }

    // Stretch (non-recommended) domains stay locked until the whole recommended plan is done
    const isOpen = isRecommended ? isUnlocked : allRecommendedComplete;

    return isOpen ? 'current' : 'locked';
}

@Injectable()
export class LessonsService {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        @InjectRepository(LessonProgress)
        private readonly lessonProgressRepository: Repository<LessonProgress>,
        @InjectRepository(PracticeTest)
        private readonly practiceTestRepository: Repository<PracticeTest>,
        private readonly testAttemptService: TestAttemptService,
        private readonly studyPlanService: StudyPlanService,
    ) { }

    async getAll(): Promise<Lesson[]> {
        return this.lessonRepository.find({ order: { position: 'ASC' } });
    }

    async add(domain: Domain, dto: CreateLessonDto): Promise<Lesson> {
        const lessonCount = await this.lessonRepository.count({ where: { domain } });

        const lesson = this.lessonRepository.create({
            domain,
            position: lessonCount + 1,
            title: dto.title,
            videoUrl: dto.videoUrl,
        });

        return this.lessonRepository.save(lesson);
    }

    async update(lessonId: string, dto: UpdateLessonDto): Promise<Lesson> {
        const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });

        if (!lesson) {
            throw new NotFoundException(`Lesson ${lessonId} not found.`);
        }

        if (dto.title !== undefined) {
            lesson.title = dto.title;
        }

        if (dto.videoUrl !== undefined) {
            lesson.videoUrl = dto.videoUrl;
        }

        return this.lessonRepository.save(lesson);
    }

    // Personalized plan - targets domains furthest from the student's goal first paced against how many days are left before their test.
    async getProgress(userId: string): Promise<DomainProgress[]> {
        const lessons = await this.lessonRepository.find({ order: { position: 'ASC' } });
        const watchedLessonIds = await this.getWatchedLessonIds(userId);
        const accuracy = await this.testAttemptService.getDomainAccuracy(userId);
        const studyPlan = await this.studyPlanService.getOne(userId);

        const checkInTests = await this.practiceTestRepository.find({ where: { type: TestType.CHECK_IN } });
        const checkInTestByDomain = new Map(
            checkInTests
                .filter((test): test is PracticeTest & { domain: Domain } => test.domain != null)
                .map((test) => [test.domain, test]),
        );

        const completedTestIds = await this.testAttemptService.getCompletedTestIds(
            userId,
            checkInTests.map((test) => test.id),
        );

        const lessonCountByDomain = new Map<Domain, number>();

        for (const lesson of lessons) {
            let currentLessonCount = lessonCountByDomain.get(lesson.domain) ?? 0;
            lessonCountByDomain.set(lesson.domain, currentLessonCount + 1);
        }

        const domainsInCourse = Object.values(Domain).filter((domain) =>
            lessons.some((lesson) => lesson.domain === domain) || checkInTestByDomain.has(domain),
        );

        const targetAccuracy = studyPlan ? computeTargetAccuracy(studyPlan.goalScore) : null;

        const orderedDomains = accuracy && targetAccuracy != null
            // Sequence by how far each domain is from what the student's goal actually needs -
            // a domain already past its target accuracy sorts after one that still falls short.
            ? [...domainsInCourse].sort((a, b) => {
                const gapA = targetAccuracy - (accuracy.get(a) ?? 0);
                const gapB = targetAccuracy - (accuracy.get(b) ?? 0);

                return gapB - gapA;
            })
            : accuracy
                ? [...domainsInCourse].sort((a, b) => (accuracy.get(a) ?? 0) - (accuracy.get(b) ?? 0))
                : domainsInCourse;

        const recommendedDomains = studyPlan
            ? pickRecommendedDomains(
                orderedDomains,
                (domain) => estimateDaysForDomain(lessonCountByDomain.get(domain) ?? 0, checkInTestByDomain.has(domain)),
                computeDaysRemaining(studyPlan.testDate),
                (domain) => !accuracy || targetAccuracy == null || (targetAccuracy - (accuracy.get(domain) ?? 0)) > 0,
            )
            : new Set(orderedDomains);

        // Precompute each domain's lessons/completion once, reused below to decide whether
        // the whole recommended plan is done (which unlocks the stretch domains).
        const lessonsByDomain = new Map<Domain, LessonWithProgress[]>();
        const isCompleteByDomain = new Map<Domain, boolean>();

        for (const domain of orderedDomains) {
            const domainLessons: LessonWithProgress[] = lessons
                .filter((lesson) => lesson.domain === domain)
                .map((lesson) => ({ ...lesson, isWatched: watchedLessonIds.has(lesson.id) }));

            const checkInTest = checkInTestByDomain.get(domain);
            const isCheckInComplete = !checkInTest || completedTestIds.has(checkInTest.id);

            lessonsByDomain.set(domain, domainLessons);
            isCompleteByDomain.set(domain, domainLessons.every((lesson) => lesson.isWatched) && isCheckInComplete);
        }

        const allRecommendedComplete = [...recommendedDomains].every((domain) => isCompleteByDomain.get(domain));

        let unlocked = true;

        return orderedDomains.map((domain) => {
            const domainLessons = lessonsByDomain.get(domain)!;
            const checkInTest = checkInTestByDomain.get(domain);
            const isCheckInComplete = !checkInTest || completedTestIds.has(checkInTest.id);
            const isComplete = isCompleteByDomain.get(domain)!;
            const isRecommended = recommendedDomains.has(domain);
            const status = getDomainStatus(isComplete, isRecommended, unlocked, allRecommendedComplete);

            if (isRecommended && status === 'current') {
                unlocked = false;
            }

            return {
                domain,
                status,
                isRecommended,
                lessons: domainLessons,
                checkInTestId: checkInTest?.id ?? null,
                isCheckInComplete,
            };
        });
    }

    async completeLesson(lessonId: string, userId: string): Promise<void> {
        const exisitngLesson = await this.lessonProgressRepository.findOne({ where: { userId, lessonId } });

        if (exisitngLesson) {
            return;
        }

        const progress = this.lessonProgressRepository.create({ userId, lessonId, watchedAt: new Date() });
        await this.lessonProgressRepository.save(progress);
    }

    private async getWatchedLessonIds(userId: string): Promise<Set<string>> {
        const progress = await this.lessonProgressRepository.find({ where: { userId } });
        return new Set(progress.map((entry) => entry.lessonId));
    }
}
