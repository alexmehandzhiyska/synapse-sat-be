import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFlashcardReviewSchedule1787740000000 implements MigrationInterface {
    name = 'AddFlashcardReviewSchedule1787740000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flashcards" ADD "interval_days" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "flashcards" ADD "due_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flashcards" DROP COLUMN "due_at"`);
        await queryRunner.query(`ALTER TABLE "flashcards" DROP COLUMN "interval_days"`);
    }
}