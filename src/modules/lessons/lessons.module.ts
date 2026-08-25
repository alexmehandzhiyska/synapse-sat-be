import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestAttemptModule } from '../test-attempt/test-attempt.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Lesson,
            LessonProgress,
        ]),
        TestAttemptModule,
    ],
    controllers: [LessonsController],
    providers: [LessonsService],
})
export class LessonsModule { }