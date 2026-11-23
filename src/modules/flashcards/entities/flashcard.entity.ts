import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Question } from '../../practice-test/entities/question.entity';

@Entity({ name: 'flashcards' })
@Unique(['userId', 'word'])
export class Flashcard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    // The question the word was picked from
    @ManyToOne(() => Question, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'question_id' })
    question: Question | null;

    @Column({ name: 'question_id', type: 'uuid', nullable: true })
    questionId: string | null;

    @Column({ type: 'text' })
    word: string;

    @Column({ type: 'text' })
    definition: string;

    // The sentence the word appeared in
    @Column({ type: 'text', nullable: true })
    context: string | null;

    // Days until the next review; 0 means card hasn'e been reviewed yet
    @Column({ name: 'interval_days', type: 'int', default: 0 })
    intervalDays: number;

    // New cards are due straight away
    @Column({ name: 'due_at', type: 'timestamptz', default: () => 'now()' })
    dueAt: Date;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}