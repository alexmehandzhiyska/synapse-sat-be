import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateAnswerChoiceDto {
    @IsUUID()
    id: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsBoolean()
    isCorrect: boolean;
}