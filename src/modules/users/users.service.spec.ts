import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../auth/entities/user.entity';

import { UsersService } from './users.service';

type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(async (entity) => entity),
});

const buildUser = (overrides: Partial<User> = {}): User =>
    ({
        id: 'user-1',
        firstName: 'Pencho',
        lastName: 'Dimitrov',
        email: 'pencho@test.com',
        role: UserRole.STUDENT,
        country: 'Bulgaria',
        city: 'Sofia',
        school: 'Sofia High School',
        isActive: true,
        ...overrides,
    } as User);

describe('UsersService', () => {
    let service: UsersService;
    let usersRepository: MockRepository;

    beforeEach(async () => {
        usersRepository = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService, { provide: getRepositoryToken(User), useValue: usersRepository }],
        }).compile();

        service = module.get(UsersService);
    });

    describe('findAll', () => {
        it('returns all users ordered by creation date, shaped as user responses', async () => {
            usersRepository.find!.mockResolvedValue([buildUser()]);

            const result = await service.findAll();

            expect(usersRepository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
            expect(result).toEqual([
                {
                    id: 'user-1',
                    firstName: 'Pencho',
                    lastName: 'Dimitrov',
                    email: 'pencho@test.com',
                    role: UserRole.STUDENT,
                    country: 'Bulgaria',
                    city: 'Sofia',
                    school: 'Sofia High School',
                    isActive: true,
                },
            ]);
        });
    });

    describe('update', () => {
        it('throws NotFoundException when the user does not exist', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.update('missing-id', {
                    firstName: 'Mincho',
                    lastName: 'Ivanov',
                    role: UserRole.STUDENT,
                }),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws ForbiddenException when the target user is an admin', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser({ role: UserRole.ADMIN }));

            await expect(
                service.update('user-1', { firstName: 'Mincho', lastName: 'Ivanov', role: UserRole.STUDENT }),
            ).rejects.toBeInstanceOf(ForbiddenException);
        });

        it('updates the editable fields for a non-admin user', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser());

            const result = await service.update('user-1', {
                firstName: 'Marina',
                lastName: 'Martinova',
                country: 'Bulgaria',
                city: 'Plovdiv',
                school: 'Plovdiv High School',
                role: UserRole.TEACHER,
            });

            expect(result).toMatchObject({
                firstName: 'Marina',
                lastName: 'Martinova',
                city: 'Plovdiv',
                school: 'Plovdiv High School',
                role: UserRole.TEACHER,
            });
        });
    });

    describe('deactivate', () => {
        it('throws NotFoundException when the user does not exist', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            await expect(service.deactivate('missing-id')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws ForbiddenException when the target user is an admin', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser({ role: UserRole.ADMIN }));

            await expect(service.deactivate('user-1')).rejects.toBeInstanceOf(ForbiddenException);
        });

        it('deactivates a non-admin user', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser({ isActive: true }));

            const result = await service.deactivate('user-1');

            expect(result).toMatchObject({ isActive: false });
        });
    });

    describe('activate', () => {
        it('throws NotFoundException when the user does not exist', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            await expect(service.activate('missing-id')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws ForbiddenException when the target user is an admin', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser({ role: UserRole.ADMIN }));

            await expect(service.activate('user-1')).rejects.toBeInstanceOf(ForbiddenException);
        });

        it('activates a non-admin user', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser({ isActive: false }));

            const result = await service.activate('user-1');

            expect(result).toMatchObject({ isActive: true });
        });
    });
});