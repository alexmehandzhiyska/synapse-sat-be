import { IsOptional, IsUUID } from 'class-validator';

export class UpsertAnswerDto {
    @IsOptional()
    @IsUUID()
    selectedAnswerChoiceId?: string | null;
}