import React, { useEffect, useState } from 'react'
import {
  clearPendingOrder,
  createOrder,
  readPendingOrder,
  type PendingOrderRecord,
} from '../../api/orders.api'
import { useCart } from '../../context/CartContext'

/**
 * If a previous confirm attempt left a pending payload (e.g. refresh during submit),
 * offer retry without auto-submitting.
 */
export default function PendingOrderPrompt() {
  const { clearCart } = useCart()
  const [pending, setPending] = useState<PendingOrderRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => setPending(readPendingOrder())
    sync()
    window.addEventListener('mo-lk-pending-order-changed', sync)
    return () => window.removeEventListener('mo-lk-pending-order-changed', sync)
  }, [])

  if (!pending) {
    return null
  }

  const onDismiss = () => {
    clearPendingOrder()
    setPending(null)
    setError(null)
  }

  const onRetry = async () => {
    setError(null)
    setBusy(true)
    try {
      await createOrder(pending.requestBody)
      clearPendingOrder()
      setPending(null)
      clearCart()
    } catch (e: unknown) {
      console.error(e)
      setError('Could not complete the order. Try again or dismiss to start over.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"
      role="alert"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-950">
          You have a pending order attempt. Retry?
        </p>
        <div className="flex flex-wrap gap-2">
          {error ? (
            <span className="text-sm text-red-700" role="status">
              {error}
            </span>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={onRetry}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Retry'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDismiss}
            className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
