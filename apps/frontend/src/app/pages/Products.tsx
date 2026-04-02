import React, { useEffect } from 'react'
import axiosInstance from '../configs/api'
import ProductFilterToolbar from '../components/products/ProductFilterToolbar'
import Card from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import type { Product } from '../types/product'
import Pagination from '../components/ui/Pagination'

const Products = () => {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    axiosInstance
      .get('/api/products')
      .then((res) => {
        const data = res.data?.data
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="bg-gray-50">
      <div className="mx-auto px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">Products</h1>
        <ProductFilterToolbar/>
        {loading ? (
          <div className="mt-8 flex min-h-[240px] items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Pagination />
    </main>
  )
}

export default Products
