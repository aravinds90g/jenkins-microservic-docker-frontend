"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Zap, ShieldCheck, Truck, Award } from "lucide-react"
import { getStoreName } from "@/lib/store-name"
import { useProducts } from "@/hooks/use-api"
import Link from "next/link"
import { useMemo } from "react"

export function Hero() {
  const storeName = getStoreName()
  const { products, loading, total } = useProducts({ limit: 20, sort: "rating" })

  const featured = useMemo(() => {
    if (!products.length) return null
    return products[Math.floor(Math.random() * products.length)]
  }, [products])

  return (
    <section className="relative min-h-[80vh] bg-white overflow-hidden border-b border-gray-200">
      <div className="container mx-auto px-4 py-20">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="border-black text-black bg-transparent px-4 py-2 w-fit">
                <Zap className="w-4 h-4 mr-2 fill-black" />
                New collection available
              </Badge>

              <div>
                <h1 className="text-5xl md:text-7xl font-black text-black mb-6 leading-[0.95] tracking-tight">
                  {storeName}
                  <span className="block text-gray-500 text-3xl md:text-4xl mt-2 font-bold">// next-gen gear</span>
                </h1>
                <p className="text-xl text-gray-700 mb-8 max-w-lg leading-relaxed">
                  Phones, drones, cameras, motherboards, and more — engineered for uncompromising performance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-black text-white hover:bg-black/90 text-lg px-8 py-6 border-0">
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/products?sort=rating">
                  <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-white text-lg px-8 py-6 bg-transparent">
                    Top Rated
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              {loading ? (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="w-full h-80 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              ) : featured ? (
                <Link href={`/product/${featured._id}`} className="block bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-black transition">
                  <div className="relative">
                    <img
                      src={featured.image || "/placeholder.svg"}
                      alt={featured.name}
                      className="w-full h-80 object-cover rounded-lg mb-4"
                    />
                    {featured.isNew && <Badge className="absolute top-2 right-2 bg-black text-white">NEW</Badge>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{featured.brand}</p>
                    <h3 className="font-bold text-xl text-black mb-2 line-clamp-1">{featured.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(featured.rating ?? 4.5) ? "fill-black text-black" : "text-gray-300"}`} />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({featured.reviewsCount ?? 0})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xl text-black">₹{featured.price.toLocaleString("en-IN")}</span>
                        {featured.oldPrice && featured.oldPrice > featured.price && (
                          <span className="text-sm text-gray-500 line-through">₹{featured.oldPrice.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 border border-gray-200 text-center">
                  <p className="text-gray-600 mb-4">No products seeded yet.</p>
                  <code className="text-xs text-gray-500">cd backend/product-service && node src/seed.js</code>
                </div>
              )}
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <Truck className="w-6 h-6 mx-auto mb-2 text-black" />
                <p className="text-2xl font-bold text-black">Free</p>
                <p className="text-gray-600 text-sm">Shipping &gt; ₹999</p>
              </div>
              <div>
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-black" />
                <p className="text-2xl font-bold text-black">Secure</p>
                <p className="text-gray-600 text-sm">Checkout</p>
              </div>
              <div>
                <Award className="w-6 h-6 mx-auto mb-2 text-black" />
                <p className="text-2xl font-bold text-black">{loading ? "…" : `${total || products.length}+`}</p>
                <p className="text-gray-600 text-sm">Products</p>
              </div>
              <div>
                <Zap className="w-6 h-6 mx-auto mb-2 text-black" />
                <p className="text-2xl font-bold text-black">24/7</p>
                <p className="text-gray-600 text-sm">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
