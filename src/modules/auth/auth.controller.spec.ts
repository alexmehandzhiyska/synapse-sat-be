import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

const request = {
    user: { userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT },
} as AuthenticatedRequest;

const guardsFor = (method: keyof AuthController) => Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype[method]);

describe('AuthController', () => {
    let controller: AuthController;
    let authService: Record<
        'register' | 'login' | 'forgotPassword' | 'verifyResetCode' | 'resetPassword' | 'getOne' | 'update',
        jest.Mock
    >;

    beforeEach(async () => {
        authService = {
            register: jest.fn().mockResolvedValue('register-result'),
            login: jest.fn().mockResolvedValue('login-result'),
            forgotPassword: jest.fn().mockResolvedValue('forgot-password-result'),
            verifyResetCode: jest.fn().mockResolvedValue('verify-reset-code-result'),
            resetPassword: jest.fn().mockResolvedValue('reset-password-result'),
            getOne: jest.fn().mockResolvedValue('get-one-result'),
            update: jest.fn().mockResolvedValue('update-result'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: authService }],
        }).compile();

        controller = module.get(AuthController);
    });

    describe('register', () => {
        it('passes the dto to the service and returns its result', async () => {
            const dto = { firstName: 'Pencho', lastName: 'Dimitrov', email: 'pencho@test.com', password: 'asdasdasd1!' };
            const result = await controller.register(dto);

            expect(authService.register).toHaveBeenCalledWith(dto);
            expect(result).toBe('register-result');
        });
    });

    describe('login', () => {
        it('passes the dto to the service and returns its result', async () => {
            const dto = { email: 'pencho@test.com', password: 'asdasdasd1!' };
            const result = await controller.login(dto);

            expect(authService.login).toHaveBeenCalledWith(dto);
            expect(result).toBe('login-result');
        });
    });

    describe('forgotPassword', () => {
        it('passes the dto to the service and returns its result', async () => {
            const dto = { email: 'pencho@test.com' };
            const result = await controller.forgotPassword(dto);

            expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
            expect(result).toBe('forgot-password-result');
        });
    });

    describe('verifyResetCode', () => {
        it('passes the dto to the service and returns its result', async () => {
            const dto = { email: 'pencho@test.com', code: '123456' };
            const result = await controller.verifyResetCode(dto);

            expect(authService.verifyResetCode).toHaveBeenCalledWith(dto);
            expect(result).toBe('verify-reset-code-result');
        });
    });

    describe('resetPassword', () => {
        it('passes the dto to the service and returns its result', async () => {
            const dto = { email: 'pencho@test.com', code: '123456', newPassword: 'asdasdasd2!' };
            const result = await controller.resetPassword(dto);

            expect(authService.resetPassword).toHaveBeenCalledWith(dto);
            expect(result).toBe('reset-password-result');
        });
    });

    describe('getMe', () => {
        it('returns the profile of the authenticated user', async () => {
            const result = await controller.getMe(request);

            expect(authService.getOne).toHaveBeenCalledWith('user-1');
            expect(result).toBe('get-one-result');
        });
    });

    describe('update', () => {
        it('updates the profile of the authenticated user', async () => {
            const dto = { firstName: 'Pencho', lastName: 'Dimitrov', city: 'Sofia' };
            const result = await controller.update(dto, request);

            expect(authService.update).toHaveBeenCalledWith('user-1', dto);
            expect(result).toBe('update-result');
        });
    });

    describe('guards', () => {
        it('requires a valid token for the profile routes', () => {
            expect(guardsFor('getMe')).toEqual([JwtAuthGuard]);
            expect(guardsFor('update')).toEqual([JwtAuthGuard]);
        });

        it('leaves the sign-in and password reset routes public', () => {
            expect(guardsFor('register')).toBeUndefined();
            expect(guardsFor('login')).toBeUndefined();
            expect(guardsFor('forgotPassword')).toBeUndefined();
            expect(guardsFor('verifyResetCode')).toBeUndefined();
            expect(guardsFor('resetPassword')).toBeUndefined();
        });
    });
});