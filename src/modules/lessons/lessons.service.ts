import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PracticeTest } from '../practice-test/entities/practice-test.entity';
import { Domain, TestType } from '../practice-test/enums/practice-test.enums';
import { TestAttemptService } from '../test-attempt/test-attempt.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';

type LessonProgressStatus = 'complete' | 'current' | 'locked';

interface LessonWithProgress extends Lesson {
    isWatched: boolean;
}

export interface DomainProgress {
    domain: Domain;
    status: LessonProgressStatus;
    lessons: LessonWithProgress[];
    checkInTestId: string | null;
    isCheckInComplete: boolean;
}

function getDomainStatus(isComplete: boolean, isUnlocked: boolean): LessonProgressStatus {
    if (isComplete) {
        return 'complete';
    }

    return isUnlocked ? 'current' : 'locked';
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

    // Personalized plan - targets weakest domains first
    async getProgress(userId: string): Promise<DomainProgress[]> {
        const lessons = await this.lessonRepository.find({ order: { position: 'ASC' } });
        const watchedLessonIds = await this.getWatchedLessonIds(userId);
        const accuracy = await this.testAttemptService.getDomainAccuracy(userId);

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

        const domainsInCourse = Object.values(Domain).filter((domain) =>
            lessons.some((lesson) => lesson.domain === domain) || checkInTestByDomain.has(domain),
        );

        const orderedDomains = accuracy
            ? [...domainsInCourse].sort((a, b) => (accuracy.get(a) ?? 0) - (accuracy.get(b) ?? 0))
            : domainsInCourse;

        let unlocked = true;

        return orderedDomains.map((domain) => {
            const domainLessons: LessonWithProgress[] = lessons
                .filter((lesson) => lesson.domain === domain)
                .map((lesson) => ({ ...lesson, isWatched: watchedLessonIds.has(lesson.id) }));

            const checkInTest = checkInTestByDomain.get(domain);
            const isCheckInComplete = !checkInTest || completedTestIds.has(checkInTest.id);
            const isComplete = domainLessons.every((lesson) => lesson.isWatched) && isCheckInComplete;
            const status = getDomainStatus(isComplete, unlocked);

            if (status === 'current') {
                unlocked = false;
            }

            return {
                domain,
                status,
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
