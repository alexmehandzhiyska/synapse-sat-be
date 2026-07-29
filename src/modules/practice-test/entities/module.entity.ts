import {
    Check,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Section } from './section.entity';
import { Question } from './question.entity';

@Entity({ name: 'modules' })
@Check('ck_module_position', `"position" IN (1, 2)`)
export class Module {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Section, (section) => section.modules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @Column({ name: 'section_id', type: 'uuid' })
    sectionId: string;

    @Column({ type: 'int' })
    position: number; // 1 or 2

    @OneToMany(() => Question, (question) => question.module)
    questions: Question[];
}