import React from 'react'
import { useSearchParams } from 'react-router-dom'

const Button = () => {
  const [, setSearchParams] = useSearchParams()

  return (
    <div>
      <button
        type="button"
        className="px-6 py-2 min-w-[120px] text-center text-violet-600 border border-violet-600 rounded hover:bg-violet-600 hover:text-white active:bg-indigo-500 focus:outline-none focus:ring"
        onClick={() =>
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev)
              next.set('view', 'all')
              return next
            },
            { replace: false },
          )
        }
      >
        View
      </button>
    </div>
  )
}

export default Button
