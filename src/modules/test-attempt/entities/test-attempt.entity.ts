import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { PracticeTest } from '../../practice-test/entities/practice-test.entity';
import { ModuleAttempt } from './module-attempt.entity';

// Deliberately no `status`/`currentModuleId` columns here - both are fully
// derivable from the child ModuleAttempt rows (see TestAttemptService), so
// storing them would just be duplicated state to keep in sync on every write.
@Entity({ name: 'test_attempts' })
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

    @OneToMany(() => ModuleAttempt, (moduleAttempt) => moduleAttempt.testAttempt)
    moduleAttempts: ModuleAttempt[];
}
