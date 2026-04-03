import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { loadEnv, resolveBackendRoot } from './load-env';
import { DevicePushToken } from '../modules/devices/entities/device-push-token.entity';
import { Device } from '../modules/devices/entities/device.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { Product } from '../modules/products/entities/product.entity';

loadEnv();

const backendRoot = resolveBackendRoot();

const migrationGlob = join(backendRoot, 'src', 'migrations', '*{.ts,.js}');

export function getTypeOrmConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'mo_lk_assessment',
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
    entities: [Product, Order, OrderItem, Device, DevicePushToken],
  };
}

const AppDataSource = new DataSource(getDataSourceOptions());

export default AppDataSource;
