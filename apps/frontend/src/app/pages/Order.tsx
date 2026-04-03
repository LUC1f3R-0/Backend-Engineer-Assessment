import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Placeholder for a future checkout flow. Cart actions live in the cart modal on the products page.
 */
const Order = () => {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
      <p className="mt-3 text-sm text-gray-600">
        Checkout is not wired to the API yet. Use the cart from the products page to review items.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        Back to products
      </Link>
    </main>
  )
}

export default Order
