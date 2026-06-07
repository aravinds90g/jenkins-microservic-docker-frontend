"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Headphones, Smartphone, Laptop, Cpu, Camera, Plane, Tablet, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const ICONS = {
  headphones: Headphones,
  phones: Smartphone,
  macbook: Laptop,
  motherboards: Cpu,
  cameras: Camera,
  drones: Plane,
  tablets: Tablet,
}

const FALLBACK = Package

const TITLES = {
  headphones: "Headphones",
  phones: "Phones",
  macbook: "Laptops",
  motherboards: "Motherboards",
  cameras: "Cameras",
  drones: "Drones",
  tablets: "Tablets",
}

export function Categories() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cats = Object.keys(ICONS)
    Promise.all(
      cats.map((c) => api.listProducts({ category: c, limit: 1 }).then((d) => [c, d.total || 0]).catch(() => [c, 0]))
    ).then((entries) => {
      setCounts(Object.fromEntries(entries))
      setLoading(false)
    })
  }, [])

  const categories = Object.keys(ICONS)

  return (
    <section id="categories-section" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Browse our curated catalog by gear type.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = ICONS[cat] ?? FALLBACK
            const count = counts[cat] ?? 0
            return (
              <Link
                key={cat}
                href={`/products?category=${cat}`}
                className="group bg-white border border-gray-200 rounded-lg p-8 text-center hover:border-black transition-all duration-300 relative"
              >
                <Icon className="w-12 h-12 mx-auto mb-4 text-black group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-lg text-black">{TITLES[cat]}</h3>
                <p className="text-sm text-gray-500 mt-1">{loading ? "…" : `${count} item${count === 1 ? "" : "s"}`}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
