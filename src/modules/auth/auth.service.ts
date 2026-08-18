import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
    rounds: number = 10;

    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService
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

        const tokens = await this.generateTokens(savedUser.id, savedUser.email);

        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.rounds);
        savedUser.refreshTokenHash = refreshTokenHash;
        await this.usersRepository.save(savedUser);

        return {
            success: true,
            message: 'User registered successfully',
            user: {
                id: savedUser.id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
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

        const tokens = await this.generateTokens(existingUser.id, existingUser.email);

        existingUser.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.rounds);
        await this.usersRepository.save(existingUser);

        return {
            success: true,
            message: 'User logged in successfully',
            user: {
                id: existingUser.id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email
            },
            ...tokens
        };
    }

    async refresh(refreshToken: string) {
        let payload: { sub: string; email: string };

        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            });
        } catch {
            throw new UnauthorizedException('Access denied!');
        }

        const user = await this.usersRepository.findOne({
            where: { id: payload.sub }
        });

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Access denied!');
        }

        const refreshTokenIsValid = await bcrypt.compare(
            refreshToken,
            user.refreshTokenHash
        );

        if (!refreshTokenIsValid) {
            throw new UnauthorizedException('Access denied!');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.rounds);
        await this.usersRepository.save(user);

        return tokens;
    }

    async logout(refreshToken: string) {
        let payload: { sub: string };

        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            });
        } catch {
            return {
                success: true,
                message: 'User logged out successfully.'
            }
        }
        await this.usersRepository.update(payload.sub, {
            refreshTokenHash: null
        });

        return {
            success: true,
            message: 'User logged out successfully.'
        }
    }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m'
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d'
        });

        return { accessToken, refreshToken };
    }
}
