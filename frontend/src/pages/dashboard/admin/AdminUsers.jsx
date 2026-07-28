import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Users, Loader2, Search, Ban, CheckCircle, ShieldAlert, ShieldCheck, User } from "lucide-react"
import { toast } from "sonner"

import { getAllUsers, toggleUserBan, updateUserRole } from "@/api/adminApi"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banTargetUser, setBanTargetUser] = useState(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [roleTargetUser, setRoleTargetUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState("")
  
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => getAllUsers({ limit: 10, page }),
  })

  const banMutation = useMutation({
    mutationFn: ({ id, isBanned }) => toggleUserBan(id, isBanned),
    onSuccess: () => {
      toast.success("User access updated successfully")
      setBanModalOpen(false)
      setBanTargetUser(null)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update access")
    }
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => {
      toast.success("User role updated successfully")
      setRoleModalOpen(false)
      setRoleTargetUser(null)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update role")
    }
  })

  const openBanModal = (user, isBanning) => {
    setBanTargetUser({ ...user, isBanning })
    setBanModalOpen(true)
  }

  const openRoleModal = (user) => {
    setRoleTargetUser(user)
    setSelectedRole(user.role)
    setRoleModalOpen(true)
  }

  const handleBanConfirm = () => {
    if (banTargetUser) {
      banMutation.mutate({ id: banTargetUser._id, isBanned: banTargetUser.isBanning })
    }
  }

  const handleRoleConfirm = () => {
    if (roleTargetUser && selectedRole !== roleTargetUser.role) {
      roleMutation.mutate({ id: roleTargetUser._id, role: selectedRole })
    } else {
      setRoleModalOpen(false)
    }
  }

  const rawData = data?.data?.data
  const users = Array.isArray(rawData) ? rawData : (rawData?.users ?? [])
  
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleColors = {
    ADMIN: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
    SELLER: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
    CUSTOMER: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
  }

  const totalByRole = {
    ALL: users.length,
    CUSTOMER: users.filter(u => u.role === "CUSTOMER").length,
    SELLER: users.filter(u => u.role === "SELLER").length,
    ADMIN: users.filter(u => u.role === "ADMIN").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage all customer, seller, and admin accounts.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "ALL", label: "All Users" },
          { key: "CUSTOMER", label: "Customers" },
          { key: "SELLER", label: "Sellers" },
          { key: "ADMIN", label: "Admins" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              roleFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${roleFilter === key ? "bg-white/20" : "bg-muted"}`}>
              {totalByRole[key]}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center border-dashed">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"
                  return (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-medium">
                            <Ban className="h-3 w-3" /> Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => openRoleModal(user)}
                          >
                            <ShieldCheck className="mr-1 h-3 w-3" /> Change Role
                          </Button>
                          {user.role !== "ADMIN" && (
                            user.isBanned ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 text-xs h-8"
                                onClick={() => openBanModal(user, false)}
                                disabled={banMutation.isPending}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" /> Unban
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs h-8"
                                onClick={() => openBanModal(user, true)}
                                disabled={banMutation.isPending}
                              >
                                <Ban className="mr-1 h-3 w-3" /> Ban
                              </Button>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          {data?.data?.pagination && (
            <Pagination 
              currentPage={page} 
              totalPages={data.data.pagination.totalPages} 
              onPageChange={setPage} 
            />
          )}
        </CardContent>
      </Card>

      {/* Ban / Unban Modal */}
      {banModalOpen && banTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden border">
            <div className={`p-1 ${banTargetUser.isBanning ? "bg-destructive" : "bg-emerald-500"}`} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {banTargetUser.isBanning 
                  ? <ShieldAlert className="h-6 w-6 text-destructive" />
                  : <ShieldCheck className="h-6 w-6 text-emerald-500" />
                }
                <h3 className="text-lg font-semibold">
                  {banTargetUser.isBanning ? "Ban User" : "Unban User"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {banTargetUser.isBanning 
                  ? `Are you sure you want to ban ${banTargetUser.name}? They will lose access to the platform.` 
                  : `Are you sure you want to unban ${banTargetUser.name}? Their account will be restored.`}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 bg-muted/50 px-6 py-4">
              <Button 
                variant="outline" 
                onClick={() => setBanModalOpen(false)}
                disabled={banMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant={banTargetUser.isBanning ? "destructive" : "default"}
                className={!banTargetUser.isBanning ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                onClick={handleBanConfirm}
                disabled={banMutation.isPending}
              >
                {banMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, {banTargetUser.isBanning ? "Ban" : "Unban"} User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleModalOpen && roleTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden border">
            <div className="p-1 bg-primary" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Change User Role</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Change the role for <span className="font-semibold text-foreground">{roleTargetUser.name}</span>.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select New Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SELLER">Seller</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 bg-muted/50 px-6 py-4">
              <Button 
                variant="outline" 
                onClick={() => setRoleModalOpen(false)}
                disabled={roleMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRoleConfirm}
                disabled={roleMutation.isPending || selectedRole === roleTargetUser.role}
              >
                {roleMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
