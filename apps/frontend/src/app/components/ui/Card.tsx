import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'

type CardProps = {
  product: Product
}

const Card = ({ product }: CardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg ring-4 ring-blue-500 ring-opacity-40 max-w-sm m-5">
      <div className="relative">
        <img className="w-full" src={product.imageUrl} alt={product.name} />
        <div
          className={`absolute top-0 right-0 px-2 py-1 m-2 rounded-md text-sm font-medium text-white ${
            product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {product.stock > 0 ? 'In stock' : 'Out of stock'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">${product.price}</span>
          <Link
            to={`/orders?product=${encodeURIComponent(product.id)}`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Card
