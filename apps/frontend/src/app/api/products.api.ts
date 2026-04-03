import type { Product } from '../types/product';
import { httpClient } from './http-client';

export type ProductsPagePayload = {
  items: Product[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

/** Nest `TransformInterceptor` wraps JSON bodies as `{ data: T }`. */
function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  throw new Error('Unexpected API response shape');
}

export async function fetchProductsPage(
  params: Record<string, string | number>,
): Promise<ProductsPagePayload> {
  const res = await httpClient.get<unknown>('/api/products', {
    params,
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
  return unwrapData<ProductsPagePayload>(res.data);
}

export async function fetchProductCategories(): Promise<string[]> {
  const res = await httpClient.get<unknown>('/api/products/categories');
  return unwrapData<string[]>(res.data);
}
