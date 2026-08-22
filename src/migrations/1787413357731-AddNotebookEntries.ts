import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotebookEntries1787413357731 implements MigrationInterface {
    name = 'AddNotebookEntries1787413357731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "notebook_entries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "question_id" uuid NOT NULL,
                "what" text NOT NULL,
                "why" text NOT NULL,
                "how" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_notebook_entries_user_question" UNIQUE ("user_id", "question_id"),
                CONSTRAINT "PK_notebook_entries" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "notebook_entries" ADD CONSTRAINT "FK_notebook_entries_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notebook_entries" ADD CONSTRAINT "FK_notebook_entries_question" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notebook_entries"`);
    }

}
