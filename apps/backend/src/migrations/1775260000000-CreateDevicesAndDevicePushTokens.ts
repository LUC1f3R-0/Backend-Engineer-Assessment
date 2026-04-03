import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDevicesAndDevicePushTokens1775260000000 implements MigrationInterface {
  name = 'CreateDevicesAndDevicePushTokens1775260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "secret_hash" varchar(64) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_devices" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "device_push_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" uuid NOT NULL,
        "platform" varchar(32) NOT NULL DEFAULT 'web',
        "token" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_push_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_device_push_tokens_device_id" UNIQUE ("device_id"),
        CONSTRAINT "FK_device_push_tokens_device_id" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_device_push_tokens_device_id" ON "device_push_tokens" ("device_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "device_push_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "devices"`);
  }
}
