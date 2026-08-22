import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Difficulty, Domain } from '../enums/practice-test.enums';
import { UpdateAnswerChoiceDto } from './update-answer-choice.dto';

export class UpdateQuestionDto {
    @IsOptional()
    @IsEnum(Domain)
    domain?: Domain;

    @IsOptional()
    @IsString()
    passage?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    prompt?: string;

    @IsOptional()
    @IsEnum(Difficulty)
    difficulty?: Difficulty;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => UpdateAnswerChoiceDto)
    answerChoices?: UpdateAnswerChoiceDto[];
}