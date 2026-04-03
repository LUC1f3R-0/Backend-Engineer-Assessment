/** Request body for POST /orders (validated in OrdersService). */
export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  idempotencyKey: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  paymentMethod?: string;
  items: CreateOrderItemInput[];
};
