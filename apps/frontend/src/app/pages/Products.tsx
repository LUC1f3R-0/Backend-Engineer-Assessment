import React, { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../configs/api'
import ProductFilterToolbar from '../components/products/ProductFilterToolbar'
import Card from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import type { Product } from '../types/product'
import Pagination from '../components/ui/Pagination'

const PAGE_SIZE = 8

function parsePage(raw: string | null): number {
  if (raw === null || raw === '') return 1
  const n = parseInt(raw, 10)
  if (Number.isNaN(n) || n < 1) return 1
  return n
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const pageFromUrl = useMemo(() => parsePage(searchParams.get('page')), [searchParams])

  useEffect(() => {
    const p = searchParams.get('page')
    if (p === null || p === '') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', '1')
          return next
        },
        { replace: true },
      )
      return
    }
    const n = parseInt(p, 10)
    if (Number.isNaN(n) || n < 1) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', '1')
          return next
        },
        { replace: true },
      )
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    setLoading(true)
    setError(null)
    axiosInstance
      .get('/api/products', { params: { page: pageFromUrl, limit: PAGE_SIZE } })
      .then((res) => {
        const body = res.data?.data as unknown

        // Legacy: interceptor wraps an array as { data: Product[] }
        if (Array.isArray(body)) {
          const total = Math.max(1, Math.ceil(body.length / PAGE_SIZE))
          setTotalPages(total)
          const start = (pageFromUrl - 1) * PAGE_SIZE
          setProducts(body.slice(start, start + PAGE_SIZE))
          return
        }

        // Paginated: { items, totalPages, ... }
        if (body && typeof body === 'object' && 'items' in body) {
          const payload = body as { items?: Product[]; totalPages?: number }
          const items = payload.items
          setProducts(Array.isArray(items) ? items : [])
          const tp = payload.totalPages
          setTotalPages(typeof tp === 'number' && tp >= 1 ? tp : 1)
          return
        }

        setProducts([])
        setTotalPages(1)
      })
      .catch((err: unknown) => {
        console.error(err)
        setError('Could not load products. Check that the API is running and try again.')
        setProducts([])
        setTotalPages(1)
      })
      .finally(() => setLoading(false))
  }, [pageFromUrl])

  useEffect(() => {
    if (loading) return
    if (pageFromUrl > totalPages) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', String(totalPages))
          return next
        },
        { replace: true },
      )
    }
  }, [loading, pageFromUrl, totalPages, setSearchParams])

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

  const currentPage = Math.min(pageFromUrl, totalPages)

  return (
    <main className="bg-gray-50">
      <div className="mx-auto px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">Products</h1>
        <ProductFilterToolbar />
        {loading ? (
          <div className="mt-8 flex min-h-[240px] items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <p className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-600">No products to show.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      {!loading && !error && totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  )
}

export default Products
