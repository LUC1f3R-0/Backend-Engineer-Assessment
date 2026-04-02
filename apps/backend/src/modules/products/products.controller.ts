import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AppCacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { ProductsPageResponseDto } from './dto/product-swagger.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiSecurity('x-api-key')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseInterceptors(AppCacheInterceptor)
  @ApiOperation({ summary: 'List products (paginated, max 8 per page)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 8, description: 'Max 8' })
  @ApiOkResponse({ type: ProductsPageResponseDto })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productsService.findPaged(page, limit);
  }
}
