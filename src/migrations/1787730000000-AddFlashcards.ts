import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFlashcards1787730000000 implements MigrationInterface {
    name = 'AddFlashcards1787730000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "flashcards" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "question_id" uuid,
                "word" text NOT NULL,
                "definition" text NOT NULL,
                "context" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_flashcards_user_word" UNIQUE ("user_id", "word"),
                CONSTRAINT "PK_flashcards" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "flashcards" ADD CONSTRAINT "FK_flashcards_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flashcards" ADD CONSTRAINT "FK_flashcards_question" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "flashcards"`);
    }
}