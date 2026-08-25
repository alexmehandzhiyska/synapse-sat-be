import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';

import { PracticeTest } from '../practice-test/entities/practice-test.entity';
import { Domain, TestType } from '../practice-test/enums/practice-test.enums';

import { UpsertAnswerDto } from './dto/upsert-answer.dto';
import { TestAttempt } from './entities/test-attempt.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { buildScoreDistribution, ScoreDistribution } from './utils/score-distribution';
import { buildScoreReport, ScoreReport } from './utils/score-test';

@Injectable()
export class TestAttemptService {
    constructor(
        @InjectRepository(TestAttempt)
        private readonly testAttemptRepository: Repository<TestAttempt>,

        @InjectRepository(UserAnswer)
        private readonly userAnswerRepository: Repository<UserAnswer>,

        @InjectRepository(PracticeTest)
        private readonly practiceTestRepository: Repository<PracticeTest>,
    ) { }

    async getOne(attemptId: string, userId: string) {
        const testAttempt = await this.getOwnedAttemptOrThrow(attemptId, userId);
        return this.toAttemptResponse(testAttempt);
    }

    async getAllCompleted(userId: string) {
        // Custom packets are excluded from progress tracking and charts
        const completedTests = await this.testAttemptRepository.find({
            where: { userId, completedAt: Not(IsNull()), test: { type: Not(TestType.CUSTOM) } },
            relations: { test: true, answers: true },
            order: { completedAt: 'DESC' },
        });

        return Promise.all(
            completedTests.map(async (testAttempt) => {
                const test = await this.practiceTestRepository.findOneOrFail({
                    where: { id: testAttempt.testId },
                    relations: { sections: { modules: { questions: { answerChoices: true } } } },
                });

                const scoreReport = buildScoreReport(testAttempt.id, test, testAttempt.answers);

                return {
                    id: testAttempt.id,
                    testId: testAttempt.testId,
                    testTitle: testAttempt.test.title,
                    completedAt: testAttempt.completedAt,
                    totalScaled: scoreReport.totalScaled,
                    sections: scoreReport.sections.map((section) => ({
                        name: section.name,
                        scaled: section.scaled,
                    })),
                };
            }),
        );
    }

    async startOrResume(testId: string, userId: string) {
        const test = await this.practiceTestRepository.findOne({ where: { id: testId } });

        if (!test) {
            throw new NotFoundException(`Practice test ${testId} not found.`);
        }

        await this.testAttemptRepository
            .createQueryBuilder()
            .insert()
            .into(TestAttempt)
            .values({ userId, testId, startedAt: new Date() })
            .orIgnore()
            .execute();

        const activeAttempt = await this.testAttemptRepository.findOneOrFail({
            where: { userId, testId, completedAt: IsNull() },
            relations: { answers: true },
        });

        return this.toAttemptResponse(activeAttempt);
    }

    async upsertAnswer(
        attemptId: string,
        questionId: string,
        dto: UpsertAnswerDto,
        userId: string,
    ): Promise<void> {
        const testAttempt = await this.getOwnedAttemptOrThrow(attemptId, userId);

        let answer = await this.userAnswerRepository.findOne({
            where: { testAttemptId: attemptId, questionId },
        });

        if (!answer) {
            answer = this.userAnswerRepository.create({
                testAttemptId: testAttempt.id,
                questionId,
            });
        }

        answer.selectedChoiceId = dto.selectedChoiceId ?? null;

        if (answer.selectedChoiceId) {
            answer.answeredAt = new Date();
        }

        await this.userAnswerRepository.save(answer);
    }

    async advanceModule(attemptId: string, userId: string) {
        const testAttempt = await this.getOwnedAttemptOrThrow(attemptId, userId);

        testAttempt.currentModuleIndex += 1;
        await this.testAttemptRepository.save(testAttempt);

        return this.toAttemptResponse(testAttempt);
    }

    async submit(attemptId: string, userId: string) {
        const testAttempt = await this.getOwnedAttemptOrThrow(attemptId, userId);

        if (!testAttempt.completedAt) {
            testAttempt.completedAt = new Date();
            await this.testAttemptRepository.save(testAttempt);
        }

        return this.toAttemptResponse(testAttempt);
    }

    async getScore(attemptId: string, userId: string): Promise<ScoreReport> {
        const testAttempt = await this.getOwnedAttemptOrThrow(attemptId, userId);

        const test = await this.practiceTestRepository.findOneOrFail({
            where: { id: testAttempt.testId },
            relations: { sections: { modules: { questions: { answerChoices: true } } } },
        });

        return buildScoreReport(testAttempt.id, test, testAttempt.answers);
    }

    async getScoreDistribution(attemptId: string, userId: string): Promise<ScoreDistribution> {
        const testAttempt = await this.getOwnedAttemptOrThrow(attemptId, userId);

        const test = await this.practiceTestRepository.findOneOrFail({
            where: { id: testAttempt.testId },
            relations: { sections: { modules: { questions: { answerChoices: true } } } },
        });

        const completedAttempts = await this.testAttemptRepository.find({
            where: { testId: testAttempt.testId, completedAt: Not(IsNull()) },
            relations: { answers: true },
        });

        const scores = completedAttempts.map(
            (attempt) => buildScoreReport(attempt.id, test, attempt.answers).totalScaled,
        );

        const userScore = buildScoreReport(testAttempt.id, test, testAttempt.answers).totalScaled;

        return buildScoreDistribution(scores, userScore);
    }

    // Domain accuracy from completed diagnostic, used to sequence lessons from weakest domain first.
    async getDomainAccuracy(userId: string): Promise<Map<Domain, number> | null> {
        const attempt = await this.testAttemptRepository.findOne({
            where: { userId, completedAt: Not(IsNull()), test: { type: TestType.DIAGNOSTIC } },
            relations: { test: true, answers: true },
            order: { completedAt: 'DESC' },
        });

        if (!attempt) {
            return null;
        }

        const test = await this.practiceTestRepository.findOneOrFail({
            where: { id: attempt.testId },
            relations: { sections: { modules: { questions: { answerChoices: true } } } },
        });

        const scoreReport = buildScoreReport(attempt.id, test, attempt.answers);
        const accuracy = new Map<Domain, number>();

        for (const section of scoreReport.sections) {
            for (const domainScore of section.domains) {
                accuracy.set(domainScore.domain, domainScore.total === 0 ? 0 : domainScore.correct / domainScore.total);
            }
        }

        return accuracy;
    }

    async getCompletedTestIds(userId: string, testIds: string[]): Promise<Set<string>> {
        if (testIds.length === 0) {
            return new Set();
        }

        const attempts = await this.testAttemptRepository.find({
            where: { userId, testId: In(testIds), completedAt: Not(IsNull()) },
        });

        return new Set(attempts.map((attempt) => attempt.testId));
    }

    private async getOwnedAttemptOrThrow(attemptId: string, userId: string): Promise<TestAttempt> {
        const testAttempt = await this.testAttemptRepository.findOne({
            where: { id: attemptId },
            relations: { answers: true },
        });

        if (!testAttempt || testAttempt.userId !== userId) {
            throw new NotFoundException(`Test attempt ${attemptId} not found.`);
        }

        return testAttempt;
    }

    private toAttemptResponse(testAttempt: TestAttempt) {
        return {
            id: testAttempt.id,
            testId: testAttempt.testId,
            status: testAttempt.completedAt ? 'completed' : 'in_progress',
            currentModuleIndex: testAttempt.currentModuleIndex,
            answers: testAttempt.answers.map((answer) => ({
                questionId: answer.questionId,
                selectedChoiceId: answer.selectedChoiceId,
            })),
        };
    }
}