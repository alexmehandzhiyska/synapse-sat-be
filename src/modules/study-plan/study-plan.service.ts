import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SAT_TEST_DATES } from './constants/study-plan.constants';
import { UpsertStudyPlanDto } from './dto/upsert-study-plan.dto';
import { StudyPlan } from './entities/study-plan.entity';

@Injectable()
export class StudyPlanService {
    constructor(
        @InjectRepository(StudyPlan) private readonly studyPlanRepository: Repository<StudyPlan>,
    ) { }

    getTestDates() {
        const today = new Date().toISOString().split('T')[0];
        return SAT_TEST_DATES.filter((date) => date >= today);
    }

    async getOne(userId: string) {
        const studyPlan = await this.studyPlanRepository.findOne({
            where: { userId }
        });

        if (!studyPlan) {
            return null;
        }

        return {
            goalScore: studyPlan.goalScore,
            prepStartDate: studyPlan.prepStartDate,
            testDate: studyPlan.testDate
        };
    }

    async upsert(userId: string, upsertStudyPlanDto: UpsertStudyPlanDto) {
        let studyPlan = await this.studyPlanRepository.findOne({
            where: { userId }
        });

        if (!studyPlan) {
            studyPlan = this.studyPlanRepository.create({ userId });
        }

        studyPlan.goalScore = upsertStudyPlanDto.goalScore;
        studyPlan.prepStartDate = upsertStudyPlanDto.prepStartDate;
        studyPlan.testDate = upsertStudyPlanDto.testDate;
        
        await this.studyPlanRepository.save(studyPlan);

        return {
            goalScore: studyPlan.goalScore,
            prepStartDate: studyPlan.prepStartDate,
            testDate: studyPlan.testDate
        };
    }
}