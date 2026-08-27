import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UserRole } from '../entities/user.entity';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
        process.env.JWT_ACCESS_SECRET = 'test-secret';
        strategy = new JwtStrategy();
    });

    it('maps the JWT payload to a RequestUser', () => {
        const payload: JwtPayload = { sub: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT };

        expect(strategy.validate(payload)).toEqual({
            userId: 'user-1',
            email: 'pencho@test.com',
            role: UserRole.STUDENT,
        });
    });
});