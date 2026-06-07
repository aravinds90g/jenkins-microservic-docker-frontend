"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ShoppingBag, MapPin, CreditCard, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { state, refresh } = useCart()
  const [address, setAddress] = useState("")
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ orderId: string; mocked: boolean } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout")
    } else if (user) {
      setAddress(user.address || "")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border border-gray-200">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">Order placed!</h1>
              <p className="text-gray-600 mb-1">Order ID: #{success.orderId.slice(-8).toUpperCase()}</p>
              {success.mocked && (
                <Badge className="bg-amber-100 text-amber-800 border-0 mb-4">DEMO MODE (no real payment)</Badge>
              )}
              <p className="text-gray-600 mb-8">Thank you for your purchase. We'll email you tracking once it ships.</p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-black text-white hover:bg-black/90">
                  <Link href="/orders">View orders <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/products">Continue shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (state.items.length === 0 && !state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border border-gray-200">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-black mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products before checking out.</p>
              <Button asChild className="bg-black text-white hover:bg-black/90">
                <Link href="/products">Browse products</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) {
      setError("Please enter a shipping address.")
      return
    }
    setError(null)
    setPlacing(true)
    try {
      // Re-validate cart on server before creating the order
      await refresh()
      if (state.items.length === 0) {
        setError("Your cart is empty. Add some products before checking out.")
        setPlacing(false)
        return
      }
      const { order, mocked } = await api.createOrder(address)
      await refresh()
      setSuccess({ orderId: order._id, mocked: !!mocked })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-black mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={placeOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Shipping address</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="address">Full address</Label>
                <textarea
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                  className="mt-2 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  placeholder="Street, City, State, PIN, Country"
                />
                <p className="text-xs text-gray-500 mt-2">Saved to your profile for next time.</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <p className="font-semibold text-amber-900 mb-1">Demo payment</p>
                  <p className="text-amber-800">
                    The backend is in demo mode — no real card is charged. Set <code>STRIPE_SECRET_KEY</code> and
                    <code> STRIPE_WEBHOOK_SECRET</code> in <code>backend/payment-service/.env</code> to enable Stripe checkout.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="card">Card</Label>
                    <Input id="card" value="4242 4242 4242 4242" disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label htmlFor="exp">Expiry / CVC</Label>
                    <Input id="exp" value="12 / 99 · 123" disabled className="bg-gray-50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border border-gray-200 sticky top-24">
              <CardHeader>
                <CardTitle>Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{state.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-700">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{state.total.toLocaleString("en-IN")}</span>
                </div>

                <Button
                  type="submit"
                  disabled={placing || state.loading}
                  className="w-full bg-black text-white hover:bg-black/90 mt-4"
                >
                  {placing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Place order
                </Button>

                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1 mt-2">
                  <ShieldCheck className="w-3 h-3" /> Secure checkout
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
