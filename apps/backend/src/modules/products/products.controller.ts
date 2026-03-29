import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppCacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseInterceptors(AppCacheInterceptor)
  findAll() {
    return this.productsService.findAll();
  }
}
