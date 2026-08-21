import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { SECTION_ORDER } from './constants/practice-test.constants';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';
import { PracticeTest } from './entities/practice-test.entity';
import { Section } from './entities/section.entity';
import { Section as SectionName, TestType } from './enums/practice-test.enums';
import { toFullPracticeTestResponse } from './mappers/practice-test.mapper';

@Injectable()
export class PracticeTestService {
    constructor(
        @InjectRepository(PracticeTest)
        private readonly practiceTestRepository: Repository<PracticeTest>,
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