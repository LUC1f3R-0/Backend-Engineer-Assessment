import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  /** @param limit capped at 8 */
  async findPaged(page: number, limit: number) {
    const safeLimit = Math.min(8, Math.max(1, limit));
    const totalItems = await this.products.count();
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const skip = (safePage - 1) * safeLimit;
    const items = await this.products.find({
      order: { createdAt: 'ASC' },
      skip,
      take: safeLimit,
    });
    return {
      items,
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
    };
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
