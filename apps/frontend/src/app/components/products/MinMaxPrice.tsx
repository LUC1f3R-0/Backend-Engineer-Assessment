import React from 'react'

const MinMaxPrice = () => {
  return (
    <div className="flex items-center gap-2.5 justify-center" id="otp-container">
      <input
        type="number" className="px-2 py-1 font-semibold outline-none text-l text-gray-700 border rounded-md transition-all bg-gray-100 border-gray-300 focus:border-blue-500" placeholder='Min Price'
      />
      <input
        type="number" className="px-2 py-1 font-semibold outline-none text-l text-gray-700 border rounded-md transition-all bg-gray-100 border-gray-300 focus:border-blue-500" placeholder='Max Price'
      />
    </div>
  )
}

export default MinMaxPrice
