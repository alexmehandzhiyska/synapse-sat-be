import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'reset_code_hash', nullable: true })
    resetCodeHash: string | null;

    @Column({ name: 'reset_code_expires_at', type: 'timestamp', nullable: true })
    resetCodeExpiresAt: Date | null;

    @Column({ nullable: true })
    country: string | null;

    @Column({ nullable: true })
    city: string | null;

    @Column({ nullable: true })
    school: string | null;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}