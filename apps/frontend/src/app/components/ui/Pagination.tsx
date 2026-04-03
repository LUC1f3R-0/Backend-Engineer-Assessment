import React from 'react'
import type { PaginationProps } from '../../types/pagination'

const linkStyle = {
  color: 'rgb(3, 7, 18)',
  border: '1px solid rgb(229, 231, 235)',
  backgroundColor: 'rgb(249, 250, 251)',
} as const

const activeStyle = {
  color: 'rgb(255, 255, 255)',
  border: '1px solid rgb(229, 231, 235)',
  backgroundColor: 'rgb(0, 0, 0)',
} as const

const Pagination = ({ totalPages, currentPage, onPageChange }: PaginationProps) => {
  const pageCount = Math.max(1, totalPages)

  const go = (page: number) => {
    const next = Math.min(Math.max(1, page), pageCount)
    onPageChange(next)
  }

  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1)


  return (
    <div
      className="col-span-12 mx-auto mt-12 grid grid-cols-4 grid-rows-2 items-center gap-3 px-4 py-4 pb-8 sm:flex sm:justify-center"
      aria-label={`Pagination, ${pageCount} pages`}
    >
      <div className="wt-button-font order-2 col-span-2 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
          style={linkStyle}
          onClick={() => go(1)}
          disabled={currentPage <= 1}
        >
          First
        </button>
        <button
          type="button"
          className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
          style={linkStyle}
          onClick={() => go(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            className="rotate-180 transform"
            height="16px"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          Back
        </button>
      </div>

      <div className="order-1 col-span-4 flex flex-wrap justify-center gap-3 sm:order-2">
        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            className="rounded-lg flex min-w-[2.25rem] items-center justify-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
            style={page === currentPage ? activeStyle : linkStyle}
            onClick={() => go(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <div className="wt-button-font order-2 col-span-2 flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
          style={linkStyle}
          onClick={() => go(currentPage + 1)}
          disabled={currentPage >= pageCount}
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            height="16px"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <button
          type="button"
          className="rounded-lg flex items-center gap-2 border border-transparent px-3 py-1 transition duration-150 ease-in-out hover:border-wt-primary"
          style={linkStyle}
          onClick={() => go(pageCount)}
          disabled={currentPage >= pageCount}
        >
          Last
        </button>
      </div>
    </div>
  )
}

export default Pagination
