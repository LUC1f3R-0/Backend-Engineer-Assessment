import { httpClient } from './http-client';

export type CreateOrderRequest = {
  idempotencyKey: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  paymentMethod: string;
  items: { productId: string; quantity: number }[];
};

export type OrderResponse = {
  id: string;
  idempotencyKey: string;
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
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }[];
  createdAt: string;
};

export const PENDING_ORDER_STORAGE_KEY = 'mo-lk-pending-order';

export type PendingOrderRecord = {
  idempotencyKey: string;
  requestBody: CreateOrderRequest;
};

function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  throw new Error('Unexpected API response shape');
}

export async function createOrder(body: CreateOrderRequest): Promise<OrderResponse> {
  const res = await httpClient.post<unknown>('/api/orders', body);
  return unwrapData<OrderResponse>(res.data);
}

export function readPendingOrder(): PendingOrderRecord | null {
  try {
    const raw = localStorage.getItem(PENDING_ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as PendingOrderRecord).idempotencyKey === 'string' &&
      (parsed as PendingOrderRecord).requestBody &&
      typeof (parsed as PendingOrderRecord).requestBody === 'object'
    ) {
      return parsed as PendingOrderRecord;
    }
    return null;
  } catch {
    return null;
  }
}

function notifyPendingOrderChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mo-lk-pending-order-changed'));
  }
}

export function writePendingOrder(record: PendingOrderRecord): void {
  localStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(record));
  notifyPendingOrderChanged();
}

export function clearPendingOrder(): void {
  localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
  notifyPendingOrderChanged();
}
