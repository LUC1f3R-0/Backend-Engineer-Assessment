import React, { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../configs/api'
import ProductFilterToolbar from '../components/products/ProductFilterToolbar'
import Card from '../components/ui/Card'
import Pagination, { PAGE_SIZE } from '../components/ui/Pagination'
import type { Product } from '../types/product'

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (raw === null || raw === '') return fallback
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return n >= 1 ? n : 1
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>([])
  const [totalPages, setTotalPages] = React.useState(1)

  const page = useMemo(
    () => parsePositiveInt(searchParams.get('page'), 1),
    [searchParams],
  )
  const limit = useMemo(() => {
    const n = parsePositiveInt(searchParams.get('limit'), PAGE_SIZE)
    return Math.min(8, Math.max(1, n))
  }, [searchParams])

  useEffect(() => {
    const p = searchParams.get('page')
    const l = searchParams.get('limit')
    if (p === null || l === null) {
      const next = new URLSearchParams(searchParams)
      if (p === null) next.set('page', '1')
      if (l === null) next.set('limit', String(PAGE_SIZE))
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    axiosInstance
      .get('/api/products', { params: { page, limit } })
      .then((res) => {
        const payload = res.data.data as {
          items: Product[]
          totalPages: number
        }
        setProducts(payload.items)
        setTotalPages(payload.totalPages)
      })
      .catch(console.error)
  }, [page, limit])

  const handlePageChange = (nextPage: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(nextPage))
        next.set('limit', String(limit))
        return next
      },
      { replace: false },
    )
  }

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
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </main>
  )
}

export default Products
