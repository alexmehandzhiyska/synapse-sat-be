import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { SECTION_ORDER } from './constants/practice-test.constants';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';
import { Module } from './entities/module.entity';
import { PracticeTest } from './entities/practice-test.entity';
import { Question } from './entities/question.entity';
import { Section } from './entities/section.entity';
import { Section as SectionName, TestType } from './enums/practice-test.enums';
import { toFullPracticeTestResponse } from './mappers/practice-test.mapper';

@Injectable()
export class PracticeTestService {
    constructor(
        @InjectRepository(PracticeTest)
        private readonly practiceTestRepository: Repository<PracticeTest>,
        @InjectRepository(Module)
        private readonly moduleRepository: Repository<Module>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
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

    async findAll(): Promise<PracticeTest[]> {
        const tests = await this.practiceTestRepository.find({
            where: { type: Not(TestType.DIAGNOSTIC) },
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

    async findOne(id: string) {
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

        return toFullPracticeTestResponse(test);
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

    private sortSections(sections: Section[]): void {
        sections.sort((a, b) => SECTION_ORDER.indexOf(a.name) - SECTION_ORDER.indexOf(b.name));
    }

    update(id: number, updatePracticeTestDto: UpdatePracticeTestDto) {
        return `This action updates a #${id} practiceTest`;
    }

    remove(id: number) {
        return `This action removes a #${id} practiceTest`;
    }
}