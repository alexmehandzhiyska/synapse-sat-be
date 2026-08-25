import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Lesson } from './lesson.entity';

@Entity({ name: 'lesson_progress' })
@Unique(['userId', 'lessonId'])
export class LessonProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lesson_id' })
    lesson: Lesson;

    @Column({ name: 'lesson_id', type: 'uuid' })
    lessonId: string;

    @Column({ name: 'watched_at', type: 'timestamptz' })
    watchedAt: Date;
}
