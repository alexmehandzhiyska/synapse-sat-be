import { MigrationInterface, QueryRunner } from "typeorm";

export class InitPracticeTest1783854725909 implements MigrationInterface {
    name = 'InitPracticeTest1783854725909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "refreshTokenHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."practice_tests_type_enum" AS ENUM('diagnostic', 'standard')`);
        await queryRunner.query(`CREATE TABLE "practice_tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "type" "public"."practice_tests_type_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b19d001a2c64c366604a914342c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."modules_section_enum" AS ENUM('reading_writing', 'math')`);
        await queryRunner.query(`CREATE TABLE "modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "test_id" uuid NOT NULL, "section" "public"."modules_section_enum" NOT NULL, "position" integer NOT NULL, CONSTRAINT "ck_module_position" CHECK ("position" IN (1, 2)), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."questions_section_enum" AS ENUM('reading_writing', 'math')`);
        await queryRunner.query(`CREATE TYPE "public"."questions_domain_enum" AS ENUM('information_and_ideas', 'craft_and_structure', 'expression_of_ideas', 'standard_english_conventions', 'algebra', 'advanced_math', 'problem_solving_and_data_analysis', 'geometry_and_trigonometry')`);
        await queryRunner.query(`CREATE TYPE "public"."questions_difficulty_enum" AS ENUM('easy', 'medium', 'hard')`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "module_id" uuid NOT NULL, "section" "public"."questions_section_enum" NOT NULL, "domain" "public"."questions_domain_enum" NOT NULL, "prompt" text NOT NULL, "difficulty" "public"."questions_difficulty_enum" NOT NULL, "position" integer NOT NULL, CONSTRAINT "ck_domain_matches_section" CHECK ((
    (section = 'reading_writing' AND domain IN (
      'information_and_ideas', 'craft_and_structure',
      'expression_of_ideas', 'standard_english_conventions'))
    OR
    (section = 'math' AND domain IN (
      'algebra', 'advanced_math',
      'problem_solving_and_data_analysis', 'geometry_and_trigonometry'))
  )), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answer_choices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "label" text NOT NULL, "content" text NOT NULL, "is_correct" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cbf1326fe9c8ef5df5b83eb946f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_565936603be68f07cad161025ad" FOREIGN KEY ("test_id") REFERENCES "practice_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_38b0861501e1d53dc394c00b895" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_choices" ADD CONSTRAINT "FK_9ff8a29f89cdd06802e6fbcfebb" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer_choices" DROP CONSTRAINT "FK_9ff8a29f89cdd06802e6fbcfebb"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_38b0861501e1d53dc394c00b895"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_565936603be68f07cad161025ad"`);
        await queryRunner.query(`DROP TABLE "answer_choices"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TYPE "public"."questions_difficulty_enum"`);
        await queryRunner.query(`DROP TYPE "public"."questions_domain_enum"`);
        await queryRunner.query(`DROP TYPE "public"."questions_section_enum"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP TYPE "public"."modules_section_enum"`);
        await queryRunner.query(`DROP TABLE "practice_tests"`);
        await queryRunner.query(`DROP TYPE "public"."practice_tests_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
