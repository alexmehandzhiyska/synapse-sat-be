import { IsArray, IsEnum, IsInt, Min } from 'class-validator';
import { Difficulty, Domain, QuestionStatusFilter, Section } from '../enums/practice-test.enums';

export class GenerateCustomPacketDto {
    @IsEnum(Section)
    section: Section;

    @IsArray()
    @IsEnum(Domain, { each: true })
    domains: Domain[];

    @IsArray()
    @IsEnum(Difficulty, { each: true })
    difficulties: Difficulty[];

    @IsArray()
    @IsEnum(QuestionStatusFilter, { each: true })
    statuses: QuestionStatusFilter[];

    @IsInt()
    @Min(1)
    count: number;
}