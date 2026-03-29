import React, { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const SearchBar = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [input, setInput] = useState(() => searchParams.get('q') ?? '')

  useEffect(() => {
    setInput(searchParams.get('q') ?? '')
  }, [searchParams])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()

    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/search')
    }
  }

  return (
    <div>
      <div id="search-bar" className="w-120 bg-white rounded-md shadow-lg z-10">
        <form className="flex items-center justify-center p-2" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Search here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-gray-800 text-white rounded-md px-4 py-1 ml-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  )
}

export default SearchBar
