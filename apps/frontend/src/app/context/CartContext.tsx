import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from '../types/product'
import { productToCartLine, type CartLine } from '../types/cart'

const STORAGE_KEY = 'mo-lk-cart'

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (row): row is CartLine =>
          row &&
          typeof row === 'object' &&
          typeof (row as CartLine).id === 'string' &&
          typeof (row as CartLine).quantity === 'number',
      )
      .map((row) => ({
        ...row,
        stock:
          typeof row.stock === 'number' && row.stock >= 0 ? row.stock : 9999,
      }))
  } catch {
    return []
  }
}

function writeStorage(lines: CartLine[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
}

type CartContextValue = {
  lines: CartLine[]
  
  uniqueItemCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (product: Product) => void
  removeLine: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    typeof window !== 'undefined' ? readStorage() : [],
  )
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    writeStorage(lines)
  }, [lines])

  const uniqueItemCount = lines.length

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        const cap = next[idx].stock
        const q = Math.min(next[idx].quantity + 1, cap)
        if (q === next[idx].quantity) return prev
        next[idx] = { ...next[idx], quantity: q }
        return next
      }
      return [...prev, productToCartLine(product, 1)]
    })
  }, [])

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity))
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.id === productId)
      if (idx < 0) return prev
      const next = [...prev]
      const cap = Math.max(1, next[idx].stock)
      next[idx] = { ...next[idx], quantity: Math.min(q, cap) }
      return next
    })
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({
      lines,
      uniqueItemCount,
      isOpen,
      openCart,
      closeCart,
      addToCart,
      removeLine,
      setQuantity,
      clearCart,
    }),
    [lines, uniqueItemCount, isOpen, openCart, closeCart, addToCart, removeLine, setQuantity, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
