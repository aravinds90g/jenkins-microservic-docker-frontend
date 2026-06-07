"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Shield, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <p className="text-sm text-gray-400 leading-none">VOID TECH</p>
                <h1 className="text-lg font-bold leading-none">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white text-black border-0 text-xs">{user?.role?.toUpperCase()}</Badge>
              <span className="text-sm hidden sm:inline">{user?.name}</span>
              <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Back to site</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <nav className="bg-white border border-gray-200 rounded-lg p-2 space-y-1">
              {links.map((l) => {
                const Icon = l.icon
                const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href))
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition",
                      active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {l.label}
                  </Link>
                )
              })}
            </nav>
          </aside>
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  )
}
