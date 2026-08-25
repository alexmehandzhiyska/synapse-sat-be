import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Domain, TestType } from '../enums/practice-test.enums';
import { Section } from './section.entity';

@Entity({ name: 'practice_tests' })
export class PracticeTest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'enum', enum: TestType })
    type: TestType;

    // Only set for custom packets - the student the packet was generated for.
    @Column({ name: 'owner_id', type: 'uuid', nullable: true })
    ownerId: string | null;

    // Only set for check-in tests - the domain the check-in test is scoped to.
    @Column({ type: 'enum', enum: Domain, nullable: true })
    domain: Domain | null;

    @OneToMany(() => Section, (section) => section.test, { cascade: ['insert'] })
    sections: Section[];

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}