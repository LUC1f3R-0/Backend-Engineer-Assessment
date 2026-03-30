import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppCacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CacheModule.register()],
  controllers: [ProductsController],
  providers: [ProductsService, AppCacheInterceptor],
})
export class ProductsModule {}
