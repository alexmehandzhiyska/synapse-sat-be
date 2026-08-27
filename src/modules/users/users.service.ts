import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
    ) { }

    async findAll() {
        const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });

        return users.map((user) => this.toUserResponse(user));
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.getManageableUser(id);

        user.firstName = updateUserDto.firstName;
        user.lastName = updateUserDto.lastName;
        user.country = updateUserDto.country;
        user.city = updateUserDto.city;
        user.school = updateUserDto.school;
        user.role = updateUserDto.role;
        await this.usersRepository.save(user);

        return this.toUserResponse(user);
    }

    async deactivate(id: string) {
        const user = await this.getManageableUser(id);

        user.isActive = false;
        await this.usersRepository.save(user);

        return this.toUserResponse(user);
    }

    async activate(id: string) {
        const user = await this.getManageableUser(id);

        user.isActive = true;
        await this.usersRepository.save(user);

        return this.toUserResponse(user);
    }

    private async getManageableUser(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User ${id} not found.`);
        }

        if (user.role === UserRole.ADMIN) {
            throw new ForbiddenException('Admin accounts cannot be edited or removed.');
        }

        return user;
    }

    private toUserResponse(user: User) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            country: user.country,
            city: user.city,
            school: user.school,
            isActive: user.isActive,
        };
    }
}