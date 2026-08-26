import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudyPlan } from './entities/study-plan.entity';
import { StudyPlanController } from './study-plan.controller';
import { StudyPlanService } from './study-plan.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([StudyPlan]),
    ],
    controllers: [StudyPlanController],
    providers: [StudyPlanService],
    exports: [StudyPlanService],
})
export class StudyPlanModule {}