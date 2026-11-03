import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { NotebookController } from './notebook.controller';
import { NotebookService } from './notebook.service';

const request = {
    user: { userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT },
} as AuthenticatedRequest;

describe('NotebookController', () => {
    let controller: NotebookController;
    let notebookService: Record<'getByUser' | 'create' | 'update' | 'remove', jest.Mock>;

    beforeEach(async () => {
        notebookService = {
            getByUser: jest.fn().mockResolvedValue('get-by-user-result'),
            create: jest.fn().mockResolvedValue('create-result'),
            update: jest.fn().mockResolvedValue('update-result'),
            remove: jest.fn().mockResolvedValue('remove-result'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotebookController],
            providers: [{ provide: NotebookService, useValue: notebookService }],
        }).compile();

        controller = module.get(NotebookController);
    });

    describe('getByUser', () => {
        it('returns the entries of the authenticated user', async () => {
            const result = await controller.getByUser(request);

            expect(notebookService.getByUser).toHaveBeenCalledWith('user-1');
            expect(result).toBe('get-by-user-result');
        });
    });

    describe('create', () => {
        it('creates an entry for the authenticated user', async () => {
            const dto = { questionId: '7c9e6679-7425-40de-944b-e07fc1f90ae7', what: 'what', why: 'why', how: 'how' };
            const result = await controller.create(dto, request);

            expect(notebookService.create).toHaveBeenCalledWith('user-1', dto);
            expect(result).toBe('create-result');
        });
    });

    describe('update', () => {
        it('updates the entry of the authenticated user', async () => {
            const dto = { what: 'what', why: 'why', how: 'how' };
            const result = await controller.update('entry-1', dto, request);

            expect(notebookService.update).toHaveBeenCalledWith('user-1', 'entry-1', dto);
            expect(result).toBe('update-result');
        });
    });

    describe('remove', () => {
        it('removes the entry of the authenticated user', async () => {
            const result = await controller.remove('entry-1', request);

            expect(notebookService.remove).toHaveBeenCalledWith('user-1', 'entry-1');
            expect(result).toBe('remove-result');
        });
    });

    describe('guards', () => {
        it('requires a valid token for every route', () => {
            expect(Reflect.getMetadata(GUARDS_METADATA, NotebookController)).toEqual([JwtAuthGuard]);
        });
    });
});