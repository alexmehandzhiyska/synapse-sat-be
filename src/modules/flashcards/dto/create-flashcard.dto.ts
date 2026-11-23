import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateFlashcardDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    word: string;

    @IsString()
    @IsNotEmpty()
    definition: string;

    @IsOptional()
    @IsString()
    context?: string;

    @IsOptional()
    @IsUUID()
    questionId?: string;
}