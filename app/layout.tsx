import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { CartProvider } from "@/contexts/cart-context"
import { CartDrawer } from "@/components/cart-drawer"
import { AuthProvider } from "@/contexts/auth-context"
import { getStoreName } from "@/lib/store-name"

const inter = Inter({ subsets: ["latin"] })

const storeName = getStoreName()

export const metadata: Metadata = {
  title: `${storeName} - Next-gen E-commerce`,
  description: `Discover cutting-edge tech at ${storeName}. Phones, drones, cameras, motherboards, and more.`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
