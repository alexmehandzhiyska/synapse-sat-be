import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetFieldsToUsers1787062656977 implements MigrationInterface {
    name = 'AddPasswordResetFieldsToUsers1787062656977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetCodeHash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetCodeExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetCodeExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetCodeHash"`);
    }

}
