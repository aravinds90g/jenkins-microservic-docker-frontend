"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Package, ShoppingCart, Users, TrendingUp, IndianRupee, Clock, ArrowRight, AlertCircle } from "lucide-react"

function StatCard({ icon: Icon, label, value, hint, href }) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-black">{value}</p>
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-black" />
          </div>
        </div>
        {href && (
          <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-black hover:bg-transparent">
            <Link href={href} className="text-sm flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.listProducts({ limit: 1 }), api.listAllOrders(), api.listUsers()])
      .then(([products, orders, users]) => {
        const revenue = (orders.orders || []).filter((o) => o.status === "paid" || o.status === "shipped" || o.status === "delivered").reduce((s, o) => s + (o.total || 0), 0)
        const pending = (orders.orders || []).filter((o) => o.status === "pending").length
        const lowStock = 0
        setStats({
          products: products.total || 0,
          orders: (orders.orders || []).length,
          users: (users.users || []).length,
          revenue,
          pending,
        })
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-start gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load admin data</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="py-12 text-center text-gray-500">Loading dashboard...</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} hint="From paid orders" href="/admin/orders" />
        <StatCard icon={ShoppingCart} label="Orders" value={stats.orders} hint={`${stats.pending} pending`} href="/admin/orders" />
        <StatCard icon={Package} label="Products" value={stats.products} href="/admin/products" />
        <StatCard icon={Users} label="Customers" value={stats.users} href="/admin/users" />
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button asChild className="bg-black text-white hover:bg-black/90">
            <Link href="/admin/products"><Package className="w-4 h-4 mr-2" /> Manage products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders"><Clock className="w-4 h-4 mr-2" /> Process pending orders ({stats.pending})</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/users"><Users className="w-4 h-4 mr-2" /> View customers</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
