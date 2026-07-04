import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Package, Loader2, Search } from "lucide-react"
import { getSellerOrders, updateOrderStatus } from "@/api/orderApi"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice, formatDate } from "@/lib/utils"
import { ORDER_STATUSES } from "@/lib/constants"
import { toast } from "sonner"

export default function SellerOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: getSellerOrders,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, { status }),
    onSuccess: () => {
      toast.success("Order status updated successfully")
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update order status")
    }
  })

  const orders = data?.data?.data || []
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === "ALL") return matchesSearch
    return matchesSearch && order.orderStatus === statusFilter
  })

  const filterTabs = [
    { id: "ALL", label: "All Orders" },
    { id: "PENDING", label: "Pending" },
    { id: "PROCESSING", label: "Processing" },
    { id: "SHIPPED", label: "Shipped" },
    { id: "DELIVERED", label: "Delivered" }
  ]

  const getAvailableStatuses = (currentStatus) => {
     // Sellers can only move orders FORWARD towards fulfillment, they cannot cancel or go backwards
     const flow = ["PENDING", "PLACED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]
     const currentIndex = flow.indexOf(currentStatus)
     if (currentIndex === -1) return flow.filter(s => s !== "PENDING" && s !== "PLACED")
     return flow.slice(currentIndex)
  }

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
          <h2 className="text-2xl font-bold tracking-tight">Manage Orders</h2>
          <p className="text-muted-foreground">View and update the fulfillment status of orders containing your products.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Order ID or Customer..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.id 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right w-[180px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusColor = ORDER_STATUSES[order.orderStatus]?.color || "secondary"
                  const availableStatuses = getAvailableStatuses(order.orderStatus)
                  
                  return (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div className="font-medium text-primary">{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-[150px] truncate">
                          ID: {order._id}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="font-medium">{order.customerName || "Guest"}</TableCell>
                      <TableCell>
                         <span className="inline-flex items-center justify-center bg-muted px-2 py-1 rounded-md text-xs font-semibold">
                            {order.items?.length || 0} items
                         </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatPrice(order.totalPrice)}</TableCell>
                      <TableCell className="text-right">
                        {order.orderStatus === "CANCELLED" ? (
                           <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">
                             Cancelled
                           </span>
                        ) : availableStatuses.length > 1 ? (
                           <select
                              className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 focus:ring-2 focus:ring-primary/20 appearance-none text-center bg-${statusColor}/10 text-${statusColor} cursor-pointer`}
                              value={order.orderStatus}
                              onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                              disabled={updateStatusMutation.isPending}
                           >
                              {availableStatuses.map(status => (
                                 <option key={status} value={status}>
                                    {ORDER_STATUSES[status]?.label || status}
                                 </option>
                              ))}
                           </select>
                        ) : (
                           <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-${statusColor}/10 text-${statusColor}`}>
                             {ORDER_STATUSES[order.orderStatus]?.label || order.orderStatus}
                           </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
