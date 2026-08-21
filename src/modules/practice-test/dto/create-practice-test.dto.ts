import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TestType } from '../enums/practice-test.enums';

export class CreatePracticeTestDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsEnum(TestType)
    type: TestType;
}