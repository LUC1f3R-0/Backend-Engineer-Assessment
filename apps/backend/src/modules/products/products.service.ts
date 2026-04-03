import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import type { ProductListFilters } from './dto/product-list-query';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  /** @param limit capped at 8 */
  async findPaged(page: number, limit: number, filters: ProductListFilters = {}) {
    const safeLimit = Math.min(8, Math.max(1, limit));
    const safePageInput = Math.max(1, page);

    const qb = this.products.createQueryBuilder('p');
    this.applyFilters(qb, filters);

    const totalItems = await qb.clone().getCount();
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
    const safePage = Math.min(safePageInput, totalPages);

    this.applySort(qb, filters.sort);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const items = await qb.getMany();

    return {
      items,
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
    };
  }

  private parseNum(raw?: string): number | undefined {
    if (raw === undefined || raw === null) {
      return undefined;
    }
    const s = String(raw).trim();
    if (s === '') {
      return undefined;
    }
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : undefined;
  }

  /** Whitespace-separated tokens; each must fuzzy-match (pg_trgm %) on name, description, or any single tag. */
  private searchTokens(raw: string): string[] {
    return raw
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  private applyFilters(qb: SelectQueryBuilder<Product>, filters: ProductListFilters) {
    const cat = filters.categories?.trim();
    if (cat) {
      qb.andWhere('p.category = :cat', { cat });
    }

    const raw = filters.q?.trim() || filters.search?.trim();
    if (raw) {
      const tokens = this.searchTokens(raw);
      tokens.forEach((token, i) => {
        const key = `trgmTok${i}`;
        qb.andWhere(
          `(p.name % :${key} OR p.description % :${key} OR EXISTS (SELECT 1 FROM unnest(COALESCE(p.tags, ARRAY[]::text[])) AS tag WHERE tag % :${key}))`,
          { [key]: token },
        );
      });
    }

    const minP = this.parseNum(filters.minPrice);
    if (minP !== undefined) {
      qb.andWhere('CAST(p.price AS DECIMAL) >= :minP', { minP });
    }

    const maxP = this.parseNum(filters.maxPrice);
    if (maxP !== undefined) {
      qb.andWhere('CAST(p.price AS DECIMAL) <= :maxP', { maxP });
    }

    const inStockOnly =
      filters.inStock === '1' || filters.inStock?.toLowerCase() === 'true';
    if (inStockOnly) {
      qb.andWhere('p.stock > 0');
    }
  }

  private applySort(qb: SelectQueryBuilder<Product>, sortRaw?: string) {
    const s = sortRaw?.trim() || 'featured';
    switch (s) {
      case 'price_asc':
        qb.orderBy('CAST(p.price AS DECIMAL)', 'ASC').addOrderBy('p.id', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('CAST(p.price AS DECIMAL)', 'DESC').addOrderBy('p.id', 'ASC');
        break;
      case 'newest':
        qb.orderBy('p.createdAt', 'DESC').addOrderBy('p.id', 'DESC');
        break;
      case 'name_asc':
        qb.orderBy('p.name', 'ASC').addOrderBy('p.id', 'ASC');
        break;
      case 'name_desc':
        qb.orderBy('p.name', 'DESC').addOrderBy('p.id', 'ASC');
        break;
      default:
        qb.orderBy('p.createdAt', 'ASC').addOrderBy('p.id', 'ASC');
    }
  }

  /** Distinct non-empty categories, sorted */
  async listCategories(): Promise<string[]> {
    const rows = await this.products
      .createQueryBuilder('p')
      .select('DISTINCT p.category', 'category')
      .where('p.category IS NOT NULL')
      .andWhere("TRIM(p.category) <> ''")
      .orderBy('p.category', 'ASC')
      .getRawMany<{ category: string }>();
    return rows.map((r) => r.category);
  }
}
