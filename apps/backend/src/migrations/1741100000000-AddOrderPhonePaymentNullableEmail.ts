import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Aligns `orders` with `Order` entity: adds `customer_phone`, `payment_method`,
 * makes `customer_email` nullable. Required for POST /api/orders.
 * Apply with: npm run migration:run (from repository root)
 */
export class AddOrderPhonePaymentNullableEmail1741100000000 implements MigrationInterface {
  name = 'AddOrderPhonePaymentNullableEmail1741100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('orders', 'customer_phone'))) {
      await queryRunner.query(
        `ALTER TABLE "orders" ADD COLUMN "customer_phone" varchar(32) NOT NULL DEFAULT ''`,
      );
    }
    if (!(await queryRunner.hasColumn('orders', 'payment_method'))) {
      await queryRunner.query(
        `ALTER TABLE "orders" ADD COLUMN "payment_method" varchar(50) NOT NULL DEFAULT 'cash_on_delivery'`,
      );
    }
    await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "customer_email" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "orders" SET "customer_email" = '' WHERE "customer_email" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "customer_email" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customer_phone"`);
  }
}
