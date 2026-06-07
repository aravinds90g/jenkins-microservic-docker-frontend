"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Loader2, Shield } from "lucide-react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/admin")
    } else if (!loading && user && user.role !== "admin") {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
