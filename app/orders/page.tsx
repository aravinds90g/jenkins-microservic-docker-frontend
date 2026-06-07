"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, ShoppingBag } from "lucide-react"

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/orders")
      return
    }
    if (!user) return
    setFetching(true)
    api.listOrders()
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false))
  }, [user, loading, router])

  useEffect(() => {
    const onLogout = () => setOrders([])
    window.addEventListener("void:logout", onLogout)
    return () => window.removeEventListener("void:logout", onLogout)
  }, [])

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-black" />
          <h1 className="text-3xl font-bold text-black">My Orders</h1>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        {orders.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-black mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">When you place an order, it will appear here.</p>
              <Button asChild className="bg-black text-white hover:bg-black/90">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o._id} className="border border-gray-200">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">Order #{o._id?.slice(-8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    <Badge className={`${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-800"} border-0`}>
                      {o.status?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(o.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black line-clamp-1">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}</p>
                        </div>
                        <p className="font-semibold text-black">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                  {o.shippingAddress && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                      <p className="font-medium text-black mb-1">Shipping to:</p>
                      <p className="text-gray-600">{o.shippingAddress}</p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-black">₹{o.total?.toLocaleString("en-IN")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
