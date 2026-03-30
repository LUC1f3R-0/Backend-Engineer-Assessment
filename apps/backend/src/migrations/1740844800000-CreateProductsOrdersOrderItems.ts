import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsOrdersOrderItems1740844800000 implements MigrationInterface {
  name = 'CreateProductsOrdersOrderItems1740844800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sku" varchar(64) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "category" varchar(120) NOT NULL,
        "tags" text[] NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "image_url" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_name" varchar(255) NOT NULL,
        "customer_email" varchar(255) NOT NULL,
        "delivery_address" text NOT NULL,
        "subtotal" numeric(10,2) NOT NULL,
        "tax_amount" numeric(10,2) NOT NULL,
        "delivery_fee" numeric(10,2) NOT NULL,
        "total_amount" numeric(10,2) NOT NULL,
        "status" varchar(50) NOT NULL,
        "idempotency_key" varchar(128) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_idempotency_key" UNIQUE ("idempotency_key")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "line_total" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_products_category" ON "products" ("category")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_products_price" ON "products" ("price")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_products_created_at" ON "products" ("created_at")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_products_stock" ON "products" ("stock")`);

    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_product_id" ON "order_items" ("product_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}
