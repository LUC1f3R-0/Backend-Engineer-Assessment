import 'reflect-metadata';
import AppDataSource from '../config/database.config';
import { PRODUCTS_SEED_DATA } from './products.seed';

async function seedProducts(): Promise<void> {
  if (PRODUCTS_SEED_DATA.length !== 50) {
    throw new Error(`Expected 50 products, got ${PRODUCTS_SEED_DATA.length}`);
  }

  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    for (const row of PRODUCTS_SEED_DATA) {
      await queryRunner.query(
        `INSERT INTO products (sku, name, description, category, tags, price, stock, image_url)
         VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8)
         ON CONFLICT (sku) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           category = EXCLUDED.category,
           tags = EXCLUDED.tags,
           price = EXCLUDED.price,
           stock = EXCLUDED.stock,
           image_url = EXCLUDED.image_url,
           updated_at = now()`,
        [
          row.sku,
          row.name,
          row.description,
          row.category,
          row.tags,
          row.price,
          row.stock,
          row.imageUrl,
        ],
      );
    }
    await queryRunner.commitTransaction();
    console.log(`Seeded ${PRODUCTS_SEED_DATA.length} products (upsert on sku).`);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seedProducts().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
