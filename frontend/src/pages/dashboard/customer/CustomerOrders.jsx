import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Package, Loader2, XCircle, Download, Star, MessageSquare, 
  Clock, CheckCircle2, Truck, MapPin, ShoppingBag, RotateCcw,
  ChevronDown, ChevronUp, AlertCircle, ArrowRight
} from "lucide-react"
import { getMyOrders, cancelOrder, returnOrder, downloadInvoice } from "@/api/orderApi"
import { createReview } from "@/api/reviewApi"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice, formatDate } from "@/lib/utils"
import { ORDER_STATUS_FLOW } from "@/lib/constants"
import { toast } from "sonner"
import { Link } from "react-router-dom"

// Status config with icon, color classes, and label
const STATUS_CONFIG = {
  PENDING:          { label: "Pending",          icon: Clock,          bg: "bg-amber-50",   text: "text-amber-600",  border: "border-amber-200",  dot: "bg-amber-500",  ring: "ring-amber-200" },
  PLACED:           { label: "Placed",            icon: CheckCircle2,   bg: "bg-blue-50",    text: "text-blue-600",   border: "border-blue-200",   dot: "bg-blue-500",   ring: "ring-blue-200" },
  PROCESSING:       { label: "Processing",        icon: Package,        bg: "bg-orange-50",  text: "text-orange-600", border: "border-orange-200", dot: "bg-orange-500", ring: "ring-orange-200" },
  SHIPPED:          { label: "Shipped",           icon: Truck,          bg: "bg-indigo-50",  text: "text-indigo-600", border: "border-indigo-200", dot: "bg-indigo-500", ring: "ring-indigo-200" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  icon: MapPin,         bg: "bg-purple-50",  text: "text-purple-600", border: "border-purple-200", dot: "bg-purple-500", ring: "ring-purple-200" },
  DELIVERED:        { label: "Delivered",         icon: CheckCircle2,   bg: "bg-emerald-50", text: "text-emerald-600",border: "border-emerald-200",dot: "bg-emerald-500",ring: "ring-emerald-200" },
  CANCELLED:        { label: "Cancelled",         icon: XCircle,        bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500",    ring: "ring-red-200" },
  RETURNED:         { label: "Returned",          icon: RotateCcw,      bg: "bg-slate-50",   text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-500",  ring: "ring-slate-200" },
}

const PAYMENT_CONFIG = {
  PENDING: { label: "Pay Pending", bg: "bg-amber-100", text: "text-amber-700" },
  PAID:    { label: "Paid",        bg: "bg-emerald-100", text: "text-emerald-700" },
  FAILED:  { label: "Failed",      bg: "bg-red-100", text: "text-red-700" },
}

// Track the journey steps for an order
function OrderTimeline({ status }) {
  const isCancelled = status === "CANCELLED"
  const isReturned = status === "RETURNED"
  
  if (isCancelled || isReturned) {
    const cfg = STATUS_CONFIG[status]
    const Icon = cfg.icon
    return (
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${cfg.bg} ${cfg.border} border text-sm font-medium ${cfg.text}`}>
        <Icon className="h-4 w-4 shrink-0" />
        Order {cfg.label}
      </div>
    )
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status)

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
      {ORDER_STATUS_FLOW.map((step, i) => {
        const cfg = STATUS_CONFIG[step]
        const Icon = cfg.icon
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        const isFuture = i > currentIndex

        return (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div className={`flex flex-col items-center gap-1 ${isFuture ? "opacity-30" : ""}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-2 transition-all
                ${isCurrent ? `${cfg.bg} ${cfg.text} ${cfg.ring} scale-110` : 
                  isDone ? "bg-emerald-100 text-emerald-600 ring-emerald-200" : 
                  "bg-slate-100 text-slate-400 ring-slate-200"}`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight max-w-[52px]
                ${isCurrent ? cfg.text : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                {cfg.label}
              </span>
            </div>
            {i < ORDER_STATUS_FLOW.length - 1 && (
              <div className={`h-0.5 w-6 rounded-full mb-4 ${i < currentIndex ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CustomerOrders() {
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState("")
  const [orderToReturn, setOrderToReturn] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const [expandedOrders, setExpandedOrders] = useState({})

  // Review state
  const [reviewProduct, setReviewProduct] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [reviewComment, setReviewComment] = useState("")

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

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success("Review submitted! Thank you 🎉")
      setReviewProduct(null)
      setReviewRating(5)
      setReviewComment("")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit review")
    }
  })

  const orders = data?.data?.data || []

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingId(orderId)
    try {
      const response = await downloadInvoice(orderId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${orderId.slice(-8).toUpperCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error("Failed to download invoice")
    } finally {
      setDownloadingId(null)
    }
  }

  const toggleExpanded = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  const STAR_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Orders</h2>
        <p className="text-muted-foreground mt-1">Track and manage all your orders in one place.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center border-2 border-dashed rounded-2xl bg-muted/20">
          <div className="mb-4 rounded-full bg-muted p-5">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No orders yet</h3>
          <p className="text-muted-foreground mt-1">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING
            const StatusIcon = cfg.icon
            const paymentCfg = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.PENDING
            const isExpanded = expandedOrders[order._id]
            const isDelivered = order.orderStatus === "DELIVERED"
            const canCancel = !["CANCELLED", "DELIVERED", "RETURNED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(order.orderStatus)
            const canReturn = isDelivered

            return (
              <div key={order._id} className="rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 ${cfg.bg} border-b ${cfg.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${cfg.bg} ring-2 ${cfg.ring} shrink-0`}>
                      <StatusIcon className={`h-4 w-4 ${cfg.text}`} />
                    </div>
                    <div>
                      <Link 
                        to={`/dashboard/orders/${order._id}`}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 hover:underline underline-offset-2 transition-colors flex items-center gap-1 group"
                      >
                        Order #{order._id.slice(-8).toUpperCase()}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}></span>
                      {cfg.label}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paymentCfg.bg} ${paymentCfg.text}`}>
                      {paymentCfg.label}
                    </span>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="px-5 py-4 border-b bg-slate-50/50">
                  <OrderTimeline status={order.orderStatus} />
                </div>

                {/* Items Preview (collapsed) */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""} · <span className="font-bold text-slate-900">{formatPrice(order.totalPrice)}</span></p>
                    <button
                      onClick={() => toggleExpanded(order._id)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {isExpanded ? "Show less" : "View items"}
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Item thumbnails (always visible) */}
                  <div className="flex gap-2 flex-wrap">
                    {order.items?.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="h-12 w-12 rounded-lg border bg-slate-100 overflow-hidden shrink-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]?.url || item.product.images[0]} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="h-12 w-12 rounded-lg border bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Expanded item details */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border">
                          <div className="h-16 w-16 rounded-xl border bg-white overflow-hidden shrink-0">
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]?.url || item.product.images[0]} alt={item.productName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-slate-100">
                                <Package className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-semibold text-slate-900 text-sm truncate">{item.productName}</p>
                             <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} × {formatPrice(item.sellingPrice)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="font-bold text-slate-900">{formatPrice(item.sellingPrice * item.quantity)}</p>
                            {isDelivered && (
                              <button
                                onClick={() => {
                                  setReviewProduct({ id: item.product?._id || item.product, name: item.productName })
                                  setReviewRating(5)
                                  setReviewComment("")
                                }}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                              >
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                Rate & Review
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-slate-50 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold bg-white hover:bg-slate-50"
                    onClick={() => handleDownloadInvoice(order._id)}
                    disabled={downloadingId === order._id}
                  >
                    {downloadingId === order._id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                    Invoice
                  </Button>
                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold bg-white text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => setOrderToCancel(order._id)}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Cancel Order
                    </Button>
                  )}
                  {canReturn && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold bg-white hover:bg-slate-50"
                      onClick={() => setOrderToReturn(order._id)}
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Return Order
                    </Button>
                  )}
                  {isDelivered && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Delivered — Expand to leave a review
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Cancel Modal ─── */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Cancel Order?</h3>
                <p className="text-sm text-slate-500 mt-1">This action cannot be undone. Your payment will be refunded.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
              <Textarea
                placeholder="Tell us why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="resize-none rounded-xl"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="rounded-xl" onClick={() => { setOrderToCancel(null); setCancelReason("") }} disabled={cancelMutation.isPending}>Keep Order</Button>
              <Button variant="destructive" className="rounded-xl" onClick={() => cancelMutation.mutate({ id: orderToCancel, reason: cancelReason })} disabled={cancelMutation.isPending}>
                {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Return Modal ─── */}
      {orderToReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Return Order?</h3>
                <p className="text-sm text-slate-500 mt-1">We'll initiate the return process and issue a refund once the item is received.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="rounded-xl" onClick={() => setOrderToReturn(null)} disabled={returnMutation.isPending}>Go Back</Button>
              <Button className="rounded-xl" onClick={() => returnMutation.mutate(orderToReturn)} disabled={returnMutation.isPending}>
                {returnMutation.isPending ? "Processing..." : "Confirm Return"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Review Modal ─── */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Rate Your Purchase</h3>
                  <p className="text-sm text-slate-500 truncate max-w-[260px]">{reviewProduct.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Overall Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star className={`h-9 w-9 transition-colors ${star <= (hoveredStar || reviewRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-amber-600">
                    {STAR_LABELS[hoveredStar || reviewRating]}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Your Review</label>
                <Textarea
                  placeholder="What did you like or dislike? Share details about quality, size, or use case..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="resize-none rounded-xl min-h-[110px] text-sm"
                />
                <p className="text-xs text-slate-400 text-right">{reviewComment.length} chars</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => { setReviewProduct(null); setReviewRating(5); setReviewComment("") }}
                  disabled={reviewMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  onClick={() => reviewMutation.mutate({ productId: reviewProduct.id, rating: reviewRating, comment: reviewComment })}
                  disabled={reviewMutation.isPending || !reviewComment.trim()}
                >
                  {reviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4 fill-white text-white" />}
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
