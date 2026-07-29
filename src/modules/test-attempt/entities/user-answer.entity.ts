import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { AnswerChoice } from '../../practice-test/entities/answer-choice.entity';
import { Question } from '../../practice-test/entities/question.entity';
import { TestAttempt } from './test-attempt.entity';

@Entity({ name: 'user_answers' })
@Unique(['testAttemptId', 'questionId'])
export class UserAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TestAttempt, (testAttempt) => testAttempt.answers, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'test_attempt_id' })
    testAttempt: TestAttempt;

    @Column({ name: 'test_attempt_id', type: 'uuid' })
    testAttemptId: string;

    @ManyToOne(() => Question, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: Question;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @ManyToOne(() => AnswerChoice, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'selected_choice_id' })
    selectedChoice: AnswerChoice | null;

    @Column({ name: 'selected_choice_id', type: 'uuid', nullable: true })
    selectedChoiceId: string | null;

    @Column({ name: 'answered_at', type: 'timestamptz', nullable: true })
    answeredAt: Date | null;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}