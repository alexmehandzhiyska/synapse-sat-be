import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Question } from './question.entity';

@Entity({ name: 'answer_choices' })
export class AnswerChoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Question, (question) => question.answerChoices, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'question_id' })
    question: Question;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @Column({ type: 'text' })
    label: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'is_correct', type: 'boolean', default: false })
    isCorrect: boolean;
}