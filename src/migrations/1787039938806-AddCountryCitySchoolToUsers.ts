import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryCitySchoolToUsers1787039938806 implements MigrationInterface {
    name = 'AddCountryCitySchoolToUsers1787039938806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "country" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "school" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "school"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
    }

}
