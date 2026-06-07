"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle, ChevronDown, ChevronRight, Package, IndianRupee } from "lucide-react"

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled", "failed"]
const STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.listAllOrders()
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  const revenue = orders
    .filter((o) => ["paid", "shipped", "delivered"].includes(o.status))
    .reduce((s, o) => s + (o.total || 0), 0)

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.updateOrderStatus(id, status)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Orders</h1>
        <p className="text-gray-600 mt-1">{orders.length} total · ₹{revenue.toLocaleString("en-IN")} revenue</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className={filter === s ? "bg-black text-white" : ""}>
            {s === "all" ? "All" : s} ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
          </Button>
        ))}
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No orders {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((o) => {
                const isOpen = expanded === o._id
                return (
                  <div key={o._id}>
                    <div className="flex items-center gap-3 p-4 hover:bg-gray-50">
                      <button onClick={() => setExpanded(isOpen ? null : o._id)} className="text-gray-500">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                        <div>
                          <p className="font-semibold text-black">#{o._id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{o.userId?.slice(-6) || "—"}</p>
                          <p className="text-xs text-gray-500">{(o.items || []).length} item(s)</p>
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {o.total?.toLocaleString("en-IN")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${STYLES[o.status] || "bg-gray-100 text-gray-800"} border-0`}>{o.status?.toUpperCase()}</Badge>
                        </div>
                      </div>
                      <Select value={o.status} onValueChange={(v) => updateStatus(o._id, v)} disabled={updating === o._id}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {isOpen && (
                      <div className="bg-gray-50 p-4 pl-12 border-t border-gray-100">
                        <div className="space-y-2 mb-3">
                          {(o.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-10 h-10 object-cover rounded" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}</p>
                              </div>
                              <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                            </div>
                          ))}
                        </div>
                        {o.shippingAddress && (
                          <div className="mt-3 p-3 bg-white border border-gray-200 rounded text-sm">
                            <p className="font-semibold text-black mb-1">Shipping address</p>
                            <p className="text-gray-600">{o.shippingAddress}</p>
                          </div>
                        )}
                        {o.paymentIntentId && (
                          <p className="text-xs text-gray-500 mt-2">Payment Intent: <code>{o.paymentIntentId}</code></p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
