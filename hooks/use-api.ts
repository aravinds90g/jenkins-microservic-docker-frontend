"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { api, type Product } from "@/lib/api"

export function useProducts(initialParams: Record<string, unknown> = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paramsRef = useRef<Record<string, unknown>>(initialParams)
  const initialRef = useRef(true)

  const refetch = useCallback(async (override: Record<string, unknown> = {}) => {
    const merged = { ...paramsRef.current, ...override }
    paramsRef.current = merged
    setLoading(true)
    setError(null)
    try {
      const data = await api.listProducts(merged)
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Re-fetch whenever initialParams changes
    const merged = { ...paramsRef.current, ...initialParams }
    const changed = JSON.stringify(merged) !== JSON.stringify(paramsRef.current)
    if (initialRef.current || changed) {
      initialRef.current = false
      paramsRef.current = merged
      setLoading(true)
      setError(null)
      api.listProducts(merged)
        .then((data) => {
          setProducts(data.products || [])
          setTotal(data.total || 0)
        })
        .catch((err: any) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [JSON.stringify(initialParams)])

  return { products, total, loading, error, refetch }
}

export function useProduct(id: string | null | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setProduct(null)
      return
    }
    let alive = true
    setLoading(true)
    setError(null)
    api.getProduct(id)
      .then((d) => { if (alive) setProduct(d.product) })
      .catch((e) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id])

  return { product, loading, error }
}
