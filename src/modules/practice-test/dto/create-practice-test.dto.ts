import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Domain, TestType } from '../enums/practice-test.enums';

export class CreatePracticeTestDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsEnum(TestType)
    type: TestType;

    // Required for check-in tests - the domain the test is scoped to.
    @IsOptional()
    @IsEnum(Domain)
    domain?: Domain;
}