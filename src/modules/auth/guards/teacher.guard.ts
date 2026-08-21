import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class TeacherGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        if (request.user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Teacher access required.');
        }

        return true;
    }
}