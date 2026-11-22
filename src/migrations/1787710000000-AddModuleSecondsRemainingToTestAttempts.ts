import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModuleSecondsRemainingToTestAttempts1787710000000 implements MigrationInterface {
    name = 'AddModuleSecondsRemainingToTestAttempts1787710000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD "module_seconds_remaining" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP COLUMN "module_seconds_remaining"`);
    }
}
