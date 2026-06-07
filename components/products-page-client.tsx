"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useProducts } from "@/hooks/use-api"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

export function ProductsPageClient() {
  const params = useSearchParams()
  const router = useRouter()

  const initialCategory = params.get("category") || ""
  const initialSearch = params.get("search") || ""

  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState(initialSearch)
  const [sort, setSort] = useState("featured")

  useEffect(() => {
    setCategory(params.get("category") || "")
    setSearch(params.get("search") || "")
  }, [params])

  const apiParams = useMemo(() => {
    const p: any = { limit: 50 }
    if (category) p.category = category
    if (search) p.search = search
    if (sort === "price-low") p.sort = "price_asc"
    else if (sort === "price-high") p.sort = "price_desc"
    else if (sort === "rating") p.sort = "rating"
    else if (sort === "name") p.sort = "name"
    return p
  }, [category, search, sort])

  const { products, loading, error } = useProducts(apiParams)

  const updateUrl = (cat, q) => {
    const u = new URLSearchParams()
    if (cat) u.set("category", cat)
    if (q) u.set("search", q)
    router.push(`/products${u.toString() ? `?${u}` : ""}`, { scroll: false })
  }

  const clearFilters = () => {
    setCategory("")
    setSearch("")
    updateUrl("", "")
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : "All Products"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Explore the VOID TECH catalog.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form
            onSubmit={(e) => { e.preventDefault(); updateUrl(category, search) }}
            className="relative flex-1"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 border-gray-300 focus:border-black"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {(category || search) && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="text-gray-600">Filters:</span>
            {category && (
              <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                category: {category}
                <button onClick={() => { setCategory(""); updateUrl("", search) }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {search && (
              <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                search: {search}
                <button onClick={() => { setSearch(""); updateUrl(category, "") }}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-red-600 underline">Clear all</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-2">Couldn't load products: {error}</p>
            <p className="text-gray-600 text-sm">Make sure the backend is running and NEXT_PUBLIC_API_URL is set.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No products found.</p>
            {(category || search) && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">Clear filters</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
