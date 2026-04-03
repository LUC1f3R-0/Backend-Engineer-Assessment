import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTestColumnFromProducts1775250000000 implements MigrationInterface {
  name = 'RemoveTestColumnFromProducts1775250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('products', 'test')) {
      await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "test"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('products', 'test'))) {
      await queryRunner.query(`ALTER TABLE "products" ADD COLUMN "test" varchar(255)`);
    }
  }
}
