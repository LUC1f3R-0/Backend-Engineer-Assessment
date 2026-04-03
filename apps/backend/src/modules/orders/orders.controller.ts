import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { DevicesService } from '../devices/devices.service';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiSecurity('x-api-key')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly devicesService: DevicesService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create order (idempotent by idempotencyKey); links to anonymous device cookie session' })
  async create(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { deviceId } = await this.devicesService.ensureSession(req, res);
    return this.ordersService.createOrder(body, deviceId);
  }
}
