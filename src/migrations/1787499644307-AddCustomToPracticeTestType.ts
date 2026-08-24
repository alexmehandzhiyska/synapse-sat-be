import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomToPracticeTestType1787499644307 implements MigrationInterface {
    name = 'AddCustomToPracticeTestType1787499644307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."practice_tests_type_enum" ADD VALUE 'custom'`);
        await queryRunner.query(`ALTER TABLE "practice_tests" ADD "owner_id" uuid`);
        await queryRunner.query(`ALTER TABLE "practice_tests" ADD CONSTRAINT "FK_practice_tests_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practice_tests" DROP CONSTRAINT "FK_practice_tests_owner_id"`);
        await queryRunner.query(`ALTER TABLE "practice_tests" DROP COLUMN "owner_id"`);

        await queryRunner.query(`ALTER TYPE "public"."practice_tests_type_enum" RENAME TO "practice_tests_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."practice_tests_type_enum" AS ENUM('diagnostic', 'standard', 'check_in')`);
        await queryRunner.query(`ALTER TABLE "practice_tests" ALTER COLUMN "type" TYPE "public"."practice_tests_type_enum" USING "type"::text::"public"."practice_tests_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."practice_tests_type_enum_old"`);
    }

}
