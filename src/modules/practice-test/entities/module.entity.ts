import {
    Check,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ModuleVariant } from '../enums/practice-test.enums';
import { Section } from './section.entity';
import { Question } from './question.entity';

@Entity({ name: 'modules' })
@Check('ck_module_position', `"position" IN (1, 2)`)
@Check('ck_module_variant_only_on_second', `"position" = 2 OR "variant" IS NULL`)
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

    // Set only on module 2 of full tests; null for module 1, check-ins and custom packets
    @Column({ type: 'enum', enum: ModuleVariant, nullable: true })
    variant: ModuleVariant | null;

    @OneToMany(() => Question, (question) => question.module)
    questions: Question[];
}