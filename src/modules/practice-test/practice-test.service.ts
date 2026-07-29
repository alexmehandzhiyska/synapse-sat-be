import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';
import { PracticeTest } from './entities/practice-test.entity';
import { toFullPracticeTestResponse } from './mappers/practice-test.mapper';

@Injectable()
export class PracticeTestService {
    constructor(
        @InjectRepository(PracticeTest)
        private readonly practiceTestRepository: Repository<PracticeTest>,
    ) { }

    create(createPracticeTestDto: CreatePracticeTestDto) {
        return 'This action adds a new practiceTest';
    }

    findAll(): Promise<PracticeTest[]> {
        return this.practiceTestRepository.find({
            relations: { sections: { modules: true } },
            order: {
                createdAt: 'ASC',
                sections: { name: 'ASC', modules: { position: 'ASC' } },
            },
        });
    }

    async findOne(id: string) {
        const test = await this.practiceTestRepository.findOne({
            where: { id },
            relations: {
                sections: { modules: { questions: { answerChoices: true } } },
            },
            order: {
                sections: {
                    name: 'ASC',
                    modules: { position: 'ASC', questions: { position: 'ASC' } },
                },
            },
        });

        if (!test) {
            throw new NotFoundException(`Practice test ${id} not found.`);
        }

        return toFullPracticeTestResponse(test);
    }

    update(id: number, updatePracticeTestDto: UpdatePracticeTestDto) {
        return `This action updates a #${id} practiceTest`;
    }

    remove(id: number) {
        return `This action removes a #${id} practiceTest`;
    }
}