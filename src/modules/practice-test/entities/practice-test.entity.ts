import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { TestType } from '../enums/practice-test.enums';
import { Section } from './section.entity';

@Entity({ name: 'practice_tests' })
export class PracticeTest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'enum', enum: TestType })
    type: TestType;

    @OneToMany(() => Section, (section) => section.test)
    sections: Section[];

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}