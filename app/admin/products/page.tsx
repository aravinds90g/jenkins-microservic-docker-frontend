"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, AlertCircle, Loader2, ImageIcon } from "lucide-react"

const CATEGORIES = ["headphones", "phones", "macbook", "motherboards", "cameras", "drones", "tablets"]

const empty = {
  name: "",
  brand: "VOID LABS",
  description: "",
  price: 0,
  oldPrice: undefined as number | undefined,
  image: "https://placehold.co/600x600/111/fff?text=NEW+PRODUCT",
  category: "phones",
  stock: 10,
  isNew: false,
  isHot: false,
  isSale: false,
  discount: "",
}

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.listProducts({ limit: 100 })
      .then((d) => { setProducts(d.products || []); setTotal(d.total || 0) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setEditing({ ...empty }); setDialogOpen(true) }
  const openEdit = (p) => { setEditing({ ...p }); setDialogOpen(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...editing,
        price: Number(editing.price),
        oldPrice: editing.oldPrice ? Number(editing.oldPrice) : undefined,
        stock: Number(editing.stock),
      }
      if (editing._id) {
        await api.updateProduct(editing._id, payload)
      } else {
        await api.createProduct(payload)
      }
      setDialogOpen(false)
      setEditing(null)
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    try {
      await api.deleteProduct(p._id)
      load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Products</h1>
          <p className="text-gray-600 mt-1">{total} product{total === 1 ? "" : "s"} in catalog</p>
        </div>
        <Button onClick={openNew} className="bg-black text-white hover:bg-black/90">
          <Plus className="w-4 h-4 mr-2" /> New product
        </Button>
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by name, brand, or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Flags</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-black line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{p.category}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">₹{p.price?.toLocaleString("en-IN")}</p>
                        {p.oldPrice && <p className="text-xs text-gray-500 line-through">₹{p.oldPrice.toLocaleString("en-IN")}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={p.stock > 5 ? "bg-green-100 text-green-800" : p.stock > 0 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                          {p.stock}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 space-x-1">
                        {p.isNew && <Badge className="bg-black text-white text-[10px]">NEW</Badge>}
                        {p.isHot && <Badge className="bg-red-600 text-white text-[10px]">HOT</Badge>}
                        {p.isSale && <Badge className="bg-amber-500 text-white text-[10px]">SALE</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(p)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?._id ? "Edit product" : "New product"}</DialogTitle>
            <DialogDescription>Fill in the product details.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." required />
                {editing.image && <img src={editing.image} alt="preview" className="w-32 h-32 object-cover rounded border" />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" min="0" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oldPrice">Old price</Label>
                  <Input id="oldPrice" type="number" min="0" value={editing.oldPrice ?? ""} onChange={(e) => setEditing({ ...editing, oldPrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" min="0" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.isNew} onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })} />
                  NEW
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.isHot} onChange={(e) => setEditing({ ...editing, isHot: e.target.checked })} />
                  HOT
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.isSale} onChange={(e) => setEditing({ ...editing, isSale: e.target.checked })} />
                  SALE
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-black/90">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editing._id ? "Save changes" : "Create product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
