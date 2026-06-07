"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Loader2, Star } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function ProductCard({ product, priority = false }) {
  const { addItem, state } = useCart()
  const { user } = useAuth()
  const pathname = usePathname()
  const [adding, setAdding] = useState(false)

  const oldPrice = product.oldPrice
  const price = product.price
  const hasDiscount = oldPrice && oldPrice > price
  const discount = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0
  const out = product.stock !== undefined && product.stock <= 0
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 3

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      const redirect = encodeURIComponent(pathname || "/products")
      if (typeof window !== "undefined") window.location.href = `/login?redirect=${redirect}`
      return
    }
    setAdding(true)
    try {
      await addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 h-full flex flex-col relative">
      {(product.isNew || product.isHot || product.isSale) && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.isNew && <Badge className="bg-black text-white text-[10px]">NEW</Badge>}
          {product.isHot && <Badge className="bg-red-600 text-white text-[10px]">HOT</Badge>}
          {product.isSale && <Badge className="bg-amber-500 text-white text-[10px]">SALE</Badge>}
        </div>
      )}

      <CardContent className="p-0 flex flex-col h-full">
        <Link href={`/product/${product._id}`} className="relative overflow-hidden block">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            loading={priority ? "eager" : "lazy"}
          />
        </Link>

        <div className="p-5 flex flex-col flex-grow">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand}</div>
          <Link href={`/product/${product._id}`}>
            <h3 className="font-semibold text-base text-black mb-2 hover:text-gray-600 transition-colors line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
          </Link>

          {product.rating !== undefined && (
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-black text-black" : "text-gray-300"}`} />
              ))}
              <span className="text-xs text-gray-500 ml-1">({product.reviewsCount ?? 0})</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-black">₹{price.toLocaleString("en-IN")}</span>
            {hasDiscount && (
              <>
                <span className="text-sm text-gray-500 line-through">₹{oldPrice.toLocaleString("en-IN")}</span>
                <Badge variant="secondary" className="bg-gray-100 text-black text-[10px]">{discount}% OFF</Badge>
              </>
            )}
          </div>

          {lowStock && <p className="text-xs text-amber-600 mb-2">Only {product.stock} left</p>}

          <div className="mt-auto">
            <Button
              type="button"
              onClick={handleAdd}
              disabled={out || adding || state.loading}
              className="w-full bg-black text-white hover:bg-black/90 disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              {out ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
