import type { Product } from './product'

export type CartLine = {
  id: string
  name: string
  sku: string
  price: number
  imageUrl: string
  quantity: number
  /** Max units allowed for this line (from product.stock when added) */
  stock: number
}

export function productToCartLine(product: Product, quantity: number): CartLine {
  const price = parseFloat(product.price)
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    imageUrl: product.imageUrl,
    price: Number.isFinite(price) ? price : 0,
    quantity,
    stock: Math.max(0, product.stock),
  }
}
