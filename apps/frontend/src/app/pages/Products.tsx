import React, { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../configs/api'
import ProductFilterToolbar from '../components/products/ProductFilterToolbar'
import Card from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import type { Product } from '../types/product'
import Pagination from '../components/ui/Pagination'
import CartModal from '../components/cart/CartModal'
import { useCart } from '../context/CartContext'

const PAGE_SIZE = 8

function parsePage(raw: string | null): number {
  if (raw === null || raw === '') return 1
  const n = parseInt(raw, 10)
  if (Number.isNaN(n) || n < 1) return 1
  return n
}

const Products = () => {
  const { openCart, uniqueItemCount } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const pageFromUrl = useMemo(() => parsePage(searchParams.get('page')), [searchParams])
  const categoriesFromUrl = searchParams.get('categories') ?? ''

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
    const params: { page: number; limit: number; categories?: string } = {
      page: pageFromUrl,
      limit: PAGE_SIZE,
    }
    if (categoriesFromUrl) params.categories = categoriesFromUrl

    axiosInstance
      .get('/api/products', { params })
      .then((res) => {
        const body = res.data?.data as unknown

        // Legacy: interceptor wraps an array as { data: Product[] }
        if (Array.isArray(body)) {
          let rows = body
          if (categoriesFromUrl) {
            rows = rows.filter((p: Product) => p.category === categoriesFromUrl)
          }
          const total = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
          setTotalPages(total)
          const start = (pageFromUrl - 1) * PAGE_SIZE
          setProducts(rows.slice(start, start + PAGE_SIZE))
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
  }, [pageFromUrl, categoriesFromUrl])

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
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            aria-label="Open shopping cart"
          >
            <img
              src="/cart-icon.png"
              alt=""
              className="h-5 w-5 shrink-0 brightness-0 invert"
              width={20}
              height={20}
              aria-hidden
            />
            <span className="hidden sm:inline">Cart</span>
            {uniqueItemCount > 0 ? (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold">
                {uniqueItemCount}
              </span>
            ) : null}
          </button>
        </div>
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
      <CartModal />
    </main>
  )
}

export default Products
