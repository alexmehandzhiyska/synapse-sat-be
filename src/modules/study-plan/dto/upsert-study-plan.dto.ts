import { IsDateString, IsIn, IsInt, Max, Min } from 'class-validator';
import { SAT_TEST_DATES } from '../constants/study-plan.constants';

export class UpsertStudyPlanDto {
    @IsInt()
    @Min(400)
    @Max(1600)
    goalScore: number;

    @IsDateString()
    prepStartDate: string;

    @IsIn(SAT_TEST_DATES)
    testDate: string;
}