import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

import { Module } from '../../practice-test/entities/module.entity';
import { ModuleAttemptStatus } from '../enums/test-attempt.enums';
import { TestAttempt } from './test-attempt.entity';
import { UserAnswer } from './user-answer.entity';

@Entity({ name: 'module_attempts' })
@Unique(['testAttemptId', 'moduleId'])
export class ModuleAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TestAttempt, (testAttempt) => testAttempt.moduleAttempts, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'test_attempt_id' })
    testAttempt: TestAttempt;

    @Column({ name: 'test_attempt_id', type: 'uuid' })
    testAttemptId: string;

    @ManyToOne(() => Module, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'module_id' })
    module: Module;

    @Column({ name: 'module_id', type: 'uuid' })
    moduleId: string;

    @Column({
        type: 'enum',
        enum: ModuleAttemptStatus,
        default: ModuleAttemptStatus.NOT_STARTED,
    })
    status: ModuleAttemptStatus;

    // Snapshotted at start time via resolveModuleTimeLimit(), so a later
    // content edit to Module.timeLimitMinutes can't retroactively change a
    // timer the student already started against.
    @Column({ name: 'time_limit_minutes', type: 'int' })
    timeLimitMinutes: number;

    @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
    startedAt: Date | null;

    @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
    submittedAt: Date | null;

    @Column({ name: 'correct_count', type: 'int', nullable: true })
    correctCount: number | null;

    @Column({ name: 'total_count', type: 'int', nullable: true })
    totalCount: number | null;

    @OneToMany(() => UserAnswer, (answer) => answer.moduleAttempt)
    answers: UserAnswer[];
}
