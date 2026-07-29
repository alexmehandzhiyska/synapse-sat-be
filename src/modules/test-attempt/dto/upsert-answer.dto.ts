import { IsOptional, IsUUID } from 'class-validator';

export class UpsertAnswerDto {
    @IsOptional()
    @IsUUID()
    selectedChoiceId?: string | null;
}