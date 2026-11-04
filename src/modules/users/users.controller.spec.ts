import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../auth/entities/user.entity';
import { AdminGuard } from '../auth/guards/admin.guard';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: Record<'findAll' | 'update' | 'deactivate' | 'activate', jest.Mock>;

    beforeEach(async () => {
        usersService = {
            findAll: jest.fn().mockResolvedValue('find-all-result'),
            update: jest.fn().mockResolvedValue('update-result'),
            deactivate: jest.fn().mockResolvedValue('deactivate-result'),
            activate: jest.fn().mockResolvedValue('activate-result'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: usersService }],
        }).compile();

        controller = module.get(UsersController);
    });

    describe('findAll', () => {
        it('returns all users', async () => {
            const result = await controller.findAll();

            expect(usersService.findAll).toHaveBeenCalled();
            expect(result).toBe('find-all-result');
        });
    });

    describe('update', () => {
        it('updates the given user', async () => {
            const dto = { firstName: 'Pencho', lastName: 'Dimitrov', role: UserRole.TEACHER };
            const result = await controller.update('user-1', dto);

            expect(usersService.update).toHaveBeenCalledWith('user-1', dto);
            expect(result).toBe('update-result');
        });
    });

    describe('deactivate', () => {
        it('deactivates the given user', async () => {
            const result = await controller.deactivate('user-1');

            expect(usersService.deactivate).toHaveBeenCalledWith('user-1');
            expect(result).toBe('deactivate-result');
        });
    });

    describe('activate', () => {
        it('activates the given user', async () => {
            const result = await controller.activate('user-1');

            expect(usersService.activate).toHaveBeenCalledWith('user-1');
            expect(result).toBe('activate-result');
        });
    });

    describe('guards', () => {
        it('restricts every route to admins', () => {
            expect(Reflect.getMetadata(GUARDS_METADATA, UsersController)).toEqual([AdminGuard]);
        });
    });
});