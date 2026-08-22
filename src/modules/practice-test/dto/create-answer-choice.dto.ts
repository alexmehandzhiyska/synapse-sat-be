import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAnswerChoiceDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    label: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsBoolean()
    isCorrect: boolean;
}