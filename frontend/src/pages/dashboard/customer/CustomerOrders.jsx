import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Package, Loader2, XCircle } from "lucide-react"
import { getMyOrders, cancelOrder, returnOrder } from "@/api/orderApi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice, formatDate } from "@/lib/utils"
import { ORDER_STATUSES } from "@/lib/constants"
import { toast } from "sonner"

export default function CustomerOrders() {
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState("")
  const [orderToReturn, setOrderToReturn] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled successfully")
      queryClient.invalidateQueries({ queryKey: ["my-orders"] })
      setOrderToCancel(null)
      setCancelReason("")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel order")
      setOrderToCancel(null)
    }
  })

  const returnMutation = useMutation({
    mutationFn: returnOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] })
      toast.success("Order returned successfully")
      setOrderToReturn(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to return order")
    }
  })

  const orders = data?.data?.data || []

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Orders</h2>
        <p className="text-muted-foreground">View and track your past and current orders.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center border-dashed">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No orders found</h3>
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const statusColor = ORDER_STATUSES[order.orderStatus]?.color || "secondary"
            
            return (
              <Card key={order._id} className="overflow-hidden">
                <div className={`h-1 w-full bg-${statusColor}`} />
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-4">
                  <div>
                    <CardTitle className="text-base">Order #{order._id.slice(-8).toUpperCase()}</CardTitle>
                    <CardDescription>Placed on {formatDate(order.createdAt)}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-${statusColor}/10 text-${statusColor} border-${statusColor}/20`}>
                      {ORDER_STATUSES[order.orderStatus]?.label || order.orderStatus}
                    </div>
                    {order.orderStatus !== "CANCELLED" && order.orderStatus !== "DELIVERED" && order.orderStatus !== "RETURNED" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setOrderToCancel(order._id)}
                        disabled={cancelMutation.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    )}
                    {order.orderStatus === "DELIVERED" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 hover:bg-muted"
                        onClick={() => setOrderToReturn(order._id)}
                        disabled={returnMutation.isPending}
                      >
                        <Package className="mr-2 h-4 w-4" /> Return
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item.product?._id || item.product} className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-medium">
                          {formatPrice(item.sellingPrice * item.quantity)}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-4">
                      <span className="font-medium">Total Amount</span>
                      <span className="font-bold text-primary">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Cancel Order
              </CardTitle>
              <CardDescription>
                Are you sure you want to cancel this order? This action cannot be undone and your payment will be refunded.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              <div className="space-y-2">
                <label htmlFor="cancel-reason" className="text-sm font-medium">Cancellation Reason (optional)</label>
                <Textarea 
                  id="cancel-reason"
                  placeholder="Tell us why you are cancelling this order..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOrderToCancel(null)
                    setCancelReason("")
                  }}
                  disabled={cancelMutation.isPending}
                >
                  Keep Order
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    cancelMutation.mutate({ id: orderToCancel, reason: cancelReason })
                  }}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Yes, Cancel Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Return Order Modal */}
      {orderToReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5" />
                Return Order
              </CardTitle>
              <CardDescription>
                Are you sure you want to return this order? We will initiate the return process and issue a refund once the item is received.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setOrderToReturn(null)}
                disabled={returnMutation.isPending}
              >
                Go Back
              </Button>
              <Button 
                variant="default" 
                onClick={() => {
                  returnMutation.mutate(orderToReturn)
                }}
                disabled={returnMutation.isPending}
              >
                {returnMutation.isPending ? "Processing..." : "Confirm Return"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
