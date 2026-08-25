import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLessonProgress1787690000000 implements MigrationInterface {
    name = 'AddLessonProgress1787690000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lesson_progress" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "lesson_id" uuid NOT NULL,
                "watched_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "UQ_lesson_progress_user_lesson" UNIQUE ("user_id", "lesson_id"),
                CONSTRAINT "PK_lesson_progress" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "lesson_progress" ADD CONSTRAINT "FK_lesson_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_progress" ADD CONSTRAINT "FK_lesson_progress_lesson" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "lesson_progress"`);
    }

}
