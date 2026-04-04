import { BadRequestException } from '@nestjs/common';

const SORT_VALUES = new Set([
  'featured',
  'price_asc',
  'price_desc',
  'newest',
  'name_asc',
  'name_desc',
]);

export type ProductListFilters = {
  categories?: string;
  q?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
};

export type ParsedProductListQuery = {
  page: number;
  limit: number;
  filters: ProductListFilters;
};

function firstQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

function parsePositiveInt(raw: unknown, fallback: number): number {
  const s = firstQueryString(raw)?.trim();
  if (s === undefined || s === '') {
    return fallback;
  }
  const n = parseInt(s, 10);
  if (!Number.isFinite(n)) {
    throw new BadRequestException(`Invalid integer: ${String(raw)}`);
  }
  return n;
}

/**
 * Validates query parameters for GET /products at the HTTP boundary.
 * `limit` is constrained here (1–8); ProductsService also enforces a max page size of 8.
 */
export function parseProductListQuery(query: Record<string, unknown>): ParsedProductListQuery {
  const page = parsePositiveInt(query.page, 1);
  const limit = parsePositiveInt(query.limit, 8);

  if (page < 1) {
    throw new BadRequestException('page must be >= 1');
  }
  if (limit < 1 || limit > 8) {
    throw new BadRequestException('limit must be between 1 and 8');
  }

  const sortRaw = firstQueryString(query.sort)?.trim();
  let sort: string | undefined;
  if (sortRaw) {
    if (!SORT_VALUES.has(sortRaw)) {
      throw new BadRequestException(
        `sort must be one of: ${[...SORT_VALUES].join(', ')}`,
      );
    }
    sort = sortRaw;
  }

  const minPrice = firstQueryString(query.minPrice)?.trim();
  const maxPrice = firstQueryString(query.maxPrice)?.trim();
  if (minPrice !== undefined && minPrice !== '') {
    if (Number.isNaN(parseFloat(minPrice))) {
      throw new BadRequestException('minPrice must be a number');
    }
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    if (Number.isNaN(parseFloat(maxPrice))) {
      throw new BadRequestException('maxPrice must be a number');
    }
  }

  const filters: ProductListFilters = {
    categories: firstQueryString(query.categories)?.trim() || undefined,
    q: firstQueryString(query.q)?.trim() || undefined,
    search: firstQueryString(query.search)?.trim() || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    inStock: firstQueryString(query.inStock)?.trim() || undefined,
    sort,
  };

  return { page, limit, filters };
}
