import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RequestUser } from '../interfaces/authenticated-request.interface';
import { UserRole } from '../entities/user.entity';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET,
        });
    }

    validate(payload: JwtPayload): RequestUser {
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}
