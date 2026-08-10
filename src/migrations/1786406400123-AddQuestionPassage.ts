import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionPassage1786406400123 implements MigrationInterface {
    name = 'AddQuestionPassage1786406400123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ADD "passage" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "passage"`);
    }

}