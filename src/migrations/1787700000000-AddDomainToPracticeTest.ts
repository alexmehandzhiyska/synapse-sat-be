import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDomainToPracticeTest1787700000000 implements MigrationInterface {
    name = 'AddDomainToPracticeTest1787700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."practice_tests_domain_enum" AS ENUM(
                'information_and_ideas',
                'craft_and_structure',
                'expression_of_ideas',
                'standard_english_conventions',
                'algebra',
                'advanced_math',
                'problem_solving_and_data_analysis',
                'geometry_and_trigonometry'
            )
        `);

        await queryRunner.query(`ALTER TABLE "practice_tests" ADD "domain" "public"."practice_tests_domain_enum"`);

        // A domain is only ever meaningful on a check-in test - other test types never carry one.
        await queryRunner.query(`ALTER TABLE "practice_tests" ADD CONSTRAINT "ck_domain_only_on_check_in" CHECK ("type" = 'check_in' OR "domain" IS NULL)`);

        // At most one check-in test per domain.
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_practice_tests_check_in_domain" ON "practice_tests" ("domain") WHERE "type" = 'check_in'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_practice_tests_check_in_domain"`);
        await queryRunner.query(`ALTER TABLE "practice_tests" DROP CONSTRAINT "ck_domain_only_on_check_in"`);
        await queryRunner.query(`ALTER TABLE "practice_tests" DROP COLUMN "domain"`);
        await queryRunner.query(`DROP TYPE "public"."practice_tests_domain_enum"`);
    }

}