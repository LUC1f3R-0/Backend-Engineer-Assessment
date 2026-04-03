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

function parsePriceString(p: string): number {
  const n = parseFloat(p)
  return Number.isFinite(n) ? n : 0
}

/** Axios params aligned with backend `GET /api/products` */
function buildListingParams(searchParams: URLSearchParams): Record<string, string | number> {
  const page = parsePage(searchParams.get('page'))
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
  }

  const q = searchParams.get('q')?.trim()
  if (q) {
    params.q = q
  } else {
    const search = searchParams.get('search')?.trim()
    if (search) params.search = search
  }

  const cats = searchParams.get('categories')?.trim()
  if (cats) params.categories = cats

  const minP = searchParams.get('minPrice')?.trim()
  if (minP) params.minPrice = minP

  const maxP = searchParams.get('maxPrice')?.trim()
  if (maxP) params.maxPrice = maxP

  const ins = searchParams.get('inStock')
  if (ins === '1' || ins === 'true') params.inStock = '1'

  const sort = searchParams.get('sort')?.trim()
  if (sort) params.sort = sort

  return params
}

/** If API returns a legacy raw array, mirror backend filters client-side */
function applyLegacyFilters(rows: Product[], sp: URLSearchParams): Product[] {
  let out = rows
  const cat = sp.get('categories')?.trim()
  if (cat) out = out.filter((p) => p.category === cat)
  const term = sp.get('q')?.trim() || sp.get('search')?.trim()
  if (term) {
    const t = term.toLowerCase()
    out = out.filter(
      (p) => p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t),
    )
  }
  const minS = sp.get('minPrice')?.trim()
  if (minS) {
    const n = parseFloat(minS)
    if (Number.isFinite(n)) out = out.filter((p) => parsePriceString(p.price) >= n)
  }
  const maxS = sp.get('maxPrice')?.trim()
  if (maxS) {
    const n = parseFloat(maxS)
    if (Number.isFinite(n)) out = out.filter((p) => parsePriceString(p.price) <= n)
  }
  const ins = sp.get('inStock')
  if (ins === '1' || ins === 'true') out = out.filter((p) => p.stock > 0)
  return out
}

function sortLegacy(rows: Product[], sp: URLSearchParams): Product[] {
  const sort = sp.get('sort')?.trim() || 'featured'
  const copy = [...rows]
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => parsePriceString(a.price) - parsePriceString(b.price))
    case 'price_desc':
      return copy.sort((a, b) => parsePriceString(b.price) - parsePriceString(a.price))
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return copy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
  }
}

const Products = () => {
  const { openCart, uniqueItemCount } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const listingKey = searchParams.toString()

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
    const params = buildListingParams(searchParams)

    axiosInstance
      .get('/api/products', {
        params,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      })
      .then((res) => {
        const body = res.data?.data as unknown

        if (Array.isArray(body)) {
          let rows = applyLegacyFilters(body, searchParams)
          rows = sortLegacy(rows, searchParams)
          const total = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
          setTotalPages(total)
          const page = parsePage(searchParams.get('page'))
          const safePage = Math.min(page, total)
          const start = (safePage - 1) * PAGE_SIZE
          setProducts(rows.slice(start, start + PAGE_SIZE))
          return
        }

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
  }, [listingKey])

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
      {!loading && !error && (
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
