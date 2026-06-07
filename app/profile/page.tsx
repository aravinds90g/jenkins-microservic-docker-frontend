"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Save, User, Phone, MapPin, Mail, BadgeCheck, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, refresh } = useAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile")
    } else if (user) {
      setName(user.name || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
    }
  }, [user, loading, router])

  const onSave = async (e) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    try {
      await api.updateProfile({ name, phone, address })
      await refresh()
      setMessage({ type: "ok", text: "Profile updated." })
    } catch (err: any) {
      setMessage({ type: "err", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </div>
              {user.role === "admin" && (
                <span className="ml-auto px-3 py-1 bg-black text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" /> ADMIN
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-4">
              {message && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${
                  message.type === "ok"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="email" value={user.email} disabled className="pl-10 bg-gray-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="+91 99999 99999" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm min-h-[100px]"
                    placeholder="Street, City, State, PIN"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full bg-black text-white hover:bg-black/90">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
