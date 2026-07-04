import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UnorderedBulkOperation } from 'typeorm/driver/mongodb/typings.js';

@Injectable()
export class AuthService {
    rounds: number = 10;

    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) { }

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
            email, 
            passwordHash
        });

        const savedUser = await this.usersRepository.save(user);

        return {
            success: true,
            message: 'User registered successfully',
            user: {
                id: savedUser.id,
                email: savedUser.email,
            }
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

        return {
            success: true,
            message: 'User logged in successfully',
            user: {
                id: existingUser.id,
                email: existingUser.email
            }
        };
    }

    logout() {
        return {
            success: true,
            message: 'Logged out successfully'
        }
    }
}
