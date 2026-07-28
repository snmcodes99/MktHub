import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Package, Loader2, Search, ChevronDown, ShoppingBag, Clock, CheckCircle2, Truck, Users } from "lucide-react"
import { getAllOrders, updateOrderStatus } from "@/api/orderApi"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

const ALL_STATUSES = ["PENDING", "PLACED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"]

const STATUS_META = {
  PENDING:          { label: "Pending",          dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  PLACED:           { label: "Placed",            dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  PROCESSING:       { label: "Processing",        dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200" },
  SHIPPED:          { label: "Shipped",           dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  dot: "bg-purple-400",  badge: "bg-purple-50 text-purple-700 border-purple-200" },
  DELIVERED:        { label: "Delivered",         dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED:        { label: "Cancelled",         dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200" },
  RETURNED:         { label: "Returned",          dot: "bg-slate-400",   badge: "bg-slate-50 text-slate-700 border-slate-200" },
}

const filterTabs = [
  { id: "ALL",        label: "All",          dot: "bg-slate-400" },
  { id: "PENDING",    label: "Pending",      dot: "bg-amber-400" },
  { id: "PROCESSING", label: "Processing",   dot: "bg-orange-400" },
  { id: "SHIPPED",    label: "Shipped",      dot: "bg-indigo-400" },
  { id: "DELIVERED",  label: "Delivered",    dot: "bg-emerald-400" },
  { id: "CANCELLED",  label: "Cancelled",    dot: "bg-red-400" },
]

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  useEffect(() => { setPage(1) }, [searchTerm, statusFilter])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", { page, searchTerm, statusFilter }],
    queryFn: () => getAllOrders({
      page, limit: 10,
      orderNumber: searchTerm || undefined,
      orderStatus: statusFilter !== "ALL" ? statusFilter : undefined
    }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, { status }),
    onSuccess: () => {
      toast.success("Order status updated")
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to update status")
  })

  const resultData = data?.data?.data || {}
  const orders = resultData.orders || (Array.isArray(resultData) ? resultData : [])
  const totalPages = resultData.pagination?.totalPages || 1

  // Summary counts
  const pending = orders.filter(o => ["PENDING","PLACED"].includes(o.orderStatus)).length
  const inTransit = orders.filter(o => ["PROCESSING","SHIPPED","OUT_FOR_DELIVERY"].includes(o.orderStatus)).length
  const delivered = orders.filter(o => o.orderStatus === "DELIVERED").length
  const cancelled = orders.filter(o => o.orderStatus === "CANCELLED").length

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Orders Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">View and update the status of all platform orders.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search by order ID..."
            className="pl-9 bg-white border-slate-200 rounded-xl text-sm h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New / Placed",  count: pending,   icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
          { label: "In Transit",    count: inTransit, icon: Truck,         color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-200" },
          { label: "Delivered",     count: delivered, icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Cancelled",     count: cancelled, icon: Package,       color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
        <div key={stat.label} className={`flex items-center gap-3 rounded-xl border ${stat.border} ${stat.bg} px-4 py-3`}>
              <Icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              statusFilter === tab.id
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${tab.dot}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Items</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const meta = STATUS_META[order.orderStatus] || STATUS_META.PENDING
                  const isFinal = ["DELIVERED", "CANCELLED", "RETURNED"].includes(order.orderStatus)
                  const initials = (order.user?.name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

                  return (
                    <tr key={order._id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-semibold text-sm text-foreground">#{order._id?.slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{order.user?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-8 rounded-lg bg-muted text-xs font-semibold text-foreground">
                          {order.items?.length || 1}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-foreground">{formatPrice(order.totalPrice || 0)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isFinal ? (
                          <span className="text-xs text-muted-foreground font-medium">—</span>
                        ) : (
                          <div className="relative inline-block">
                            <select
                              className="appearance-none h-8 pl-3 pr-8 rounded-lg border border-border bg-card text-xs font-medium text-foreground cursor-pointer hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                              value=""
                              onChange={(e) => { if (e.target.value) updateStatusMutation.mutate({ id: order._id, status: e.target.value }) }}
                              disabled={updateStatusMutation.isPending}
                            >
                              <option value="" disabled>Change status</option>
                              {ALL_STATUSES.filter(s => s !== order.orderStatus).map(status => (
                                <option key={status} value={status}>
                                  {STATUS_META[status]?.label || status}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-2 h-3.5 w-3.5 pointer-events-none text-slate-400" />
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-border px-5 py-3">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}