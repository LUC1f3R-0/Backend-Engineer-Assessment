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
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(8, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const [items, total] = await this.products.findAndCount({
      order: { createdAt: 'ASC' },
      skip,
      take: safeLimit,
    });
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }
}
