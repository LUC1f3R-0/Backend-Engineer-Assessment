import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../configs/api'
import ProductFilterToolbar from '../components/products/ProductFilterToolbar'
import Card from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import type { Product } from '../types/product'
import Pagination from '../components/ui/Pagination'

const PAGE_SIZE = 8

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))

  const raw = searchParams.get('page')
  let pageNum = parseInt(raw || '1', 10)
  if (Number.isNaN(pageNum) || pageNum < 1) pageNum = 1
  const currentPage = Math.min(pageNum, totalPages)

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

  useEffect(() => {
    const fixUrlPage = (page: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', String(page))
          return next
        },
        { replace: true },
      )
    }
    const p = searchParams.get('page')
    if (p == null || p === '') {
      fixUrlPage(1)
      return
    }
    const n = parseInt(p, 10)
    if (Number.isNaN(n) || n < 1) {
      fixUrlPage(1)
      return
    }
    if (n > totalPages) {
      fixUrlPage(totalPages)
    }
  }, [searchParams, totalPages, setSearchParams])

  const handlePageChange = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages)
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev)
        sp.set('page', String(next))
        return sp
      },
      { replace: false },
    )
  }

  const start = (currentPage - 1) * PAGE_SIZE
  const visibleProducts = products.slice(start, start + PAGE_SIZE)

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
            {visibleProducts.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </main>
  )
}

export default Products
