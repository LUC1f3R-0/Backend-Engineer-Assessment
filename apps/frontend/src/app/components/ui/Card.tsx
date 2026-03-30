import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'

type CardProps = {
  product: Product
}

const Card = ({ product }: CardProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-white rounded-lg overflow-hidden shadow-lg ring-4 ring-blue-500 ring-opacity-40">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-100">
        <img
          className="h-full w-full object-cover object-center"
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
        />
        <div
          className={`absolute top-0 right-0 px-2 py-1 m-2 rounded-md text-sm font-medium text-white ${
            product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {product.stock > 0 ? 'In stock' : 'Out of stock'}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-lg font-medium leading-snug">{product.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
          {product.description}
        </p>
        <div className="mt-4 flex shrink-0 items-center justify-between gap-2 border-t border-gray-100 pt-4">
          <span className="font-bold text-lg">${product.price}</span>
          <Link
            to={`/orders?product=${encodeURIComponent(product.id)}`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block whitespace-nowrap"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Card
