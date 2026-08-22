import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultDifficultyToQuestions1787382654433 implements MigrationInterface {
    name = 'AddDefaultDifficultyToQuestions1787382654433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "difficulty" SET DEFAULT 'easy'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "difficulty" DROP DEFAULT`);
    }

}
