import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  clearPendingOrder,
  createOrder,
  writePendingOrder,
  type OrderResponse,
} from '../../api/orders.api'
import { useCart } from '../../context/CartContext'

const TAX_RATE = 0.075
const DEFAULT_PAYMENT = 'cash_on_delivery'

export default function CartModal() {
  const { lines, isOpen, closeCart, removeLine, setQuantity, clearCart } = useCart()

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart, submitting])

  useEffect(() => {
    if (!isOpen) {
      setStep('cart')
      setFormError(null)
      setLastOrder(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const goCheckout = () => {
    if (lines.length === 0) return
    setStep('checkout')
    setFormError(null)
  }

  const confirmOrder = async () => {
    if (lines.length === 0) return
    const name = customerName.trim()
    const phone = customerPhone.trim()
    const addr = deliveryAddress.trim()
    if (!name || !phone || !addr) {
      setFormError('Please fill in name, phone, and delivery address.')
      return
    }
    const idempotencyKey = crypto.randomUUID()
    const body = {
      idempotencyKey,
      customerName: name,
      customerPhone: phone,
      customerEmail: customerEmail.trim() || undefined,
      deliveryAddress: addr,
      paymentMethod: DEFAULT_PAYMENT,
      items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
    }
    writePendingOrder({ idempotencyKey, requestBody: body })
    setSubmitting(true)
    setFormError(null)
    try {
      const res = await createOrder(body)
      clearPendingOrder()
      clearCart()
      setLastOrder(res)
      setStep('success')
    } catch (e: unknown) {
      console.error(e)
      setFormError('Order could not be placed. You can retry from the bar at the bottom of the page.')
    } finally {
      setSubmitting(false)
    }
  }

  const title =
    step === 'success' ? 'Order placed' : step === 'checkout' ? 'Checkout' : 'Shopping Cart'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={() => !submitting && closeCart()}
        aria-label="Close cart"
        disabled={submitting}
      />
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-gray-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/cart-icon.png"
              alt=""
              className="h-8 w-8 shrink-0"
              width={32}
              height={32}
              aria-hidden
            />
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
          <button
            type="button"
            onClick={() => !submitting && closeCart()}
            disabled={submitting}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
          {step === 'success' && lastOrder ? (
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-gray-800">
                Thank you! Your order <span className="font-mono text-sm">{lastOrder.id}</span> was
                received.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Total (from server): <span className="font-semibold">${lastOrder.totalAmount}</span>{' '}
                · Payment: Cash on delivery
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : step === 'checkout' ? (
            <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
              <button
                type="button"
                onClick={() => !submitting && setStep('cart')}
                disabled={submitting}
                className="mb-4 text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                ← Back to cart
              </button>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Full name
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    autoComplete="name"
                    disabled={submitting}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    autoComplete="tel"
                    disabled={submitting}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="font-normal text-gray-500">(optional)</span>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    autoComplete="email"
                    disabled={submitting}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Delivery address
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    disabled={submitting}
                  />
                </label>
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment method</p>
                  <p className="mt-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                    Cash on delivery
                  </p>
                </div>
              </div>
              {formError ? (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {formError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={confirmOrder}
                disabled={submitting}
                className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? 'Placing order…' : 'Confirm order'}
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <img
                src="/cart-icon.png"
                alt=""
                className="mx-auto mb-4 h-16 w-16 opacity-40"
                width={64}
                height={64}
                aria-hidden
              />
              <p className="text-gray-500">Your cart is empty</p>
              <Link
                to="/products"
                onClick={closeCart}
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:hidden">
                {lines.map((item) => (
                  <div key={item.id} className="rounded-lg bg-white p-4 shadow">
                    <div className="flex gap-3">
                      <img src={item.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <button
                            type="button"
                            onClick={() => removeLine(item.id)}
                            className="shrink-0 text-red-500 hover:text-red-700"
                            aria-label="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded border">
                            <button
                              type="button"
                              className="px-2 py-1 text-gray-600"
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={item.stock}
                              className="w-12 border-x border-gray-200 py-1 text-center text-sm"
                              value={item.quantity}
                              onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                            />
                            <button
                              type="button"
                              className="px-2 py-1 text-gray-600"
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full rounded-lg bg-white shadow">
                  <thead className="bg-gray-50 text-left text-sm text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={item.imageUrl} alt="" className="h-14 w-14 rounded object-cover" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center rounded border">
                            <button
                              type="button"
                              className="px-2 py-1 text-gray-600"
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={item.stock}
                              className="w-12 border-x border-gray-200 py-1 text-center text-sm"
                              value={item.quantity}
                              onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                            />
                            <button
                              type="button"
                              className="px-2 py-1 text-gray-600"
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(item.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg bg-white p-4 shadow sm:ml-auto sm:max-w-sm">
                <h3 className="mb-3 font-bold text-gray-900">Order summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (7.5%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                    <span>Total (estimate)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={goCheckout}
                  className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                  Checkout
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all items?')) clearCart()
                  }}
                  className="mt-2 w-full text-sm text-red-600 hover:underline"
                >
                  Clear cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
