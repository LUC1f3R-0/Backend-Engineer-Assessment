import React, { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

type SortParam =
  | 'featured'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'name_asc'
  | 'name_desc'

const SORT_OPTIONS: { value: SortParam; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'name_desc', label: 'Name: Z–A' },
]

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'intro-web', label: 'Intro to Web' },
  { value: 'react-basics', label: 'React basics' },
  { value: 'node-api', label: 'Node API' },
]

const INPUT_BASE =
  'rounded-lg border border-gray-200 bg-white text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
const CONTROL_MD = `${INPUT_BASE} h-10 w-full min-w-0 px-3`
const CONTROL_LG = `${INPUT_BASE} h-12 w-full min-w-0 pl-11 pr-4 text-[15px]`

const SELECT_CHEVRON_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '1rem',
  appearance: 'none' as const,
}

function parseSort(raw: string | null): SortParam {
  if (!raw) return 'featured'
  if (SORT_OPTIONS.some((o) => o.value === raw)) return raw as SortParam
  return 'featured'
}

function logListingDestination(next: URLSearchParams) {
  console.log(Object.fromEntries(next.entries()))
}

const ProductFilterToolbar = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paramsKey = searchParams.toString()

  const [qInput, setQInput] = useState(() => searchParams.get('q') ?? '')
  const [draftCategory, setDraftCategory] = useState('')
  const [draftMin, setDraftMin] = useState('')
  const [draftMax, setDraftMax] = useState('')
  const [draftSort, setDraftSort] = useState<SortParam>('featured')
  const [draftInStockOnly, setDraftInStockOnly] = useState(false)
  const [priceError, setPriceError] = useState('')

  useEffect(() => {
    const sp = new URLSearchParams(paramsKey)
    setQInput(sp.get('q') ?? '')
    setDraftCategory(sp.get('category') ?? '')
    setDraftMin(sp.get('minPrice') ?? '')
    setDraftMax(sp.get('maxPrice') ?? '')
    setDraftSort(parseSort(sp.get('sort')))
    const ins = sp.get('inStock')
    setDraftInStockOnly(ins === '1' || ins === 'true')
  }, [paramsKey])

  function validatePriceRange() {
    const minS = draftMin.trim()
    const maxS = draftMax.trim()
    if (!minS || !maxS) {
      setPriceError('')
      return true
    }
    const minN = Number(minS)
    const maxN = Number(maxS)
    if (Number.isNaN(minN) || Number.isNaN(maxN)) {
      setPriceError('')
      return true
    }
    if (minN > maxN) {
      setPriceError('Minimum price must be less than or equal to maximum.')
      return false
    }
    setPriceError('')
    return true
  }

  function applyDiscoveryToParams(next: URLSearchParams) {
    const trimmed = qInput.trim()
    if (trimmed) next.set('q', trimmed)
    else next.delete('q')
    if (draftCategory) next.set('category', draftCategory)
    else next.delete('category')
    if (draftMin.trim()) next.set('minPrice', draftMin.trim())
    else next.delete('minPrice')
    if (draftMax.trim()) next.set('maxPrice', draftMax.trim())
    else next.delete('maxPrice')
    if (draftInStockOnly) next.set('inStock', '1')
    else next.delete('inStock')
    next.set('page', '1')
  }

  function showResults(e?: FormEvent) {
    e?.preventDefault()
    if (!validatePriceRange()) return
    const next = new URLSearchParams(searchParams)
    applyDiscoveryToParams(next)
    logListingDestination(next)
    navigate({ pathname: '/products', search: next.toString() })
  }

  function handleSortChange(value: SortParam) {
    setDraftSort(value)
    const next = new URLSearchParams(searchParams)
    if (value !== 'featured') next.set('sort', value)
    else next.delete('sort')
    next.set('page', '1')
    logListingDestination(next)
    navigate({ pathname: '/products', search: next.toString() })
  }

  function clearAll() {
    setQInput('')
    setDraftCategory('')
    setDraftMin('')
    setDraftMax('')
    setDraftSort('featured')
    setDraftInStockOnly(false)
    setPriceError('')
    navigate({ pathname: '/products', search: '' }, { replace: true })
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]"
      aria-label="Find and filter products"
    >
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/90 to-white px-5 py-1 sm:px-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <form onSubmit={showResults} className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </span>
                <input
                  id="product-search-q"
                  type="search"
                  autoComplete="off"
                  placeholder="Search products..."
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  className={`${CONTROL_LG} placeholder:text-gray-400`}
                />
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-lg bg-gray-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Show results
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-10 items-center border border-gray-500 justify-center rounded-lg px-3 text-sm font-medium text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-gray-900 hover:decoration-gray-500 sm:h-12 sm:px-4 sm:no-underline sm:hover:underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" aria-hidden />

      <div className="px-5 py-1 sm:px-1">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-5 lg:gap-y-4">
            <div className="w-full min-w-[200px] max-w-xs lg:w-56">
              <select
                id="filter-category"
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
                className={`${CONTROL_MD} pl-3 pr-8`}
                style={SELECT_CHEVRON_STYLE}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value || 'all'} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 flex-1 lg:max-w-md">
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label htmlFor="filter-min" className="sr-only">
                    Minimum price
                  </label>
                  <input
                    id="filter-min"
                    inputMode="decimal"
                    min={0}
                    placeholder="Min"
                    value={draftMin}
                    onChange={(e) => {
                      setDraftMin(e.target.value)
                      setPriceError('')
                    }}
                    className={`${CONTROL_MD} tabular-nums placeholder:text-gray-400`}
                  />
                </div>
                <div>
                  <label htmlFor="filter-max" className="sr-only">
                    Maximum price
                  </label>
                  <input
                    id="filter-max"
                    inputMode="decimal"
                    min={0}
                    placeholder="Max"
                    value={draftMax}
                    onChange={(e) => {
                      setDraftMax(e.target.value)
                      setPriceError('')
                    }}
                    className={`${CONTROL_MD} tabular-nums placeholder:text-gray-400`}
                  />
                </div>
              </div>
              {priceError ? <p className="mt-1.5 text-xs font-medium text-red-600">{priceError}</p> : null}
            </div>

            <div className="flex items-center pb-0.5 lg:pb-0">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={draftInStockOnly}
                  onChange={(e) => setDraftInStockOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                In stock only
              </label>
            </div>
          </div>

          <div className="w-full shrink-0 border-t border-gray-100 pt-4 xl:w-64 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
            <select
              id="filter-sort"
              value={draftSort}
              onChange={(e) => handleSortChange(e.target.value as SortParam)}
              className={`${CONTROL_MD} pl-3 pr-8`}
              style={SELECT_CHEVRON_STYLE}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductFilterToolbar
