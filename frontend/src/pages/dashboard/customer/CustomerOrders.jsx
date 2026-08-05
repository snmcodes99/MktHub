import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Package, Loader2, XCircle, Download, Star, MessageSquare, 
  Clock, CheckCircle2, Truck, MapPin, ShoppingBag, RotateCcw,
  ChevronDown, ChevronUp, AlertCircle, ArrowRight, Search, PackageSearch
} from "lucide-react"
import { getMyOrders, cancelOrder, returnOrder, downloadInvoice } from "@/api/orderApi"
import { createReview } from "@/api/reviewApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice, formatDate } from "@/lib/utils"
import { ORDER_STATUS_FLOW } from "@/lib/constants"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

// Status config with icon, color classes, and label
const STATUS_CONFIG = {
  PENDING:          { label: "Pending",          icon: Clock,          bg: "bg-amber-50 dark:bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",  border: "border-amber-200 dark:border-amber-500/20",  dot: "bg-amber-500",  ring: "ring-amber-200 dark:ring-amber-500/20" },
  PLACED:           { label: "Placed",           icon: CheckCircle2,   bg: "bg-blue-50 dark:bg-blue-500/10",    text: "text-blue-600 dark:text-blue-400",   border: "border-blue-200 dark:border-blue-500/20",   dot: "bg-blue-500",   ring: "ring-blue-200 dark:ring-blue-500/20" },
  PROCESSING:       { label: "Processing",       icon: Package,        bg: "bg-orange-50 dark:bg-orange-500/10",  text: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-500/20", dot: "bg-orange-500", ring: "ring-orange-200 dark:ring-orange-500/20" },
  SHIPPED:          { label: "Shipped",          icon: Truck,          bg: "bg-indigo-50 dark:bg-indigo-500/10",  text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-500/20", dot: "bg-indigo-500", ring: "ring-indigo-200 dark:ring-indigo-500/20" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: MapPin,         bg: "bg-purple-50 dark:bg-purple-500/10",  text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-500/20", dot: "bg-purple-500", ring: "ring-purple-200 dark:ring-purple-500/20" },
  DELIVERED:        { label: "Delivered",        icon: CheckCircle2,   bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400",border: "border-emerald-200 dark:border-emerald-500/20",dot: "bg-emerald-500",ring: "ring-emerald-200 dark:ring-emerald-500/20" },
  CANCELLED:        { label: "Cancelled",        icon: XCircle,        bg: "bg-red-50 dark:bg-rose-500/10",     text: "text-red-600 dark:text-rose-400",    border: "border-red-200 dark:border-rose-500/20",    dot: "bg-red-500",    ring: "ring-red-200 dark:ring-rose-500/20" },
  RETURNED:         { label: "Returned",         icon: RotateCcw,      bg: "bg-slate-50 dark:bg-slate-500/10",   text: "text-slate-600 dark:text-slate-400",  border: "border-slate-200 dark:border-slate-500/20",  dot: "bg-slate-500",  ring: "ring-slate-200 dark:ring-slate-500/20" },
}

const PAYMENT_CONFIG = {
  PENDING: { label: "Pay Pending", bg: "bg-amber-100 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400" },
  PAID:    { label: "Paid",        bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
  FAILED:  { label: "Failed",      bg: "bg-red-100 dark:bg-rose-500/10", text: "text-red-700 dark:text-rose-400" },
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
                  isDone ? "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" : 
                  "bg-muted text-muted-foreground ring-border"}`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight max-w-[52px]
                ${isCurrent ? cfg.text : isDone ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                {cfg.label}
              </span>
            </div>
            {i < ORDER_STATUS_FLOW.length - 1 && (
              <div className={`h-0.5 w-6 rounded-full mb-4 ${i < currentIndex ? "bg-emerald-400 dark:bg-emerald-500/40" : "bg-border"}`} />
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

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => { setPage(1) }, [searchTerm, statusFilter, limit])

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", page, limit, searchTerm, statusFilter],
    queryFn: () => getMyOrders({ 
      page, limit, 
      orderNumber: searchTerm || undefined,
      orderStatus: statusFilter !== "ALL" ? statusFilter : undefined
    }),
  })

  const resultData = data?.data?.data || {}
  const orders = resultData.orders || (Array.isArray(resultData) ? resultData : [])
  const totalPages = resultData.pagination?.totalPages || 0

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


  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">My Orders</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Track, manage and review your purchases.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Order ID..."
              className="pl-9 bg-card border-border rounded-xl text-sm h-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center text-center border border-dashed rounded-2xl bg-card/50">
          <div className="mb-4 rounded-full bg-muted/50 p-5">
            <PackageSearch className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No orders found</h3>
          <p className="text-muted-foreground mt-1 mb-6">Your order history will appear here. Start shopping to get your first order!</p>
          <Link to="/products">
            <Button className="rounded-full px-8">Start Shopping</Button>
          </Link>
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
              <div key={order._id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 ${cfg.bg} border-b ${cfg.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${cfg.bg} ring-2 ${cfg.ring} shrink-0`}>
                      <StatusIcon className={`h-4 w-4 ${cfg.text}`} />
                    </div>
                    <div>
                      <Link 
                        to={`/dashboard/orders/${order._id}`}
                        className="font-bold text-foreground text-sm hover:text-primary hover:underline underline-offset-2 transition-colors flex items-center gap-1 group"
                      >
                        {order.orderNumber || `Order #${order._id.slice(-8).toUpperCase()}`}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">Placed on {formatDate(order.createdAt)}</p>
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
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <OrderTimeline status={order.orderStatus} />
                </div>

                {/* Items Preview (collapsed) */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-muted-foreground">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""} · <span className="font-bold text-foreground">{formatPrice(order.totalPrice)}</span></p>
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
                      <div key={idx} className="h-12 w-12 rounded-lg border border-border bg-muted overflow-hidden shrink-0">
                        <img 
                          src={item.product?.images?.[0]?.url || item.product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"} 
                          alt={item.productName} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="h-12 w-12 rounded-lg border border-border bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Expanded item details */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border">
                          <div className="h-16 w-16 rounded-xl border border-border bg-card overflow-hidden shrink-0">
                            <img 
                              src={item.product?.images?.[0]?.url || item.product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"} 
                              alt={item.productName} 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                             <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity} × {formatPrice(item.sellingPrice)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="font-bold text-foreground">{formatPrice(item.sellingPrice * item.quantity)}</p>
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
                <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-muted/20 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold bg-card hover:bg-muted"
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
                      className="h-8 text-xs font-semibold bg-card text-destructive border-destructive/30 hover:bg-destructive/10"
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
                      className="h-8 text-xs font-semibold bg-card hover:bg-muted"
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

      {totalPages > 0 && (
        <div className="border-t border-border px-5 py-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(newLimit) => {
              setLimit(newLimit)
              setPage(1)
            }}
          />
        </div>
      )}

      {/* ─── Cancel Modal ─── */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Cancel Order?</h3>
                <p className="text-sm text-muted-foreground mt-1">This action cannot be undone. Your payment will be refunded.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason (optional)</label>
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
          <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Return Order?</h3>
                <p className="text-sm text-muted-foreground mt-1">We'll initiate the return process and issue a refund once the item is received.</p>
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
          <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Rate Your Purchase</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-[260px]">{reviewProduct.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Overall Rating</label>
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
                      <Star className={`h-9 w-9 transition-colors ${star <= (hoveredStar || reviewRating) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-amber-600 dark:text-amber-500">
                    {STAR_LABELS[hoveredStar || reviewRating]}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Your Review</label>
                <Textarea
                  placeholder="What did you like or dislike? Share details about quality, size, or use case..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="resize-none rounded-xl min-h-[110px] text-sm"
                />
                <p className="text-xs text-muted-foreground text-right">{reviewComment.length} chars</p>
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
