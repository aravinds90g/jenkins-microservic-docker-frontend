"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle, Search, Shield, User as UserIcon, Mail, Phone, MapPin, Trash2 } from "lucide-react"

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.listUsers()
      .then((d) => setUsers(d.users || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  )

  const setRole = async (id, role) => {
    setUpdating(id)
    try {
      await api.updateUser(id, { role })
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUpdating(null)
    }
  }

  const remove = async (u) => {
    if (!confirm(`Delete user ${u.email}?`)) return
    try {
      await api.deleteUser(u._id)
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Customers</h1>
        <p className="text-gray-600 mt-1">{users.length} registered user{users.length === 1 ? "" : "s"}</p>
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
        <Input placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                            {u.role === "admin" ? <Shield className="w-4 h-4 text-black" /> : <UserIcon className="w-4 h-4 text-gray-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-black">{u.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.phone && <p className="text-sm flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{u.phone}</p>}
                        {u.address && <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1 max-w-xs"><MapPin className="w-3 h-3" />{u.address}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={u.role}
                          onValueChange={(v) => setRole(u._id, v)}
                          disabled={updating === u._id || u._id === me?._id}
                        >
                          <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(u)}
                          disabled={u._id === me?._id}
                          title={u._id === me?._id ? "You can't delete your own account" : "Delete user"}
                          className="text-red-600 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
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
    </div>
  )
}
