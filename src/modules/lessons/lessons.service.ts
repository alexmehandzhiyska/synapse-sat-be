import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Domain } from '../practice-test/enums/practice-test.enums';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
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
}