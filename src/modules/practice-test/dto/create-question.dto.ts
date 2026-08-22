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
import { CreateAnswerChoiceDto } from './create-answer-choice.dto';

export class CreateQuestionDto {
    @IsEnum(Domain)
    domain: Domain;

    @IsOptional()
    @IsString()
    passage?: string;

    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsOptional()
    @IsEnum(Difficulty)
    difficulty?: Difficulty;

    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerChoiceDto)
    answerChoices: CreateAnswerChoiceDto[];
}