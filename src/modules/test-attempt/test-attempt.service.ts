import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { PracticeTest } from '../practice-test/entities/practice-test.entity';

import { UpsertAnswerDto } from './dto/upsert-answer.dto';
import { TestAttempt } from './entities/test-attempt.entity';
import { UserAnswer } from './entities/user-answer.entity';

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

    async startOrResume(testId: string, userId: string) {
        const existingAttempt = await this.testAttemptRepository.findOne({
            where: { userId, testId, completedAt: IsNull() },
            order: { startedAt: 'DESC' },
        });

        // If attempt is present, return it (resume test)
        if (existingAttempt) {
            return this.getOne(existingAttempt.id, userId);
        }

        // If attempt is present, find test and start it
        const test = await this.practiceTestRepository.findOne({ where: { id: testId } });

        if (!test) {
            throw new NotFoundException(`Practice test ${testId} not found.`);
        }

        const testAttempt = await this.testAttemptRepository.save(
            this.testAttemptRepository.create({
                userId,
                testId,
                startedAt: new Date(),
                completedAt: null,
            }),
        );

        return this.getOne(testAttempt.id, userId);
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

    async submit(attemptId: string, userId: string) {
        const testAttempt = await this.getOwnedAttemptOrThrow(attemptId, userId);

        if (!testAttempt.completedAt) {
            testAttempt.completedAt = new Date();
            await this.testAttemptRepository.save(testAttempt);
        }

        return this.toAttemptResponse(testAttempt);
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
            answers: testAttempt.answers.map((answer) => ({
                questionId: answer.questionId,
                selectedChoiceId: answer.selectedChoiceId,
            })),
        };
    }
}