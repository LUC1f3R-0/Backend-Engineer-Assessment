import React from 'react'
import ProductFilterToolbar from '../components/products/ProductFilterToolbar'
import Card from '../components/ui/Card'

const Products = () => {
  return (
    <main className="bg-gray-50">
      <div className="mx-auto px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">Products</h1>
        <ProductFilterToolbar />
        <div className="mt-8 flex flex-wrap gap-6">
          <Card />
        </div>
      </div>
    </main>
  )
}

export default Products
