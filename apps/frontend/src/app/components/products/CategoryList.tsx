import React from 'react'
import { useSearchParams } from 'react-router-dom'

const COURSES = [
  { slug: 'intro-web', label: 'Intro to Web' },
  { slug: 'react-basics', label: 'React basics' },
  { slug: 'node-api', label: 'Node API' },
] as const

const CategoryList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('categories')

  const selectCategory = (slug: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (active === slug) next.delete('categories')
        else next.set('categories', slug)
        return next
      },
      { replace: false },
    )
  }

  return (
    <div>
      <ul className="flex flex-col gap-2 max-w-[280px] mx-auto mt-24">
        <li>
          <details className="group">
            <summary className="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">
              <span className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
                <span>Popular courses</span>
              </span>
              <svg
                className="w-5 h-5 text-gray-500 transition group-open:rotate-90"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </summary>

            <article className="px-4 pb-4">
              <ul className="flex flex-col gap-1 pl-2">
                {COURSES.map(({ slug, label }) => (
                  <li key={slug}>
                    <button
                      type="button"
                      onClick={() => selectCategory(slug)}
                      className={`w-full text-left rounded px-1 py-0.5 hover:bg-gray-200 cursor-pointer ${
                        active === slug ? 'bg-violet-100 font-medium' : ''
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          </details>
        </li>
      </ul>
    </div>
  )
}

export default CategoryList
