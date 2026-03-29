import { existsSync } from 'fs';
import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { Product } from '../modules/products/entities/product.entity';

function resolveBackendRoot(): string {
  const cwd = process.cwd();
  if (existsSync(join(cwd, 'apps', 'backend', '.env'))) {
    return join(cwd, 'apps', 'backend');
  }
  if (existsSync(join(cwd, '.env'))) {
    return cwd;
  }
  return cwd;
}

const backendRoot = resolveBackendRoot();

dotenv.config({ path: join(backendRoot, '.env') });

const migrationGlob = join(backendRoot, 'src', 'migrations', '*{.ts,.js}');

export function getTypeOrmConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'mo_lk_assessment',
    // Empty for TypeORM CLI (migrations/seed); register entity classes in Nest `TypeOrmModule.forRoot`.
    entities: [],
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING === 'true',
  };
}

export function getDataSourceOptions(): DataSourceOptions {
  return {
    ...getTypeOrmConfig(),
    migrations: [migrationGlob],
  };
}

export function getNestTypeOrmConfig(): TypeOrmModuleOptions {
  return {
    ...getTypeOrmConfig(),
    entities: [Product, Order, OrderItem],
  };
}

const AppDataSource = new DataSource(getDataSourceOptions());

export default AppDataSource;
