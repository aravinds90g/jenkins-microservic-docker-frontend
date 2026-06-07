"use client"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useProducts } from "@/hooks/use-api"
import Link from "next/link"

export function FeaturedProducts() {
  const { products, loading, error } = useProducts({ limit: 6, sort: "rating" })

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Featured Products</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked gear from the VOID TECH catalog — top-rated and ready to ship.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading featured products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">Couldn't reach the product service.</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Make sure the backend is running on <code>NEXT_PUBLIC_API_URL</code>.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products yet. Run the seed script to populate the catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} priority={i < 3} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-black text-black hover:bg-black hover:text-white bg-transparent">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
