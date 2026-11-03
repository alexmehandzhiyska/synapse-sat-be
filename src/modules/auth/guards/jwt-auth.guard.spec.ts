import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { JwtStrategy } from '../strategies/jwt.strategy';

const SECRET = 'test-secret';

const buildRequest = (authorization?: string) => ({ headers: authorization ? { authorization } : {} }) as { headers: Record<string, string>; user?: unknown };

const buildContext = (request: ReturnType<typeof buildRequest>): ExecutionContext =>
    ({
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => ({}),
        }),
    }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
    const payload = { sub: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT };
    let guard: JwtAuthGuard;

    beforeAll(() => {
        process.env.JWT_ACCESS_SECRET = SECRET;
        new JwtStrategy();
    });

    beforeEach(() => {
        guard = new JwtAuthGuard();
    });

    it('allows a request with a valid token and attaches the user', async () => {
        const token = new JwtService({ secret: SECRET }).sign(payload);
        const request = buildRequest(`Bearer ${token}`);

        await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
        expect(request.user).toEqual({ userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT });
    });

    it('rejects a request without a token', async () => {
        await expect(guard.canActivate(buildContext(buildRequest()))).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a token signed with a different secret', async () => {
        const token = new JwtService({ secret: 'other-secret' }).sign(payload);

        await expect(guard.canActivate(buildContext(buildRequest(`Bearer ${token}`)))).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an expired token', async () => {
        const token = new JwtService({ secret: SECRET }).sign(payload, { expiresIn: -10 });

        await expect(guard.canActivate(buildContext(buildRequest(`Bearer ${token}`)))).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a token that is not sent as a bearer token', async () => {
        const token = new JwtService({ secret: SECRET }).sign(payload);

        await expect(guard.canActivate(buildContext(buildRequest(token)))).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a malformed token', async () => {
        await expect(guard.canActivate(buildContext(buildRequest('Bearer not-a-token')))).rejects.toThrow(UnauthorizedException);
    });
});