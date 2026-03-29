import { existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

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

const AppDataSource = new DataSource(getDataSourceOptions());

export default AppDataSource;
