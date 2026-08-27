import { BadRequestException, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';
import { MailService } from '../mail/mail.service';

type MockRepository = Partial<Record<keyof Repository<User>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn(async (entity) => ({ id: entity.id ?? 'generated-id', ...entity })),
});

const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    firstName: 'Pencho',
    lastName: 'Dimitrov',
    email: 'pencho@test.com',
    passwordHash: '',
    resetCodeHash: null,
    resetCodeExpiresAt: null,
    country: null,
    city: null,
    school: null,
    role: UserRole.STUDENT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

describe('AuthService', () => {
    let service: AuthService;
    let usersRepository: MockRepository;
    let jwtService: { signAsync: jest.Mock };
    let mailService: { sendPasswordResetCode: jest.Mock };

    beforeAll(() => {
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    beforeEach(async () => {
        usersRepository = createMockRepository();
        jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
        mailService = { sendPasswordResetCode: jest.fn().mockResolvedValue(undefined) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(User), useValue: usersRepository },
                { provide: JwtService, useValue: jwtService },
                { provide: MailService, useValue: mailService },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    describe('register', () => {
        it('hashes the password, lowercases the email, and returns tokens', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            const result = await service.register({
                firstName: 'Pencho',
                lastName: 'Dimitrov',
                email: '  Pencho@Test.com  ',
                password: 'asdasdasd1!',
            } as any);

            expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: 'pencho@test.com' } });

            const savedUser = usersRepository.save!.mock.calls[0][0];
            expect(savedUser.email).toBe('pencho@test.com');
            expect(savedUser.passwordHash).not.toBe('asdasdasd1!');
            await expect(bcrypt.compare('asdasdasd1!', savedUser.passwordHash)).resolves.toBe(true);

            expect(result).toEqual({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: 'generated-id',
                    firstName: 'Pencho',
                    lastName: 'Dimitrov',
                    email: 'pencho@test.com',
                    role: savedUser.role,
                },
                accessToken: 'signed.jwt.token',
            });
        });

        it('throws ConflictException when the email is already registered', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser());

            await expect(
                service.register({
                    firstName: 'Pencho',
                    lastName: 'Dimitrov',
                    email: 'pencho@test.com',
                    password: 'asdasdasd1!',
                } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });
    });

    describe('login', () => {
        it('returns tokens for valid credentials', async () => {
            const passwordHash = await bcrypt.hash('asdasdasd1!', 10);
            usersRepository.findOne!.mockResolvedValue(buildUser({ passwordHash }));

            const result = await service.login({
                email: 'pencho@test.com',
                password: 'asdasdasd1!',
            } as any);

            expect(result.success).toBe(true);
            expect(result.accessToken).toBe('signed.jwt.token');
            expect(result.user.email).toBe('pencho@test.com');
        });

        it('throws UnauthorizedException for an unknown email', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.login({ email: 'nobody@example.com', password: 'whatever' } as any),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('throws UnauthorizedException for a wrong password', async () => {
            const passwordHash = await bcrypt.hash('asdasdasd1!', 10);
            usersRepository.findOne!.mockResolvedValue(buildUser({ passwordHash }));

            await expect(
                service.login({ email: 'pencho@test.com', password: 'asdasdasd2!' } as any),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('throws UnauthorizedException for a deactivated account', async () => {
            const passwordHash = await bcrypt.hash('asdasdasd1!', 10);
            usersRepository.findOne!.mockResolvedValue(buildUser({ passwordHash, isActive: false }));

            await expect(
                service.login({
                    email: 'pencho@test.com',
                    password: 'asdasdasd1!',
                } as any),
            ).rejects.toThrow('This account has been deactivated.');
        });
    });

    describe('forgotPassword', () => {
        it('returns the generic message and does nothing when the user does not exist', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            const result = await service.forgotPassword({ email: 'nobody@example.com' });

            expect(result).toEqual({
                success: true,
                message: 'If that email is registered, a verification code has been sent.',
            });
            expect(mailService.sendPasswordResetCode).not.toHaveBeenCalled();
            expect(usersRepository.save).not.toHaveBeenCalled();
        });

        it('persists a reset code and emails it when the user exists', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser());

            const result = await service.forgotPassword({ email: 'pencho@test.com' });

            expect(result.success).toBe(true);
            expect(usersRepository.save).toHaveBeenCalledTimes(1);

            const savedUser = usersRepository.save!.mock.calls[0][0];
            expect(savedUser.resetCodeHash).toBeTruthy();
            expect(savedUser.resetCodeExpiresAt).toBeInstanceOf(Date);
            expect(mailService.sendPasswordResetCode).toHaveBeenCalledWith('pencho@test.com', expect.any(String));
        });

        it('still resolves successfully when the mail service rejects', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser());
            mailService.sendPasswordResetCode.mockRejectedValue(new Error('SMTP down'));

            await expect(service.forgotPassword({ email: 'pencho@test.com' })).resolves.toEqual({
                success: true,
                message: 'If that email is registered, a verification code has been sent.',
            });
        });
    });

    describe('verifyResetCode', () => {
        const code = '123456';

        it('succeeds with a valid, unexpired code', async () => {
            const resetCodeHash = await bcrypt.hash(code, 10);

            usersRepository.findOne!.mockResolvedValue(
                buildUser({ resetCodeHash, resetCodeExpiresAt: new Date(Date.now() + 60000) }),
            );

            await expect(service.verifyResetCode({ email: 'pencho@test.com', code })).resolves.toEqual({
                success: true,
                message: 'Verification code confirmed.',
            });
        });

        it('throws BadRequestException for a wrong code', async () => {
            const resetCodeHash = await bcrypt.hash(code, 10);

            usersRepository.findOne!.mockResolvedValue(
                buildUser({ resetCodeHash, resetCodeExpiresAt: new Date(Date.now() + 60000) }),
            );

            await expect(
                service.verifyResetCode({ email: 'pencho@test.com', code: '000000' }),
            ).rejects.toThrow('Invalid or expired verification code.');
        });

        it('throws BadRequestException for an expired code', async () => {
            const resetCodeHash = await bcrypt.hash(code, 10);

            usersRepository.findOne!.mockResolvedValue(
                buildUser({ resetCodeHash, resetCodeExpiresAt: new Date(Date.now() - 1000) }),
            );

            await expect(
                service.verifyResetCode({ email: 'pencho@test.com', code }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('throws BadRequestException when there is no pending code', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser());

            await expect(
                service.verifyResetCode({ email: 'pencho@test.com', code }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('resetPassword', () => {
        const code = '123456';

        it('updates the password hash and clears the reset code on success', async () => {
            const resetCodeHash = await bcrypt.hash(code, 10);
            const user = buildUser({
                passwordHash: await bcrypt.hash('asdasdasd1!', 10),
                resetCodeHash,
                resetCodeExpiresAt: new Date(Date.now() + 60000),
            });

            usersRepository.findOne!.mockResolvedValue(user);

            const result = await service.resetPassword({
                email: 'pencho@test.com',
                code,
                newPassword: 'asdasdasd2!',
            });

            expect(result).toEqual({
                success: true,
                message: 'Password reset successfully. Please log in with your new password.',
            });

            expect(usersRepository.save).toHaveBeenCalledTimes(1);

            const savedUser = usersRepository.save!.mock.calls[0][0];
            await expect(bcrypt.compare('asdasdasd2!', savedUser.passwordHash)).resolves.toBe(true);
            expect(savedUser.resetCodeHash).toBeNull();
            expect(savedUser.resetCodeExpiresAt).toBeNull();
        });

        it('throws BadRequestException for an expired code and does not touch the password', async () => {
            const resetCodeHash = await bcrypt.hash(code, 10);
            usersRepository.findOne!.mockResolvedValue(
                buildUser({ resetCodeHash, resetCodeExpiresAt: new Date(Date.now() - 1000) }),
            );

            await expect(
                service.resetPassword({ email: 'pencho@test.com', code, newPassword: 'asdasdasd2!' }),
            ).rejects.toBeInstanceOf(BadRequestException);
            expect(usersRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getOne', () => {
        it('throws UnauthorizedException when the user does not exist', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            await expect(service.getOne('missing-id')).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('returns the profile shape without passwordHash', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser());

            const result = await service.getOne('user-1');

            expect(result).not.toHaveProperty('passwordHash');
            expect(result).toEqual({
                id: 'user-1',
                firstName: 'Pencho',
                lastName: 'Dimitrov',
                email: 'pencho@test.com',
                country: null,
                city: null,
                school: null,
                role: UserRole.STUDENT,
            });
        });
    });

    describe('update', () => {
        const profileUpdate = {
            firstName: 'New',
            lastName: 'Name',
            country: 'Bulgaria',
            city: 'Sofia',
            school: 'SMG',
        };

        it('throws UnauthorizedException when the user does not exist', async () => {
            usersRepository.findOne!.mockResolvedValue(null);

            await expect(service.update('missing-id', profileUpdate)).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('persists the changed fields and returns the profile shape', async () => {
            usersRepository.findOne!.mockResolvedValue(buildUser());

            const result = await service.update('user-1', profileUpdate);

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            const savedUser = usersRepository.save!.mock.calls[0][0];
            expect(savedUser.firstName).toBe('New');

            expect(result).not.toHaveProperty('passwordHash');
            expect(result.firstName).toBe('New');
            expect(result.school).toBe('SMG');
        });
    });
});
