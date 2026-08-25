import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PracticeTest } from '../practice-test/entities/practice-test.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { TestAttemptController } from './test-attempt.controller';
import { TestAttemptService } from './test-attempt.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TestAttempt,
            UserAnswer,
            PracticeTest,
        ]),
    ],
    controllers: [TestAttemptController],
    providers: [TestAttemptService],
    exports: [TestAttemptService],
})
export class TestAttemptModule {}