import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiSecurity('x-api-key')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create order (idempotent by idempotencyKey)' })
  create(@Body() body: Record<string, unknown>) {
    return this.ordersService.createOrder(body);
  }
}
