import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFlashcardDto {
    @IsString()
    @IsNotEmpty()
    definition: string;
}