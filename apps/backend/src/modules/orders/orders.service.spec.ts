import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

jest.mock('../../config/app.config', () => ({
  loadEnv: jest.fn(),
  getAppConfig: jest.fn(() => ({
    nodeEnv: 'test',
    port: 8080,
    xApiKey: '',
    swaggerEnabled: false,
    corsOrigins: [],
    isCloudRun: false,
    deviceCookieMaxAgeSec: 34560000,
    deviceCookieSecure: false,
    deviceCookieDomain: undefined,
    firebaseProjectId: '',
    firebaseClientEmail: '',
    firebasePrivateKey: '',
  })),
}));

import { FcmService } from '../notifications/fcm.service';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

describe('OrdersService — order-placed notification wiring', () => {
  let service: OrdersService;
  let fcm: { sendOrderPlacedNotification: jest.Mock };
  let orderRepo: { findOne: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  const body = {
    idempotencyKey: 'idem-1',
    customerName: 'A',
    customerPhone: '123',
    deliveryAddress: 'Addr',
    items: [{ productId: 'p1', quantity: 1 }],
  };

  const sampleResponse = {
    id: '11111111-1111-1111-1111-111111111111',
    idempotencyKey: 'idem-1',
    deviceId: '22222222-2222-2222-2222-222222222222' as string | null,
    customerName: 'A',
    customerEmail: null as string | null,
    customerPhone: '123',
    deliveryAddress: 'Addr',
    paymentMethod: 'cash_on_delivery',
    subtotal: '10.00',
    taxAmount: '0.75',
    deliveryFee: '0.00',
    totalAmount: '10.75',
    status: 'pending',
    items: [] as { id: string; productId: string; productName: string; quantity: number; unitPrice: string; lineTotal: string }[],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    fcm = { sendOrderPlacedNotification: jest.fn().mockResolvedValue(undefined) };
    orderRepo = { findOne: jest.fn() };
    dataSource = { transaction: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: FcmService, useValue: fcm },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(OrdersService);
  });

  it('invokes FcmService after transaction when notify is true', async () => {
    orderRepo.findOne.mockResolvedValue(undefined);
    dataSource.transaction.mockResolvedValue({
      notify: true,
      response: sampleResponse,
    });

    await service.createOrder(body, '22222222-2222-2222-2222-222222222222');

    expect(fcm.sendOrderPlacedNotification).toHaveBeenCalledTimes(1);
    expect(fcm.sendOrderPlacedNotification).toHaveBeenCalledWith({
      orderId: sampleResponse.id,
      deviceId: sampleResponse.deviceId,
      totalAmount: sampleResponse.totalAmount,
    });
  });

  it('does not invoke FcmService when transaction returns notify false', async () => {
    orderRepo.findOne.mockResolvedValue(undefined);
    dataSource.transaction.mockResolvedValue({
      notify: false,
      response: sampleResponse,
    });

    await service.createOrder(body, '22222222-2222-2222-2222-222222222222');

    expect(fcm.sendOrderPlacedNotification).not.toHaveBeenCalled();
  });

  it('does not invoke FcmService or transaction when idempotent order already exists', async () => {
    orderRepo.findOne.mockResolvedValue({ id: 'existing-order' });

    await service.createOrder(body, '22222222-2222-2222-2222-222222222222');

    expect(dataSource.transaction).not.toHaveBeenCalled();
    expect(fcm.sendOrderPlacedNotification).not.toHaveBeenCalled();
  });
});
