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

  @Get('categories')
  @UseInterceptors(AppCacheInterceptor)
  @ApiOperation({ summary: 'List distinct product categories' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'string' } } })
  listCategories() {
    return this.productsService.listCategories();
  }

  @Get()
  @ApiOperation({ summary: 'List products (paginated, max 8 per page)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 8, description: 'Max 8' })
  @ApiQuery({ name: 'categories', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'q', required: false, description: 'Search name/description' })
  @ApiQuery({ name: 'search', required: false, description: 'Alias for q' })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'inStock', required: false, description: '1 or true' })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'featured | price_asc | price_desc | newest | name_asc | name_desc',
  })
  @ApiOkResponse({ type: ProductsPageResponseDto })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
    @Query('categories') categories?: string,
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findPaged(page, limit, {
      categories,
      q,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort,
    });
  }
}
