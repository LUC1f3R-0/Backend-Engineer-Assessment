import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import { FcmService } from '../notifications/fcm.service';
import { Product } from '../products/entities/product.entity';
import type { CreateOrderInput, CreateOrderItemInput } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

const TAX_RATE = 0.075;
const DELIVERY_FEE = 0;
const DEFAULT_PAYMENT = 'cash_on_delivery';

function isPgUniqueViolation(err: unknown): boolean {
  return err instanceof QueryFailedError && err.driverError?.code === '23505';
}

/** Missing columns / NOT NULL mismatch — usually migrations not applied. */
function isSchemaMismatch(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) {
    return false;
  }
  const code = err.driverError?.code;
  return code === '42703' || code === '23502';
}

export type OrderItemResponse = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type CreateOrderResponse = {
  id: string;
  idempotencyKey: string;
  deviceId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  subtotal: string;
  taxAmount: string;
  deliveryFee: string;
  totalAmount: string;
  status: string;
  items: OrderItemResponse[];
  createdAt: Date;
};

type CreateOrderTxResult = { response: CreateOrderResponse; notify: boolean };

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly fcmService: FcmService,
  ) {}

  private parseCreateInput(raw: Record<string, unknown>): CreateOrderInput {
    const idempotencyKey =
      typeof raw.idempotencyKey === 'string' ? raw.idempotencyKey.trim() : '';
    if (!idempotencyKey || idempotencyKey.length > 128) {
      throw new BadRequestException('idempotencyKey is required (max 128 characters)');
    }

    const customerName =
      typeof raw.customerName === 'string' ? raw.customerName.trim() : '';
    if (!customerName) {
      throw new BadRequestException('customerName is required');
    }

    const customerPhone =
      typeof raw.customerPhone === 'string' ? raw.customerPhone.trim() : '';
    if (!customerPhone || customerPhone.length < 3) {
      throw new BadRequestException('customerPhone is required');
    }

    let customerEmail: string | undefined;
    if (raw.customerEmail !== undefined && raw.customerEmail !== null) {
      if (typeof raw.customerEmail !== 'string') {
        throw new BadRequestException('customerEmail must be a string');
      }
      const e = raw.customerEmail.trim();
      customerEmail = e === '' ? undefined : e;
    }

    const deliveryAddress =
      typeof raw.deliveryAddress === 'string' ? raw.deliveryAddress.trim() : '';
    if (!deliveryAddress) {
      throw new BadRequestException('deliveryAddress is required');
    }

    let paymentMethod = DEFAULT_PAYMENT;
    if (raw.paymentMethod !== undefined && raw.paymentMethod !== null) {
      if (typeof raw.paymentMethod !== 'string') {
        throw new BadRequestException('paymentMethod must be a string');
      }
      const p = raw.paymentMethod.trim();
      if (p) {
        paymentMethod = p;
      }
    }

    if (!Array.isArray(raw.items) || raw.items.length === 0) {
      throw new BadRequestException('items must be a non-empty array');
    }

    const items: CreateOrderItemInput[] = [];
    for (const row of raw.items) {
      if (typeof row !== 'object' || row === null) {
        throw new BadRequestException('Each item must be an object');
      }
      const o = row as Record<string, unknown>;
      const productId = typeof o.productId === 'string' ? o.productId.trim() : '';
      const quantity =
        typeof o.quantity === 'number'
          ? o.quantity
          : typeof o.quantity === 'string'
            ? parseInt(o.quantity, 10)
            : NaN;
      if (!productId) {
        throw new BadRequestException('Each item needs productId');
      }
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new BadRequestException('Each item needs quantity >= 1');
      }
      items.push({ productId, quantity: Math.floor(quantity) });
    }

    return {
      idempotencyKey,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      paymentMethod,
      items,
    };
  }

  private mergeItems(items: CreateOrderItemInput[]): { productId: string; quantity: number }[] {
    const map = new Map<string, number>();
    for (const { productId, quantity } of items) {
      map.set(productId, (map.get(productId) ?? 0) + quantity);
    }
    return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
  }

  private toResponse(order: Order): CreateOrderResponse {
    const items = (order.items ?? []).map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product?.name ?? '',
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    }));
    return {
      id: order.id,
      idempotencyKey: order.idempotencyKey,
      deviceId: order.deviceId ?? null,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      deliveryFee: order.deliveryFee,
      totalAmount: order.totalAmount,
      status: order.status,
      items,
      createdAt: order.createdAt,
    };
  }

  async createOrder(rawBody: Record<string, unknown>, deviceId: string): Promise<CreateOrderResponse> {
    const dto = this.parseCreateInput(rawBody);
    const lines = this.mergeItems(dto.items);

    const existing = await this.orderRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
      relations: ['items', 'items.product'],
    });
    if (existing) {
      return this.toResponse(existing);
    }

    try {
      const txResult = await this.dataSource.transaction<CreateOrderTxResult>(async (em) => {
        const dup = await em.findOne(Order, {
          where: { idempotencyKey: dto.idempotencyKey },
          relations: ['items', 'items.product'],
        });
        if (dup) {
          return { response: this.toResponse(dup), notify: false };
        }

        const productIds = lines.map((l) => l.productId);
        const products = await em.find(Product, { where: { id: In(productIds) } });
        const byId = new Map(products.map((p) => [p.id, p]));

        for (const line of lines) {
          const p = byId.get(line.productId);
          if (!p) {
            throw new BadRequestException(`Unknown product: ${line.productId}`);
          }
          if (p.stock < line.quantity) {
            throw new BadRequestException(`Insufficient stock for ${p.name}`);
          }
        }

        let subtotal = 0;
        for (const line of lines) {
          const p = byId.get(line.productId)!;
          const unit = parseFloat(p.price);
          subtotal += unit * line.quantity;
        }
        const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
        const totalAmount = subtotal + taxAmount + DELIVERY_FEE;

        const orderEntity = em.create(Order, {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail ?? null,
          customerPhone: dto.customerPhone,
          deliveryAddress: dto.deliveryAddress,
          paymentMethod: dto.paymentMethod ?? DEFAULT_PAYMENT,
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          deliveryFee: DELIVERY_FEE.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          status: 'pending',
          idempotencyKey: dto.idempotencyKey,
          deviceId,
        });

        let saved: Order;
        try {
          saved = await em.save(Order, orderEntity);
        } catch (err) {
          if (isPgUniqueViolation(err)) {
            const again = await em.findOne(Order, {
              where: { idempotencyKey: dto.idempotencyKey },
              relations: ['items', 'items.product'],
            });
            if (again) {
              return { response: this.toResponse(again), notify: false };
            }
          }
          throw err;
        }

        for (const line of lines) {
          const p = byId.get(line.productId)!;
          const unit = parseFloat(p.price);
          const lineTotal = unit * line.quantity;
          const oi = em.create(OrderItem, {
            orderId: saved.id,
            productId: p.id,
            quantity: line.quantity,
            unitPrice: unit.toFixed(2),
            lineTotal: lineTotal.toFixed(2),
          });
          await em.save(OrderItem, oi);

          const upd = await em
            .createQueryBuilder()
            .update(Product)
            .set({ stock: () => `stock - ${line.quantity}` })
            .where('id = :id', { id: line.productId })
            .andWhere('stock >= :qty', { qty: line.quantity })
            .execute();
          if (upd.affected !== 1) {
            throw new BadRequestException('Stock changed; please retry');
          }
        }

        const full = await em.findOne(Order, {
          where: { id: saved.id },
          relations: ['items', 'items.product'],
        });
        if (!full) {
          throw new BadRequestException('Order could not be loaded');
        }
        return { response: this.toResponse(full), notify: true };
      });

      if (txResult.notify) {
        void this.fcmService
          .sendOrderPlacedNotification({
            orderId: txResult.response.id,
            deviceId: txResult.response.deviceId,
            totalAmount: txResult.response.totalAmount,
          })
          .catch((err: unknown) => {
            this.logger.warn(
              `Order FCM hook failed unexpectedly (order still created): ${String(err)}`,
            );
          });
      }

      return txResult.response;
    } catch (err) {
      if (isPgUniqueViolation(err)) {
        const again = await this.orderRepo.findOne({
          where: { idempotencyKey: dto.idempotencyKey },
          relations: ['items', 'items.product'],
        });
        if (again) {
          return this.toResponse(again);
        }
      }
      if (isSchemaMismatch(err)) {
        throw new ServiceUnavailableException(
          'Database schema is outdated. From the repository root run: npm run migration:run',
        );
      }
      throw err;
    }
  }
}
