import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUsersColumnsToSnakeCase1787750000000 implements MigrationInterface {
    name = 'RenameUsersColumnsToSnakeCase1787750000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "firstName" TO "first_name"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "lastName" TO "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "resetCodeHash" TO "reset_code_hash"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "resetCodeExpiresAt" TO "reset_code_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "isActive" TO "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "is_active" TO "isActive"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "reset_code_expires_at" TO "resetCodeExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "reset_code_hash" TO "resetCodeHash"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password_hash" TO "passwordHash"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "last_name" TO "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName"`);
    }
}
