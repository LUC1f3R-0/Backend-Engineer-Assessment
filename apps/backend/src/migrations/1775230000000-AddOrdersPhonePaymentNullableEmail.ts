import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Brings `orders` in line with `Order` entity when the live DB is still on the
 * original table shape (missing phone/payment, email NOT NULL).
 * Safe if columns already exist (e.g. an earlier migration already ran).
 */
export class AddOrdersPhonePaymentNullableEmail1775230000000 implements MigrationInterface {
  name = 'AddOrdersPhonePaymentNullableEmail1775230000000';

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
    if (await queryRunner.hasColumn('orders', 'payment_method')) {
      await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method"`);
    }
    if (await queryRunner.hasColumn('orders', 'customer_phone')) {
      await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customer_phone"`);
    }
  }
}
