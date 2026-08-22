import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToUsers1787394628976 implements MigrationInterface {
    name = 'AddIsActiveToUsers1787394628976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
    }

}