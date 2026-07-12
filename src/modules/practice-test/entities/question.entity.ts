import {
    Check,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Difficulty, Domain, Section } from '../enums/practice-test.enums';
import { Module } from './module.entity';
import { AnswerChoice } from './answer-choice.entity';

@Entity({ name: 'questions' })
@Check(
    'ck_domain_matches_section',
    `(
    (section = 'reading_writing' AND domain IN (
      'information_and_ideas', 'craft_and_structure',
      'expression_of_ideas', 'standard_english_conventions'))
    OR
    (section = 'math' AND domain IN (
      'algebra', 'advanced_math',
      'problem_solving_and_data_analysis', 'geometry_and_trigonometry'))
  )`,
)
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Module, (module) => module.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'module_id' })
    module: Module;

    @Column({ name: 'module_id', type: 'uuid' })
    moduleId: string;

    // Purposful denormalization - copy of the section so that section/domain CHECK can be run successfully.
    @Column({ type: 'enum', enum: Section })
    section: Section;

    @Column({ type: 'enum', enum: Domain })
    domain: Domain;

    @Column({ type: 'text' })
    prompt: string;

    @Column({ type: 'enum', enum: Difficulty })
    difficulty: Difficulty;

    @Column({ type: 'int' })
    position: number; // order within the module (1-27)

    @OneToMany(() => AnswerChoice, (choice) => choice.question)
    answerChoices: AnswerChoice[];
}