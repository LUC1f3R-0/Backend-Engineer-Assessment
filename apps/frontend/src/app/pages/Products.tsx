import React, { useEffect } from 'react'
import axiosInstance from '../configs/api'
import ProductFilterToolbar from '../components/products/ProductFilterToolbar'
import Card from '../components/ui/Card'
import type { Product } from '../types/product'

const Products = () => {
  const [products, setProducts] = React.useState<Product[]>([])

  useEffect(() => {
    axiosInstance
      .get('/api/products')
      .then((res) => {
        setProducts(res.data.data)
        console.log(res.data.data)
      })
      .catch(console.error)
  }, [])

  return (
    <main className="bg-gray-50">
      <div className="mx-auto px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">Products</h1>
        <ProductFilterToolbar/>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Products
