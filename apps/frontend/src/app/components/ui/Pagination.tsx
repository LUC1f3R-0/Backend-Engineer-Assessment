const PAGE_SIZE = 8

export type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const navBtn =
    'inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'

  const pageBtn = (p: number, isActive: boolean) => (
    <button
      key={p}
      type="button"
      onClick={() => onPageChange(p)}
      className={
        isActive
          ? 'min-w-[2.25rem] rounded border border-gray-300 bg-white px-2 py-1 text-center text-sm font-bold text-blue-600'
          : 'min-w-[2.25rem] rounded border border-gray-200 bg-white px-2 py-1 text-center text-sm text-gray-700 transition hover:border-gray-300 hover:text-blue-600'
      }
    >
      {p}
    </button>
  )

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        type="button"
        className={navBtn}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <span aria-hidden className="mr-1">
          &lt;
        </span>
        Previous
      </button>

      <div className="flex flex-wrap items-center gap-1">{pages.map((p) => pageBtn(p, p === page))}</div>

      <span className="px-1 text-sm font-medium text-gray-700">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className={navBtn}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
        <span aria-hidden className="ml-1">
          &gt;
        </span>
      </button>
    </div>
  )
}

export default Pagination
export { PAGE_SIZE }
