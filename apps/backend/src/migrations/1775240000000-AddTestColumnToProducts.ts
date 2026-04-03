import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTestColumnToProducts1775240000000 implements MigrationInterface {
  name = 'AddTestColumnToProducts1775240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('products', 'test'))) {
      await queryRunner.query(`ALTER TABLE "products" ADD COLUMN "test" varchar(255)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('products', 'test')) {
      await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "test"`);
    }
  }
}
