import { IsUUID } from 'class-validator';

export class CreateTestAttemptDto {
    @IsUUID()
    testId: string;
}