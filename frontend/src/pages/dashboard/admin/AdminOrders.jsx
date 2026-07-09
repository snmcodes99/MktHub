import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Package, Loader2, Search, ChevronDown } from "lucide-react"
import { getAllOrders, updateOrderStatus } from "@/api/orderApi"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

const ORDER_STATUSES = ["PENDING", "PLACED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"]

const statusColors = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  PLACED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  OUT_FOR_DELIVERY: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/30 dark:text-fuchsia-400",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  RETURNED: "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400",
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [statusDropdownId, setStatusDropdownId] = useState(null)
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", { page, searchTerm, statusFilter }],
    queryFn: () => getAllOrders({ 
      page,
      limit: 10,
      orderNumber: searchTerm || undefined,
      orderStatus: statusFilter !== "ALL" ? statusFilter : undefined
    }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, { status }),
    onSuccess: () => {
      toast.success("Order status updated")
      setStatusDropdownId(null)
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update status")
    }
  })

  const resultData = data?.data?.data || {}
  const orders = resultData.orders || (Array.isArray(resultData) ? resultData : [])
  const totalPages = resultData.pagination?.totalPages || 1

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders Management</h2>
          <p className="text-muted-foreground">View and update the status of all platform orders.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or customer..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {key === "ALL" ? "All Orders" : key.charAt(0) + key.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center border-dashed">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{order._id?.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.user?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.items?.length || order.orderItems?.length || 1} item(s)</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice(order.totalPrice || 0)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus] || statusColors.PENDING}`}>
                        {order.orderStatus || "UNKNOWN"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative inline-block">
                        <select
                          className="h-8 pl-3 pr-8 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent hover:text-accent-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateStatusMutation.mutate({ id: order._id, status: e.target.value })
                            }
                          }}
                          disabled={order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED" || updateStatusMutation.isPending}
                        >
                          <option value="" disabled>Change Status</option>
                          {ORDER_STATUSES.filter(s => s !== order.orderStatus).map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2 h-3 w-3 pointer-events-none opacity-50" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}