import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-gray-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/products" className="text-gray-900 hover:text-gray-700" aria-label="Home">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15a3 3 0 00-3-3m-6-3.75h.008v.008H12V12zm0 0h.008v.008H12v-.008zM12 12h.008v.008H12V12zm0 0h.008v.008H12v-.008zm0 0h.008v.008H12V12zm0 0h.008v.008H12v-.008zM8.25 3h7.5a2.25 2.25 0 012.25 2.25v9.75a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 016 15V5.25A2.25 2.25 0 018.25 3z"
            />
          </svg>
        </Link>

        <Link
          to="/orders"
          className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15a3 3 0 00-3-3m-6-3.75h.008v.008H12V12zm0 0h.008v.008H12v-.008zM12 12h.008v.008H12V12zm0 0h.008v.008H12v-.008zm0 0h.008v.008H12V12zm0 0h.008v.008H12v-.008zM8.25 3h7.5a2.25 2.25 0 012.25 2.25v9.75a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 016 15V5.25A2.25 2.25 0 018.25 3z"
            />
          </svg>
          <span className="font-medium">Shopping Cart</span>
          <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
            3
          </span>
        </Link>
      </div>
    </header>
  )
}

export default Header
