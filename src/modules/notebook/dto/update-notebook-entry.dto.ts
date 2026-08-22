import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNotebookEntryDto {
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