import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Domain } from '../practice-test/enums/practice-test.enums';
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

        const domainsWithLessons = Object.values(Domain).filter((domain) =>
            lessons.some((lesson) => lesson.domain === domain),
        );

        const orderedDomains = accuracy
            ? [...domainsWithLessons].sort((a, b) => (accuracy.get(a) ?? 0) - (accuracy.get(b) ?? 0))
            : domainsWithLessons;

        let unlocked = true;

        return orderedDomains.map((domain) => {
            const domainLessons: LessonWithProgress[] = lessons
                .filter((lesson) => lesson.domain === domain)
                .map((lesson) => ({ ...lesson, isWatched: watchedLessonIds.has(lesson.id) }));

            const isComplete = domainLessons.every((lesson) => lesson.isWatched);
            const status = getDomainStatus(isComplete, unlocked);

            if (status === 'current') {
                unlocked = false;
            }

            return { domain, status, lessons: domainLessons };
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