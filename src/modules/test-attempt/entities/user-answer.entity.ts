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
import { ModuleAttempt } from './module-attempt.entity';

@Entity({ name: 'user_answers' })
@Unique(['moduleAttemptId', 'questionId'])
export class UserAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => ModuleAttempt, (moduleAttempt) => moduleAttempt.answers, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'module_attempt_id' })
    moduleAttempt: ModuleAttempt;

    @Column({ name: 'module_attempt_id', type: 'uuid' })
    moduleAttemptId: string;

    @ManyToOne(() => Question, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: Question;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @ManyToOne(() => AnswerChoice, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'selected_answer_choice_id' })
    selectedAnswerChoice: AnswerChoice | null;

    @Column({ name: 'selected_answer_choice_id', type: 'uuid', nullable: true })
    selectedAnswerChoiceId: string | null;

    @Column({ name: 'answered_at', type: 'timestamptz', nullable: true })
    answeredAt: Date | null;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
