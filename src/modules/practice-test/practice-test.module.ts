import { Module } from '@nestjs/common';
import { PracticeTestService } from './practice-test.service';
import { PracticeTestController } from './practice-test.controller';

@Module({
    controllers: [PracticeTestController],
    providers: [PracticeTestService],
})
export class PracticeTestModule { }
