import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsString()
    @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits.' })
    code: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/(?=.*\d)(?=.*[^A-Za-z0-9])/, {
        message: 'Password must contain at least 1 digit and 1 special character.',
    })
    newPassword: string;
}