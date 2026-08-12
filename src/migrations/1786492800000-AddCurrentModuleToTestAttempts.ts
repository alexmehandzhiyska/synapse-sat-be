import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrentModuleToTestAttempts1786492800000 implements MigrationInterface {
    name = 'AddCurrentModuleToTestAttempts1786492800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD "current_module_index" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP COLUMN "current_module_index"`);
    }

}