import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

/**
 * Registers order-related entities for TypeORM. HTTP APIs for orders are not implemented yet.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
})
export class OrdersModule {}
