import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNotebookEntryDto {
    @IsUUID()
    questionId: string;

    @IsString()
    @IsNotEmpty()
    what: string;

    @IsString()
    @IsNotEmpty()
    why: string;

    @IsString()
    @IsNotEmpty()
    how: string;
}