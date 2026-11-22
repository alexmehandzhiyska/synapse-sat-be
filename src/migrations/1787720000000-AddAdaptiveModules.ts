import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdaptiveModules1787720000000 implements MigrationInterface {
    name = 'AddAdaptiveModules1787720000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."modules_variant_enum" AS ENUM('easy', 'hard')`);
        await queryRunner.query(`ALTER TABLE "modules" ADD "variant" "public"."modules_variant_enum"`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "ck_module_variant_only_on_second" CHECK ("position" = 2 OR "variant" IS NULL)`);

        // Every existing module 2 becomes the hard version, and each of those sections gets an empty easy module 2
        await queryRunner.query(`UPDATE "modules" SET "variant" = 'hard' WHERE "position" = 2`);
        await queryRunner.query(`INSERT INTO "modules" ("section_id", "position", "variant") SELECT "section_id", 2, 'easy' FROM "modules" WHERE "position" = 2 AND "variant" = 'hard'`);

        await queryRunner.query(`ALTER TABLE "test_attempts" ADD "module_routes" jsonb NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP COLUMN "module_routes"`);
        await queryRunner.query(`DELETE FROM "modules" WHERE "variant" = 'easy'`);
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "ck_module_variant_only_on_second"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "variant"`);
        await queryRunner.query(`DROP TYPE "public"."modules_variant_enum"`);
    }
}
