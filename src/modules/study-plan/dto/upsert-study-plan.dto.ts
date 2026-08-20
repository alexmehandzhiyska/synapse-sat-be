import { IsInt, Max, Min } from 'class-validator';

export class UpsertStudyPlanDto {
    @IsInt()
    @Min(400)
    @Max(1600)
    goalScore: number;
}