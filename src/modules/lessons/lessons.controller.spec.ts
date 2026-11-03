import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../auth/entities/user.entity';
import { StudentGuard } from '../auth/guards/student.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Domain } from '../practice-test/enums/practice-test.enums';

import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

const request = {
    user: { userId: 'user-1', email: 'pencho@test.com', role: UserRole.STUDENT },
} as AuthenticatedRequest;

const guardsFor = (method: keyof LessonsController) => Reflect.getMetadata(GUARDS_METADATA, LessonsController.prototype[method]);

describe('LessonsController', () => {
    let controller: LessonsController;
    let lessonsService: Record<'getAll' | 'add' | 'update' | 'delete' | 'getProgress' | 'completeLesson', jest.Mock>;

    beforeEach(async () => {
        lessonsService = {
            getAll: jest.fn().mockResolvedValue('get-all-result'),
            add: jest.fn().mockResolvedValue('add-result'),
            update: jest.fn().mockResolvedValue('update-result'),
            delete: jest.fn().mockResolvedValue('delete-result'),
            getProgress: jest.fn().mockResolvedValue('get-progress-result'),
            completeLesson: jest.fn().mockResolvedValue('complete-lesson-result'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [LessonsController],
            providers: [{ provide: LessonsService, useValue: lessonsService }],
        }).compile();

        controller = module.get(LessonsController);
    });

    describe('getAll', () => {
        it('returns all lessons', async () => {
            const result = await controller.getAll();

            expect(lessonsService.getAll).toHaveBeenCalled();
            expect(result).toBe('get-all-result');
        });
    });

    describe('add', () => {
        it('adds a lesson to the given domain', async () => {
            const dto = { title: 'A lesson', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
            const result = await controller.add(Domain.ALGEBRA, dto);

            expect(lessonsService.add).toHaveBeenCalledWith(Domain.ALGEBRA, dto);
            expect(result).toBe('add-result');
        });
    });

    describe('update', () => {
        it('updates the given lesson', async () => {
            const dto = { title: 'A lesson' };
            const result = await controller.update('lesson-1', dto);

            expect(lessonsService.update).toHaveBeenCalledWith('lesson-1', dto);
            expect(result).toBe('update-result');
        });
    });

    describe('delete', () => {
        it('deletes the given lesson', async () => {
            const result = await controller.delete('lesson-1');

            expect(lessonsService.delete).toHaveBeenCalledWith('lesson-1');
            expect(result).toBe('delete-result');
        });
    });

    describe('getProgress', () => {
        it('returns the progress of the authenticated student', async () => {
            const result = await controller.getProgress(request);

            expect(lessonsService.getProgress).toHaveBeenCalledWith('user-1');
            expect(result).toBe('get-progress-result');
        });
    });

    describe('completeLesson', () => {
        it('completes the lesson for the authenticated student', async () => {
            const result = await controller.completeLesson('lesson-1', request);

            expect(lessonsService.completeLesson).toHaveBeenCalledWith('lesson-1', 'user-1');
            expect(result).toBe('complete-lesson-result');
        });
    });

    describe('guards', () => {
        it('restricts managing lessons to teachers', () => {
            expect(guardsFor('getAll')).toEqual([TeacherGuard]);
            expect(guardsFor('add')).toEqual([TeacherGuard]);
            expect(guardsFor('update')).toEqual([TeacherGuard]);
            expect(guardsFor('delete')).toEqual([TeacherGuard]);
        });

        it('restricts progress routes to students', () => {
            expect(guardsFor('getProgress')).toEqual([StudentGuard]);
            expect(guardsFor('completeLesson')).toEqual([StudentGuard]);
        });
    });
});