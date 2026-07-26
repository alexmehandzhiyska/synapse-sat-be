import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';
import { PracticeTest } from './entities/practice-test.entity';

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
            relations: { modules: true },
            order: {
                createdAt: 'ASC',
                modules: { section: 'ASC', position: 'ASC' },
            },
        });
    }

    findOne(id: number) {
        return `This action returns a #${id} practiceTest`;
    }

    update(id: number, updatePracticeTestDto: UpdatePracticeTestDto) {
        return `This action updates a #${id} practiceTest`;
    }

    remove(id: number) {
        return `This action removes a #${id} practiceTest`;
    }
}
