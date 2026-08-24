import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeTestService } from './practice-test.service';
import { PracticeTestController } from './practice-test.controller';
import { AnswerChoice } from './entities/answer-choice.entity';
import { Module as PracticeTestModuleEntity } from './entities/module.entity';
import { PracticeTest } from './entities/practice-test.entity';
import { Question } from './entities/question.entity';
import { Section } from './entities/section.entity';
import { UserAnswer } from '../test-attempt/entities/user-answer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PracticeTest,
            PracticeTestModuleEntity,
            Question,
            AnswerChoice,
            Section,
            UserAnswer
        ]),
    ],
    controllers: [PracticeTestController],
    providers: [PracticeTestService],
})
export class PracticeTestModule { }
