import { IsInt, Min } from 'class-validator';

export class UpdateTimeRemainingDto {
    @IsInt()
    @Min(0)
    secondsRemaining: number;
}