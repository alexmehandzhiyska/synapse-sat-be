import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Domain } from '../../practice-test/enums/practice-test.enums';

@Entity({ name: 'lessons' })
export class Lesson {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: Domain })
    domain: Domain;

    @Column({ type: 'int' })
    position: number;

    @Column({ type: 'text' })
    title: string;

    @Column({ name: 'video_url', type: 'text' })
    videoUrl: string;
}