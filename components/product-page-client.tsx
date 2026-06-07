"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useProduct } from "@/hooks/use-api"
import { ShoppingCart, Truck, Shield, RotateCcw, ArrowLeft, Loader2, Star, Package } from "lucide-react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function ProductPageClient({ productId }: { productId: string }) {
  const { product, loading, error } = useProduct(productId)
  const { addItem, state } = useCart()
  const { user } = useAuth()
  const pathname = usePathname()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [adding, setAdding] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState("")

  const variants = useMemo(() => product?.variants || [], [product])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "This product doesn't exist."}</p>
          <Link href="/products">
            <Button className="bg-black text-white hover:bg-black/90">Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const oldPrice = product.oldPrice
  const hasDiscount = oldPrice && oldPrice > product.price
  const discount = hasDiscount ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : 0
  const out = product.stock <= 0

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!user) {
      const redirect = encodeURIComponent(pathname)
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
        variant: selectedVariant || undefined,
      }, quantity)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link href="/products" className="flex items-center gap-2 text-gray-600 hover:text-black">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.isNew && <Badge className="bg-black text-white">NEW</Badge>}
                {product.isHot && <Badge className="bg-red-600 text-white">HOT</Badge>}
                {product.isSale && <Badge className="bg-amber-500 text-white">SALE</Badge>}
                {hasDiscount && <Badge className="bg-black text-white">{discount}% OFF</Badge>}
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">{product.name}</h1>
              {product.rating !== undefined && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-black text-black" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{product.rating} ({product.reviewsCount ?? 0} reviews)</span>
                </div>
              )}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-black">₹{product.price.toLocaleString("en-IN")}</span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 line-through">₹{oldPrice.toLocaleString("en-IN")}</span>
                )}
              </div>
            </div>

            {product.stock > 0 ? (
              <p className="text-sm text-green-700">✓ In stock{product.stock <= 5 ? ` — only ${product.stock} left` : ""}</p>
            ) : (
              <p className="text-sm text-red-600">✗ Out of stock</p>
            )}

            {variants.length > 0 && (
              <div className="space-y-3">
                {variants.map((v) => (
                  <div key={v.name}>
                    <p className="text-sm font-medium text-black mb-2">{v.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedVariant(opt === selectedVariant ? "" : opt)}
                          className={`px-4 py-2 border rounded-lg text-sm transition ${
                            selectedVariant === opt
                              ? "border-black bg-black text-white"
                              : "border-gray-300 hover:border-gray-500"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={adding}
                  >−</button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={adding}
                  >+</button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={out || adding || state.loading}
                className="w-full bg-black text-white hover:bg-black/90 text-lg py-6 disabled:opacity-50"
              >
                {adding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
                {out ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
              </Button>
            </form>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Truck className="w-4 h-4 text-black" />Free Shipping</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-4 h-4 text-black" />Secure Payment</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><RotateCcw className="w-4 h-4 text-black" />7-Day Returns</div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {["description", "specs", "shipping"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="py-8">
            {activeTab === "description" && (
              <p className="text-gray-700 leading-relaxed max-w-3xl">{product.description}</p>
            )}
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium text-black">{k}</span>
                      <span className="text-gray-600 text-right">{String(v)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specifications listed.</p>
                )}
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-black">Category</span>
                  <span className="text-gray-600 capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-black">SKU</span>
                  <span className="text-gray-600">{product._id?.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="text-gray-700 space-y-2 max-w-3xl">
                <p>• Free standard shipping on orders above ₹999</p>
                <p>• Express delivery available at checkout</p>
                <p>• 7-day return policy on unopened items</p>
                <p>• Cash on Delivery available for select regions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
