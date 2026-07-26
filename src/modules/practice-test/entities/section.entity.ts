import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

import { Section as SectionName } from '../enums/practice-test.enums';
import { PracticeTest } from './practice-test.entity';
import { Module } from './module.entity';

@Entity({ name: 'sections' })
@Unique(['testId', 'name'])
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PracticeTest, (test) => test.sections, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'test_id' })
    test: PracticeTest;

    @Column({ name: 'test_id', type: 'uuid' })
    testId: string;

    @Column({ type: 'enum', enum: SectionName })
    name: SectionName;

    @Column({ type: 'text', nullable: true })
    directions: string | null;

    @OneToMany(() => Module, (module) => module.section)
    modules: Module[];
}
