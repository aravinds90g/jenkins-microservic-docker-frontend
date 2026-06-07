"use client"

import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from "react"
import { api, getToken } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
  stock?: number
  product?: any
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isOpen: boolean
  loading: boolean
  error: string | null
}

type CartAction =
  | { type: "SET_CART"; payload: { items: CartItem[]; total: number } }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR" }

const initial: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  loading: false,
  error: null,
}

function recompute(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  return { total, itemCount }
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART": {
      const meta = recompute(action.payload.items)
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total ?? meta.total,
        itemCount: meta.itemCount,
        loading: false,
        error: null,
      }
    }
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen }
    case "OPEN_CART":
      return { ...state, isOpen: true }
    case "CLOSE_CART":
      return { ...state, isOpen: false }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "CLEAR":
      return { ...state, items: [], total: 0, itemCount: 0 }
    default:
      return state
  }
}

interface CartContextValue {
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addItem: (item: { productId: string; name: string; price: number; image: string; stock?: number; variant?: string }, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>
  clear: () => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const { user } = useAuth()
  const tokenPresent = typeof window !== "undefined" && !!getToken()
  const isAuthed = !!user && tokenPresent
  const inflight = useRef(false)

  const refresh = useCallback(async () => {
    if (!isAuthed) {
      dispatch({ type: "CLEAR" })
      return
    }
    if (inflight.current) return
    inflight.current = true
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const { cart } = await api.getCart()
      const items: CartItem[] = (cart.items || []).map((i: any) => ({
        productId: i.productId,
        name: i.product?.name ?? "Item",
        price: i.product?.price ?? 0,
        image: i.product?.image ?? "/placeholder.svg",
        quantity: i.quantity,
        variant: i.selectedVariant,
        stock: i.product?.stock,
        product: i.product,
      }))
      dispatch({ type: "SET_CART", payload: { items, total: cart.total ?? 0 } })
    } catch (err: any) {
      if (err.status !== 401) {
        dispatch({ type: "SET_ERROR", payload: err.message })
      }
    } finally {
      inflight.current = false
    }
  }, [isAuthed])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(
    async (item, quantity = 1) => {
      if (!isAuthed) {
        dispatch({ type: "OPEN_CART" })
        if (typeof window !== "undefined") {
          const next = encodeURIComponent(window.location.pathname + window.location.search)
          window.location.href = `/login?redirect=${next}`
        }
        return
      }
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        await api.addCartItem(item.productId, quantity, item.variant)
        await refresh()
        dispatch({ type: "OPEN_CART" })
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", payload: err.message })
      }
    },
    [isAuthed, refresh]
  )

  const removeItem = useCallback(
    async (productId) => {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        await api.removeCartItem(productId)
        await refresh()
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", payload: err.message })
      }
    },
    [refresh]
  )

  const updateItemQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        return removeItem(productId)
      }
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        await api.updateCartItem(productId, quantity)
        await refresh()
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", payload: err.message })
      }
    },
    [refresh, removeItem]
  )

  const clear = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await api.clearCart()
      dispatch({ type: "CLEAR" })
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message })
    }
  }, [])

  return (
    <Ctx.Provider value={{ state, dispatch, addItem, removeItem, updateItemQuantity, clear, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error("useCart must be used within CartProvider")
  return c
}
