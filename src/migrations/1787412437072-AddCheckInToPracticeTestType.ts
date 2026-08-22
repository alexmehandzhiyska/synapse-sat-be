import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCheckInToPracticeTestType1787412437072 implements MigrationInterface {
    name = 'AddCheckInToPracticeTestType1787412437072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."practice_tests_type_enum" ADD VALUE 'check_in'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."practice_tests_type_enum" RENAME TO "practice_tests_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."practice_tests_type_enum" AS ENUM('diagnostic', 'standard')`);
        await queryRunner.query(`ALTER TABLE "practice_tests" ALTER COLUMN "type" TYPE "public"."practice_tests_type_enum" USING "type"::text::"public"."practice_tests_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."practice_tests_type_enum_old"`);
    }

}