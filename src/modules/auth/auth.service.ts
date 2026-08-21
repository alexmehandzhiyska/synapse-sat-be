import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtService } from '@nestjs/jwt'
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    rounds: number = 10;
    private readonly logger = new Logger(AuthService.name);
    private readonly RESET_CODE_TTL_MS = 15 * 60 * 1000;

    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) { }

    async register(registerDto: RegisterDto) {
        const email = registerDto.email.trim().toLowerCase();

        const existingUser = await this.usersRepository.findOne({
            where: { email }
        });

        if (existingUser) {
            throw new ConflictException('Email is already in user. Log in or register with another email.');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, this.rounds);

        const user = this.usersRepository.create({
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            email,
            passwordHash,
            country: registerDto.country,
            city: registerDto.city,
            school: registerDto.school
        });

        const savedUser = await this.usersRepository.save(user);

        const tokens = await this.generateTokens(savedUser.id, savedUser.email, savedUser.role);

        return {
            success: true,
            message: 'User registered successfully',
            user: {
                id: savedUser.id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                role: savedUser.role,
            },
            ...tokens
        };
    }

    async login(loginDto: LoginDto) {
        const email = loginDto.email.trim().toLowerCase();

        const existingUser = await this.usersRepository.findOne({
            where: { email }
        });

        if (!existingUser) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const passwordIsCorrect = await bcrypt.compare(loginDto.password, existingUser.passwordHash);

        if (!passwordIsCorrect) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const tokens = await this.generateTokens(existingUser.id, existingUser.email, existingUser.role);

        return {
            success: true,
            message: 'User logged in successfully',
            user: {
                id: existingUser.id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email,
                role: existingUser.role
            },
            ...tokens
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const email = forgotPasswordDto.email.trim().toLowerCase();

        const user = await this.usersRepository.findOne({
            where: { email }
        });

        if (user) {
            const code = randomInt(100000, 1000000).toString();

            user.resetCodeHash = await bcrypt.hash(code, this.rounds);
            user.resetCodeExpiresAt = new Date(Date.now() + this.RESET_CODE_TTL_MS);
            await this.usersRepository.save(user);

            try {
                await this.mailService.sendPasswordResetCode(user.email, code);
            } catch (error) {
                this.logger.error('Failed to send password reset email', error);
            }
        }

        return {
            success: true,
            message: 'If that email is registered, a verification code has been sent.'
        };
    }

    async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto) {
        const email = verifyResetCodeDto.email.trim().toLowerCase();

        const user = await this.usersRepository.findOne({
            where: { email }
        });

        await this.assertValidResetCode(user, verifyResetCodeDto.code);

        return {
            success: true,
            message: 'Verification code confirmed.'
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const email = resetPasswordDto.email.trim().toLowerCase();

        const user = await this.usersRepository.findOne({
            where: { email }
        });

        await this.assertValidResetCode(user, resetPasswordDto.code);

        user!.passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, this.rounds);
        user!.resetCodeHash = null;
        user!.resetCodeExpiresAt = null;
        await this.usersRepository.save(user!);

        return {
            success: true,
            message: 'Password reset successfully. Please log in with your new password.'
        };
    }

    async getOne(userId: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException('Access denied!');
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            country: user.country,
            city: user.city,
            school: user.school,
            role: user.role
        };
    }

    async update(userId: string, updateProfileDto: UpdateProfileDto) {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException('Access denied!');
        }

        user.firstName = updateProfileDto.firstName;
        user.lastName = updateProfileDto.lastName;
        user.country = updateProfileDto.country;
        user.city = updateProfileDto.city;
        user.school = updateProfileDto.school;
        await this.usersRepository.save(user);

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            country: user.country,
            city: user.city,
            school: user.school,
            role: user.role
        };
    }

    private async assertValidResetCode(user: User | null, code: string): Promise<void> {
        const invalidCodeError = new BadRequestException('Invalid or expired verification code.');

        if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
            throw invalidCodeError;
        }

        if (user.resetCodeExpiresAt.getTime() < Date.now()) {
            throw invalidCodeError;
        }

        const codeIsCorrect = await bcrypt.compare(code, user.resetCodeHash);

        if (!codeIsCorrect) {
            throw invalidCodeError;
        }
    }

    private async generateTokens(userId: string, email: string, role: UserRole) {
        const payload = { sub: userId, email, role };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET
        });

        return { accessToken };
    }
}