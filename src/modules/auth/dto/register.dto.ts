import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string;

    @IsEmail()
    @MinLength(5)
    @MaxLength(200)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/(?=.*\d)(?=.*[^A-Za-z0-9])/, {
        message: 'Password must contain at least 1 digit and 1 special character.',
    })
    password: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    school?: string;
}