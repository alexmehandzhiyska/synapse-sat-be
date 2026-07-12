import {
    Check,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Section } from '../enums/practice-test.enums';
import { PracticeTest } from './practice-test.entity';
import { Question } from './question.entity';

@Entity({ name: 'modules' })
@Check('ck_module_position', `"position" IN (1, 2)`)
export class Module {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PracticeTest, (test) => test.modules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'test_id' })
    test: PracticeTest;

    @Column({ name: 'test_id', type: 'uuid' })
    testId: string;

    @Column({ type: 'enum', enum: Section })
    section: Section;

    @Column({ type: 'int' })
    position: number; // 1 or 2

    @OneToMany(() => Question, (question) => question.module)
    questions: Question[];
}