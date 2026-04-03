import { existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

/**
 * Resolves the directory that contains backend `.env` (monorepo root vs apps/backend cwd).
 */
export function resolveBackendRoot(): string {
  const cwd = process.cwd();
  if (existsSync(join(cwd, 'apps', 'backend', '.env'))) {
    return join(cwd, 'apps', 'backend');
  }
  if (existsSync(join(cwd, '.env'))) {
    return cwd;
  }
  return cwd;
}

let loaded = false;

/** Idempotent: safe to call from main, database CLI config, and tests. */
export function loadEnv(): void {
  if (loaded) {
    return;
  }
  const root = resolveBackendRoot();
  dotenv.config({ path: join(root, '.env') });
  loaded = true;
}
