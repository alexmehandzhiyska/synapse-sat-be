import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeTestService } from './practice-test.service';
import { PracticeTestController } from './practice-test.controller';
import { AnswerChoice } from './entities/answer-choice.entity';
import { Module as PracticeTestModuleEntity } from './entities/module.entity';
import { PracticeTest } from './entities/practice-test.entity';
import { Question } from './entities/question.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PracticeTest,
            PracticeTestModuleEntity,
            Question,
            AnswerChoice,
        ]),
    ],
    controllers: [PracticeTestController],
    providers: [PracticeTestService],
})
export class PracticeTestModule { }
