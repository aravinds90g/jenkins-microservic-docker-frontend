"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ShoppingCart, User, Menu, LogOut, Package, Shield, Store } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { getStoreName } from "@/lib/store-name"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { state, dispatch } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const router = useRouter()
  const storeName = getStoreName()

  const scrollToCategories = () => {
    if (typeof window === "undefined") return
    setIsMenuOpen(false)
    const el = document.getElementById("categories-section")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    } else {
      router.push("/#categories-section")
    }
  }

  const onSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black text-black tracking-tight hover:text-gray-700 transition-colors">
              {storeName}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-black hover:text-black/70 font-medium transition-colors">Home</Link>
            <Link href="/products" className="text-black hover:text-black/70 font-medium transition-colors">Products</Link>
            <button onClick={scrollToCategories} className="text-black hover:text-black/70 font-medium transition-colors">Categories</button>
          </div>

          <form onSubmit={onSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-black"
              />
            </div>
          </form>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative" onClick={() => dispatch({ type: "TOGGLE_CART" })}>
              <ShoppingCart className="w-5 h-5" />
              {state.itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-black text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {state.itemCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline text-sm">{user.name?.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-500 font-normal">{user.email}</div>
                    {isAdmin && <Badge className="mt-1 bg-black text-white text-[10px]">ADMIN</Badge>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer font-semibold">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-black text-white hover:bg-black/90">
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <form onSubmit={onSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 w-full" />
              </form>
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-black hover:text-black/70 font-medium py-2">Home</Link>
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="text-black hover:text-black/70 font-medium py-2">Products</Link>
              <button onClick={scrollToCategories} className="text-black hover:text-black/70 font-medium py-2 text-left">Categories</button>
              {user ? (
                <>
                  <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="text-black hover:text-black/70 font-medium py-2">My Orders</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-black font-semibold py-2">Admin Panel</Link>}
                  <button onClick={() => { logout(); setIsMenuOpen(false) }} className="text-red-600 font-medium py-2 text-left">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-black font-medium py-2">Sign in</Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-black font-medium py-2">Sign up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
