import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceIdToOrders1775270000000 implements MigrationInterface {
  name = 'AddDeviceIdToOrders1775270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "device_id" uuid NULL`);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_device_id"
      FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_device_id" ON "orders" ("device_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_device_id"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_device_id"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "device_id"`);
  }
}
