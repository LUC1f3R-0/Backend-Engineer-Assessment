import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AppCacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { ProductsListResponseDto } from './dto/product-swagger.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiSecurity('x-api-key')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseInterceptors(AppCacheInterceptor)
  @ApiOperation({ summary: 'List all products' })
  @ApiOkResponse({ type: ProductsListResponseDto })
  findAll() {
    return this.productsService.findAll();
  }
}
