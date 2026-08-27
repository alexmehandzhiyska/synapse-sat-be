import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateLessonDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title?: string;

    @IsOptional()
    @IsUrl()
    videoUrl?: string;
}