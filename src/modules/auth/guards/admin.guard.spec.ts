import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

import { AdminGuard } from './admin.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { RequestUser } from '../interfaces/authenticated-request.interface';

const buildContext = (user?: RequestUser): ExecutionContext =>
    ({
        switchToHttp: () => ({
            getRequest: () => ({ user }),
        }),
    }) as unknown as ExecutionContext;

describe('AdminGuard', () => {
    let guard: AdminGuard;

    beforeEach(() => {
        guard = new AdminGuard();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('allows access when the authenticated user is an admin', async () => {
        jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(true);
        const context = buildContext({ userId: 'user-1', email: 'pencho@test.com', role: UserRole.ADMIN });

        await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('throws ForbiddenException when the authenticated user is not an admin', async () => {
        jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(true);
        const context = buildContext({ userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT });

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('propagates the error when the underlying JWT check fails', async () => {
        jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockRejectedValue(new UnauthorizedException());
        const context = buildContext(undefined);

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });
});