import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { Difficulty, Domain, QuestionStatusFilter, Section, TestType } from './enums/practice-test.enums';
import { PracticeTestController } from './practice-test.controller';
import { PracticeTestService } from './practice-test.service';

const buildRequest = (role: UserRole) =>
    ({
        user: { userId: 'user-1', email: 'pencho@test.com', role },
    }) as AuthenticatedRequest;

const guardsFor = (method: keyof PracticeTestController) => Reflect.getMetadata(GUARDS_METADATA, PracticeTestController.prototype[method]);

describe('PracticeTestController', () => {
    let controller: PracticeTestController;
    let practiceTestService: Record<
        'create' | 'findAll' | 'findDiagnostic' | 'generateCustomPacket' | 'findOne' | 'remove' | 'createQuestion' | 'updateQuestion',
        jest.Mock
    >;

    beforeEach(async () => {
        practiceTestService = {
            create: jest.fn().mockResolvedValue('create-result'),
            findAll: jest.fn().mockResolvedValue('find-all-result'),
            findDiagnostic: jest.fn().mockResolvedValue('find-diagnostic-result'),
            generateCustomPacket: jest.fn().mockResolvedValue('generate-custom-packet-result'),
            findOne: jest.fn().mockResolvedValue('find-one-result'),
            remove: jest.fn().mockResolvedValue(undefined),
            createQuestion: jest.fn().mockResolvedValue('create-question-result'),
            updateQuestion: jest.fn().mockResolvedValue('update-question-result'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PracticeTestController],
            providers: [{ provide: PracticeTestService, useValue: practiceTestService }],
        }).compile();

        controller = module.get(PracticeTestController);
    });

    describe('create', () => {
        it('creates a practice test', async () => {
            const dto = { title: 'Practice Test 1', type: TestType.STANDARD };
            const result = await controller.create(dto);

            expect(practiceTestService.create).toHaveBeenCalledWith(dto);
            expect(result).toBe('create-result');
        });
    });

    describe('findAll', () => {
        it('returns all practice tests', async () => {
            const result = await controller.findAll();

            expect(practiceTestService.findAll).toHaveBeenCalled();
            expect(result).toBe('find-all-result');
        });
    });

    describe('findDiagnostic', () => {
        it('returns the diagnostic test', async () => {
            const result = await controller.findDiagnostic();

            expect(practiceTestService.findDiagnostic).toHaveBeenCalled();
            expect(result).toBe('find-diagnostic-result');
        });
    });

    describe('generateCustomPacket', () => {
        it('generates a packet for the authenticated user', async () => {
            const dto = {
                section: Section.MATH,
                domains: [Domain.ALGEBRA],
                difficulties: [Difficulty.HARD],
                statuses: [QuestionStatusFilter.INCORRECT],
                count: 10,
            };

            const result = await controller.generateCustomPacket(dto, buildRequest(UserRole.STUDENT));

            expect(practiceTestService.generateCustomPacket).toHaveBeenCalledWith('user-1', dto);
            expect(result).toBe('generate-custom-packet-result');
        });
    });

    describe('findOne', () => {
        it('includes correct answers for a teacher', async () => {
            const result = await controller.findOne('test-1', buildRequest(UserRole.TEACHER));

            expect(practiceTestService.findOne).toHaveBeenCalledWith('test-1', true);
            expect(result).toBe('find-one-result');
        });

        it('hides correct answers from a student', async () => {
            await controller.findOne('test-1', buildRequest(UserRole.STUDENT));

            expect(practiceTestService.findOne).toHaveBeenCalledWith('test-1', false);
        });

        it('hides correct answers from an admin', async () => {
            await controller.findOne('test-1', buildRequest(UserRole.ADMIN));

            expect(practiceTestService.findOne).toHaveBeenCalledWith('test-1', false);
        });
    });

    describe('remove', () => {
        it('removes the given practice test', async () => {
            await controller.remove('test-1');

            expect(practiceTestService.remove).toHaveBeenCalledWith('test-1');
        });
    });

    describe('createQuestion', () => {
        it('adds a question to the given module', async () => {
            const dto = {
                domain: Domain.ALGEBRA,
                prompt: 'A prompt',
                answerChoices: [
                    { label: 'A', content: 'choice-a', isCorrect: true },
                    { label: 'B', content: 'choice-b', isCorrect: false },
                ],
            };
            
            const result = await controller.createQuestion('module-1', dto);

            expect(practiceTestService.createQuestion).toHaveBeenCalledWith('module-1', dto);
            expect(result).toBe('create-question-result');
        });
    });

    describe('updateQuestion', () => {
        it('updates the given question', async () => {
            const dto = { prompt: 'A prompt' };
            const result = await controller.updateQuestion('question-1', dto);

            expect(practiceTestService.updateQuestion).toHaveBeenCalledWith('question-1', dto);
            expect(result).toBe('update-question-result');
        });
    });

    describe('guards', () => {
        it('leaves the list of practice tests public', () => {
            expect(guardsFor('findAll')).toBeUndefined();
        });

        it('requires a valid token to take a test', () => {
            expect(guardsFor('findDiagnostic')).toEqual([JwtAuthGuard]);
            expect(guardsFor('generateCustomPacket')).toEqual([JwtAuthGuard]);
            expect(guardsFor('findOne')).toEqual([JwtAuthGuard]);
        });

        it('restricts managing tests and questions to teachers', () => {
            expect(guardsFor('create')).toEqual([TeacherGuard]);
            expect(guardsFor('remove')).toEqual([TeacherGuard]);
            expect(guardsFor('createQuestion')).toEqual([TeacherGuard]);
            expect(guardsFor('updateQuestion')).toEqual([TeacherGuard]);
        });
    });
});