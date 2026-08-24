import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsUrl()
    videoUrl: string;
}