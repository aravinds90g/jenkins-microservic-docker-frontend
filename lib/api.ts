const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const TOKEN_KEY = "void_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null | undefined): void {
  if (typeof window === "undefined") return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

function buildQuery(params: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null || v === "") continue
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    }
  }
  return parts.length ? `?${parts.join("&")}` : ""
}

async function request<T = any>(
  path: string,
  { method = "GET", body, auth = false, headers = {} }: { method?: string; body?: unknown; auth?: boolean; headers?: Record<string, string> } = {}
): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
  }
  if (auth) {
    const t = getToken()
    if (t) opts.headers = { ...opts.headers, Authorization: `Bearer ${t}` }
  }
  if (body !== undefined && body !== null) {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, opts)
  const text = await res.text()
  const data: any = text
    ? (() => {
        try {
          return JSON.parse(text)
        } catch {
          return { raw: text }
        }
      })()
    : {}

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null)
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        const next = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?redirect=${next}`
      }
    }
    const err: any = new Error(data.error || data.message || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data as T
}

export interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin"
  phone?: string
  address?: string
  createdAt?: string
}

export interface Product {
  _id: string
  name: string
  brand: string
  description: string
  price: number
  oldPrice?: number
  image: string
  category: string
  stock: number
  rating?: number
  reviewsCount?: number
  isNew?: boolean
  isHot?: boolean
  isSale?: boolean
  specs?: Record<string, string>
  variants?: { name: string; options: string[] }[]
}

export interface Order {
  _id: string
  userId: string
  items: { productId: string; name: string; image: string; price: number; quantity: number }[]
  total: number
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "failed"
  shippingAddress?: string
  paymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export const api = {
  base: BASE,

  // Auth
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/users/register", { method: "POST", body: payload }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/users/login", { method: "POST", body: payload }),
  profile: () => request<{ user: User }>("/api/users/profile", { auth: true }),
  updateProfile: (payload: { name?: string; phone?: string; address?: string }) =>
    request<{ user: User }>("/api/users/profile", { method: "PATCH", body: payload, auth: true }),

  // Admin: users
  listUsers: () => request<{ users: User[] }>("/api/users", { auth: true }),
  updateUser: (id: string, payload: Partial<User>) =>
    request<{ user: User }>(`/api/users/${id}`, { method: "PATCH", body: payload, auth: true }),
  deleteUser: (id: string) => request<{ message: string }>(`/api/users/${id}`, { method: "DELETE", auth: true }),

  // Products
  listProducts: (params: Record<string, unknown> = {}) =>
    request<{ products: Product[]; total: number; page: number; totalPages: number }>(`/api/products${buildQuery(params)}`),
  getProduct: (id: string) => request<{ product: Product }>(`/api/products/${id}`),
  createProduct: (payload: Partial<Product>) =>
    request<{ product: Product }>("/api/products", { method: "POST", body: payload, auth: true }),
  updateProduct: (id: string, payload: Partial<Product>) =>
    request<{ product: Product }>(`/api/products/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteProduct: (id: string) => request<{ message: string }>(`/api/products/${id}`, { method: "DELETE", auth: true }),
  updateStock: (items: { productId: string; quantity: number }[]) =>
    request<{ message: string }>("/api/products/stock", { method: "PATCH", body: { items }, auth: true }),

  // Cart
  getCart: () => request<{ cart: any }>("/api/cart", { auth: true }),
  addCartItem: (productId: string, quantity = 1, selectedVariant?: string) =>
    request<{ cart: any }>("/api/cart/items", { method: "POST", body: { productId, quantity, selectedVariant }, auth: true }),
  updateCartItem: (productId: string, quantity: number) =>
    request<{ cart: any }>(`/api/cart/items/${productId}`, { method: "PATCH", body: { quantity }, auth: true }),
  removeCartItem: (productId: string) =>
    request<{ cart: any }>(`/api/cart/items/${productId}`, { method: "DELETE", auth: true }),
  clearCart: () => request<{ cart: any }>("/api/cart", { method: "DELETE", auth: true }),

  // Orders
  listOrders: () => request<{ orders: Order[] }>("/api/orders", { auth: true }),
  getOrder: (id: string) => request<{ order: Order }>(`/api/orders/${id}`, { auth: true }),
  createOrder: (shippingAddress: string) =>
    request<{ order: Order; mocked?: boolean }>("/api/orders", { method: "POST", body: { shippingAddress }, auth: true }),
  listAllOrders: () => request<{ orders: Order[] }>("/api/orders/all", { auth: true }),
  updateOrderStatus: (id: string, status: Order["status"]) =>
    request<{ order: Order }>(`/api/orders/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
}
