import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRefreshTokenHashFromUsers1787170914209 implements MigrationInterface {
    name = 'RemoveRefreshTokenHashFromUsers1787170914209'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenHash"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenHash" character varying`);
    }

}