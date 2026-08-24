import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLessons1787680000000 implements MigrationInterface {
    name = 'AddLessons1787680000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."lessons_domain_enum" AS ENUM(
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

        await queryRunner.query(`
            CREATE TABLE "lessons" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "domain" "public"."lessons_domain_enum" NOT NULL,
                "position" integer NOT NULL,
                "title" text NOT NULL,
                "video_url" text NOT NULL,
                CONSTRAINT "PK_lessons" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "lessons"`);
        await queryRunner.query(`DROP TYPE "public"."lessons_domain_enum"`);
    }

}