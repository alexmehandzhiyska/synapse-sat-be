import { Injectable } from '@nestjs/common';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';

@Injectable()
export class PracticeTestService {
    create(createPracticeTestDto: CreatePracticeTestDto) {
        return 'This action adds a new practiceTest';
    }

    findAll() {
        return `This action returns all practiceTest`;
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
