import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { UserAnswer } from '../test-attempt/entities/user-answer.entity';
import { SECTION_ORDER } from './constants/practice-test.constants';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GenerateCustomPacketDto } from './dto/generate-custom-packet.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AnswerChoice } from './entities/answer-choice.entity';
import { Module } from './entities/module.entity';
import { PracticeTest } from './entities/practice-test.entity';
import { Question } from './entities/question.entity';
import { Section } from './entities/section.entity';
import { QuestionStatusFilter, Section as SectionName, TestType } from './enums/practice-test.enums';
import { toFullPracticeTestResponse } from './mappers/practice-test.mapper';
import { shuffle } from './utils/shuffle';

@Injectable()
export class PracticeTestService {
    constructor(
        @InjectRepository(PracticeTest)
        private readonly practiceTestRepository: Repository<PracticeTest>,
        @InjectRepository(Module)
        private readonly moduleRepository: Repository<Module>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(AnswerChoice)
        private readonly answerChoiceRepository: Repository<AnswerChoice>,
        @InjectRepository(UserAnswer)
        private readonly userAnswerRepository: Repository<UserAnswer>,
    ) { }

    create(createPracticeTestDto: CreatePracticeTestDto): Promise<PracticeTest> {
        const test = this.practiceTestRepository.create({
            title: createPracticeTestDto.title,
            type: createPracticeTestDto.type,
            sections: Object.values(SectionName).map((name) => ({
                name,
                modules: [{ position: 1 }, { position: 2 }],
            })),
        });

        return this.practiceTestRepository.save(test);
    }

    async generateCustomPacket(userId: string, dto: GenerateCustomPacketDto): Promise<PracticeTest> {
        // Excluding TestType.CUSTOM keeps previously-generated packets' cloned questions from becoming source material for later packets
        const candidatesQuery = this.questionRepository
            .createQueryBuilder('question')
            .leftJoinAndSelect('question.answerChoices', 'answerChoices')
            .innerJoin('question.module', 'module')
            .innerJoin('module.section', 'section')
            .innerJoin('section.test', 'test')
            .where('question.section = :section', { section: dto.section })
            .andWhere('test.type != :customType', { customType: TestType.CUSTOM });

        if (dto.domains.length > 0) {
            candidatesQuery.andWhere('question.domain IN (:...domains)', { domains: dto.domains });
        }

        if (dto.difficulties.length > 0) {
            candidatesQuery.andWhere('question.difficulty IN (:...difficulties)', { difficulties: dto.difficulties });
        }

        const candidates = await candidatesQuery.getMany();

        const pool = dto.statuses.length > 0
            ? await this.filterByStatus(candidates, userId, dto.statuses)
            : candidates;

        if (pool.length === 0) {
            throw new BadRequestException('No questions match your filters.');
        }

        const sampled = shuffle(pool).slice(0, Math.min(dto.count, pool.length));

        return this.practiceTestRepository.manager.transaction(async (manager) => {
            const packet = await manager.save(
                manager.create(PracticeTest, {
                    title: `Custom Packet — ${new Date().toLocaleDateString()}`,
                    type: TestType.CUSTOM,
                    ownerId: userId,
                }),
            );

            const section = await manager.save(
                manager.create(Section, {
                    testId: packet.id,
                    name: dto.section,
                }),
            );

            const module = await manager.save(
                manager.create(Module, {
                    sectionId: section.id,
                    position: 1,
                }),
            );

            for (const [index, source] of sampled.entries()) {
                await manager.save(
                    manager.create(Question, {
                        moduleId: module.id,
                        section: source.section,
                        domain: source.domain,
                        passage: source.passage,
                        prompt: source.prompt,
                        difficulty: source.difficulty,
                        position: index + 1,
                        answerChoices: source.answerChoices.map((choice) => ({
                            label: choice.label,
                            content: choice.content,
                            isCorrect: choice.isCorrect,
                        })),
                    }),
                );
            }

            return packet;
        });
    }

    // A question's status is based on the student's most recent answer to it
    private async filterByStatus(
        candidates: Question[],
        userId: string,
        statuses: QuestionStatusFilter[],
    ): Promise<Question[]> {
        if (candidates.length === 0) {
            return [];
        }

        const latestAnswers = await this.userAnswerRepository
            .createQueryBuilder('answer')
            .innerJoin('answer.testAttempt', 'attempt')
            .distinctOn(['answer.questionId'])
            .where('attempt.userId = :userId', { userId })
            .andWhere('answer.questionId IN (:...questionIds)', {
                questionIds: candidates.map((question) => question.id),
            })
            .orderBy('answer.questionId')
            .addOrderBy('answer.answeredAt', 'DESC', 'NULLS LAST')
            .getMany();

        const latestChoiceByQuestion = new Map(
            latestAnswers.map((answer) => [answer.questionId, answer.selectedChoiceId]),
        );

        return candidates.filter((question) => {
            const selectedChoiceId = latestChoiceByQuestion.get(question.id) ?? null;
            const status = this.resolveStatus(question, selectedChoiceId);

            return statuses.includes(status);
        });
    }

    private resolveStatus(question: Question, selectedChoiceId: string | null): QuestionStatusFilter {
        if (selectedChoiceId == null) {
            return QuestionStatusFilter.UNSOLVED;
        }

        const correctChoice = question.answerChoices.find((choice) => choice.isCorrect);

        return correctChoice?.id === selectedChoiceId
            ? QuestionStatusFilter.CORRECT
            : QuestionStatusFilter.INCORRECT;
    }

    async findAll(): Promise<PracticeTest[]> {
        const tests = await this.practiceTestRepository.find({
            where: { type: Not(In([TestType.DIAGNOSTIC, TestType.CHECK_IN, TestType.CUSTOM])) },
            relations: { sections: { modules: true } },
            order: {
                createdAt: 'ASC',
                sections: { modules: { position: 'ASC' } },
            },
        });

        for (const test of tests) {
            // Sort sections - Reading/writing first, then math
            this.sortSections(test.sections);
        }

        return tests;
    }

    async findDiagnostic(): Promise<PracticeTest> {
        const test = await this.practiceTestRepository.findOne({
            where: { type: TestType.DIAGNOSTIC },
            order: { createdAt: 'DESC' },
        });

        if (!test) {
            throw new NotFoundException('No diagnostic test is available.');
        }

        return test;
    }

    async findOne(id: string, isTeacher: boolean) {
        const test = await this.getFullTest(id);
        return toFullPracticeTestResponse(test, isTeacher);
    }

    private async getFullTest(id: string): Promise<PracticeTest> {
        const test = await this.practiceTestRepository.findOne({
            where: { id },
            relations: {
                sections: { modules: { questions: { answerChoices: true } } },
            },
            order: {
                sections: {
                    modules: {
                        position: 'ASC',
                        questions: {
                            position: 'ASC',
                            answerChoices: { label: 'ASC' },
                        },
                    },
                },
            },
        });

        if (!test) {
            throw new NotFoundException(`Practice test ${id} not found.`);
        }

        // Sort sections - Reading/writing first, then math
        this.sortSections(test.sections);

        return test;
    }

    async createQuestion(moduleId: string, createQuestionDto: CreateQuestionDto): Promise<Question> {
        const module = await this.moduleRepository.findOne({
            where: { id: moduleId },
            relations: { section: true },
        });

        if (!module) {
            throw new NotFoundException(`Module ${moduleId} not found.`);
        }

        const questionCount = await this.questionRepository.count({ where: { moduleId } });

        const question = this.questionRepository.create({
            moduleId,
            section: module.section.name,
            domain: createQuestionDto.domain,
            ...(createQuestionDto.difficulty && { difficulty: createQuestionDto.difficulty }),
            passage: createQuestionDto.passage ?? null,
            prompt: createQuestionDto.prompt,
            position: questionCount + 1,
            answerChoices: createQuestionDto.answerChoices,
        });

        return this.questionRepository.save(question);
    }

    async updateQuestion(questionId: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
        const question = await this.questionRepository.findOne({
            where: { id: questionId },
            relations: { answerChoices: true },
        });

        if (!question) {
            throw new NotFoundException(`Question ${questionId} not found.`);
        }

        if (updateQuestionDto.domain !== undefined) {
            question.domain = updateQuestionDto.domain;
        }

        if (updateQuestionDto.difficulty !== undefined) {
            question.difficulty = updateQuestionDto.difficulty;
        }

        if (updateQuestionDto.passage !== undefined) {
            question.passage = updateQuestionDto.passage || null;
        }

        if (updateQuestionDto.prompt !== undefined) {
            question.prompt = updateQuestionDto.prompt;
        }

        await this.questionRepository.save(question);

        if (updateQuestionDto.answerChoices) {
            for (const choiceUpdate of updateQuestionDto.answerChoices) {
                const choice = question.answerChoices.find((c) => c.id === choiceUpdate.id);

                if (choice) {
                    choice.content = choiceUpdate.content;
                    choice.isCorrect = choiceUpdate.isCorrect;
                }
            }

            await this.answerChoiceRepository.save(question.answerChoices);
            question.answerChoices.sort((a, b) => a.label.localeCompare(b.label));
        }

        return question;
    }

    private sortSections(sections: Section[]): void {
        sections.sort((a, b) => SECTION_ORDER.indexOf(a.name) - SECTION_ORDER.indexOf(b.name));
    }

    update(id: number, updatePracticeTestDto: UpdatePracticeTestDto) {
        return `This action updates a #${id} practiceTest`;
    }

    async remove(id: string): Promise<void> {
        const test = await this.practiceTestRepository.findOne({ where: { id } });

        if (!test) {
            throw new NotFoundException(`Practice test ${id} not found.`);
        }

        await this.practiceTestRepository.delete(id);
    }
}