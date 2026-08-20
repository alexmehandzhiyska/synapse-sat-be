import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudyPlans1787213196000 implements MigrationInterface {
    name = 'AddStudyPlans1787213196000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "study_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "goal_score" integer NOT NULL, "prep_start_date" date NOT NULL, "test_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_study_plans_user_id" UNIQUE ("user_id"), CONSTRAINT "PK_study_plans_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "study_plans" ADD CONSTRAINT "FK_study_plans_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "study_plans"`);
    }

}