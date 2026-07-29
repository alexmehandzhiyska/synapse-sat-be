import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { PracticeTest } from '../../practice-test/entities/practice-test.entity';
import { UserAnswer } from './user-answer.entity';


@Entity({ name: 'test_attempts' })
// At most one in-progress attempt per user per test
@Index('UQ_test_attempts_active_user_test', ['userId', 'testId'], {
    unique: true,
    where: '"completed_at" IS NULL',
})
export class TestAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => PracticeTest, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'test_id' })
    test: PracticeTest;

    @Column({ name: 'test_id', type: 'uuid' })
    testId: string;

    @Column({ name: 'started_at', type: 'timestamptz' })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt: Date | null;

    @OneToMany(() => UserAnswer, (answer) => answer.testAttempt)
    answers: UserAnswer[];
}
