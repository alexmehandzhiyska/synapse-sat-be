import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestAttempt } from './entities/test-attempt.entity';
import { ModuleAttempt } from './entities/module-attempt.entity';
import { UserAnswer } from './entities/user-answer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TestAttempt, ModuleAttempt, UserAnswer]),
    ],
})
export class TestAttemptModule {}
