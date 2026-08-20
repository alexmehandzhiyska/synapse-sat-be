import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpsertStudyPlanDto } from './dto/upsert-study-plan.dto';
import { StudyPlan } from './entities/study-plan.entity';

@Injectable()
export class StudyPlanService {
    constructor(
        @InjectRepository(StudyPlan) private readonly studyPlanRepository: Repository<StudyPlan>,
    ) { }

    async upsert(userId: string, upsertStudyPlanDto: UpsertStudyPlanDto) {
        let studyPlan = await this.studyPlanRepository.findOne({
            where: { userId }
        });

        if (!studyPlan) {
            studyPlan = this.studyPlanRepository.create({ userId });
        }

        studyPlan.goalScore = upsertStudyPlanDto.goalScore;
        await this.studyPlanRepository.save(studyPlan);

        return {
            goalScore: studyPlan.goalScore
        };
    }
}