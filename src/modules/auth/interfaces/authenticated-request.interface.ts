import { Request } from 'express';
import { UserRole } from '../entities/user.entity';

export interface RequestUser {
    userId: string;
    email: string;
    role: UserRole;
}

export interface AuthenticatedRequest extends Request {
    user: RequestUser;
}