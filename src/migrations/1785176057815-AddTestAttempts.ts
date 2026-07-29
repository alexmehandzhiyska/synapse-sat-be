import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestAttempts1785176057815 implements MigrationInterface {
    name = 'AddTestAttempts1785176057815'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sections_name_enum" AS ENUM('reading_writing', 'math')`);
        await queryRunner.query(`CREATE TABLE "sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "test_id" uuid NOT NULL, "name" "public"."sections_name_enum" NOT NULL, "directions" text, CONSTRAINT "UQ_cb4452edd82fc70fbf1cc63f213" UNIQUE ("test_id", "name"), CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sections" ADD CONSTRAINT "FK_5ed53d954b17aed9d721f0738da" FOREIGN KEY ("test_id") REFERENCES "practice_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`
            INSERT INTO "sections" ("test_id", "name")
            SELECT DISTINCT "test_id", "section"::text::"public"."sections_name_enum" FROM "modules"
        `);

        await queryRunner.query(`ALTER TABLE "modules" ADD "section_id" uuid`);
        await queryRunner.query(`
            UPDATE "modules" m
            SET "section_id" = s."id"
            FROM "sections" s
            WHERE s."test_id" = m."test_id" AND s."name"::text = m."section"::text
        `);
        await queryRunner.query(`ALTER TABLE "modules" ALTER COLUMN "section_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_81b6cef6c056753a9f357b42bb6" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_565936603be68f07cad161025ad"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "test_id"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "section"`);
        await queryRunner.query(`DROP TYPE "public"."modules_section_enum"`);

        await queryRunner.query(`CREATE TABLE "test_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "test_id" uuid NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "completed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d40272f8162c607f12e76c0a18e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "test_attempt_id" uuid NOT NULL, "question_id" uuid NOT NULL, "selected_choice_id" uuid, "answered_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_69701a9f6c7a025215581a7d9c5" UNIQUE ("test_attempt_id", "question_id"), CONSTRAINT "PK_08977c1a2a5f1b8b472dbd87d04" PRIMARY KEY ("id"))`);

        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_test_attempts_active_user_test" ON "test_attempts" ("user_id", "test_id") WHERE "completed_at" IS NULL`);

        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_193bbf9a4f34822e0aa41fefc92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_88b08b09eb90ae8d6afb2147b5e" FOREIGN KEY ("test_id") REFERENCES "practice_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD CONSTRAINT "FK_c60ddec7db81d6a2e63ac7982fe" FOREIGN KEY ("test_attempt_id") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD CONSTRAINT "FK_adae59e684b873b084be36c5a7a" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD CONSTRAINT "FK_49ee107e72d22b790c20ca7a58b" FOREIGN KEY ("selected_choice_id") REFERENCES "answer_choices"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answers" DROP CONSTRAINT "FK_49ee107e72d22b790c20ca7a58b"`);
        await queryRunner.query(`ALTER TABLE "user_answers" DROP CONSTRAINT "FK_adae59e684b873b084be36c5a7a"`);
        await queryRunner.query(`ALTER TABLE "user_answers" DROP CONSTRAINT "FK_c60ddec7db81d6a2e63ac7982fe"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_88b08b09eb90ae8d6afb2147b5e"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_193bbf9a4f34822e0aa41fefc92"`);

        await queryRunner.query(`DROP INDEX "public"."UQ_test_attempts_active_user_test"`);

        await queryRunner.query(`DROP TABLE "user_answers"`);
        await queryRunner.query(`DROP TABLE "test_attempts"`);

        await queryRunner.query(`CREATE TYPE "public"."modules_section_enum" AS ENUM('reading_writing', 'math')`);
        await queryRunner.query(`ALTER TABLE "modules" ADD "section" "public"."modules_section_enum"`);
        await queryRunner.query(`ALTER TABLE "modules" ADD "test_id" uuid`);
        await queryRunner.query(`
            UPDATE "modules" m
            SET "test_id" = s."test_id", "section" = s."name"::text::"public"."modules_section_enum"
            FROM "sections" s
            WHERE s."id" = m."section_id"
        `);
        await queryRunner.query(`ALTER TABLE "modules" ALTER COLUMN "section" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "modules" ALTER COLUMN "test_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_565936603be68f07cad161025ad" FOREIGN KEY ("test_id") REFERENCES "practice_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_81b6cef6c056753a9f357b42bb6"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "section_id"`);

        await queryRunner.query(`ALTER TABLE "sections" DROP CONSTRAINT "FK_5ed53d954b17aed9d721f0738da"`);
        await queryRunner.query(`DROP TABLE "sections"`);
        await queryRunner.query(`DROP TYPE "public"."sections_name_enum"`);
    }

}