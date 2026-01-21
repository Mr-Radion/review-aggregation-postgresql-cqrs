import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1769030530016 implements MigrationInterface {
    name = 'InitMigration1769030530016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipientId" uuid NOT NULL, "authorId" uuid NOT NULL, "rating" smallint NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_bec6af4db719c29178a7a54944" CHECK ("recipientId" <> "authorId"), CONSTRAINT "CHK_e87bbcfbe3ea0dda3d626010ee" CHECK ("rating" >= 1 AND "rating" <= 5), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_48770372f891b9998360e4434f" ON "reviews" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c81332d9361a5598ffd7100813" ON "reviews" ("recipientId") `);
        await queryRunner.query(`CREATE TABLE "seller_review_agg" ("recipientId" uuid NOT NULL, "reviewCount" integer NOT NULL DEFAULT '0', "ratingSum" integer NOT NULL DEFAULT '0', "ratingDistribution" jsonb NOT NULL DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_9b98dab496b30464cdc81813ec" CHECK ("ratingSum" >= 0), CONSTRAINT "CHK_47b2cc71dea028bee6e614e482" CHECK ("reviewCount" >= 0), CONSTRAINT "PK_36405a6329c85a4d85e03c79b73" PRIMARY KEY ("recipientId"))`);
        await queryRunner.query(`CREATE OR REPLACE VIEW "seller_review_agg_view" AS 
            SELECT 
                a."recipientId" as "recipientId",
                a."reviewCount" as "reviewCount",
                CASE 
                    WHEN a."reviewCount" > 0 
                    THEN ROUND((a."ratingSum"::numeric / a."reviewCount")::numeric, 2) 
                    ELSE NULL 
                END as "avgRating",
                a."ratingDistribution" as "ratingDistribution",
                a."updatedAt" as "updatedAt"
            FROM "seller_review_agg" a`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS "seller_review_agg_view"`);
        await queryRunner.query(`DROP TABLE "seller_review_agg"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c81332d9361a5598ffd7100813"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48770372f891b9998360e4434f"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
