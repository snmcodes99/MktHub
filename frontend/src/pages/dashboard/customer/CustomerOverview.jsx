import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Package, Clock, CheckCircle, Store, User as UserIcon, Mail,
  MapPin, ArrowRight, ShieldCheck, AlertTriangle, Clock as ClockIcon,
  Edit2, Trash2, Star, Plus, Loader2, Phone, Lock, ChevronRight,
  ShoppingBag, TrendingUp, Heart, Gift, Zap, XCircle, CreditCard, Ticket, HeadphonesIcon, Truck
} from "lucide-react"
import { Link } from "react-router-dom"
import { getMyOrders } from "@/api/orderApi"
import { getAddresses, deleteAddress, setDefaultAddress } from "@/api/addressApi"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { resendVerificationEmail, resendEmailChange } from "@/api/authApi"
import { toast } from "sonner"

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const STATUS = {
  PENDING:    { label: "Pending",          bg: "bg-amber-50 dark:bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-500/20" },
  PLACED:     { label: "Confirmed",        bg: "bg-amber-50 dark:bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-500/20" },
  PROCESSING: { label: "Processing",       bg: "bg-indigo-50 dark:bg-indigo-500/10",  text: "text-indigo-600 dark:text-indigo-400",  border: "border-indigo-200 dark:border-indigo-500/20" },
  SHIPPED:    { label: "Out for Delivery", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/20" },
  DELIVERED:  { label: "Delivered",        bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20" },
  CANCELLED:  { label: "Cancelled",        bg: "bg-red-50 dark:bg-rose-500/10",   text: "text-red-600 dark:text-rose-400",   border: "border-red-200 dark:border-rose-500/20" },
  RETURNED:   { label: "Returned",         bg: "bg-slate-50 dark:bg-slate-500/10",   text: "text-slate-500 dark:text-slate-400",   border: "border-slate-200 dark:border-slate-500/20" },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.PENDING
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${s.bg} ${s.text} border ${s.border}`}>
      {s.label}
    </span>
  )
}

const PAYMENT_STATUS = {
  PENDING:  { label: "Pay Pending",  bg: "bg-amber-50 dark:bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-500/20" },
  PAID:     { label: "Paid",         bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20" },
  FAILED:   { label: "Pay Failed",   bg: "bg-red-50 dark:bg-rose-500/10",     text: "text-red-600 dark:text-rose-400",     border: "border-red-200 dark:border-rose-500/20" },
  REFUNDED: { label: "Refunded",     bg: "bg-slate-50 dark:bg-slate-500/10",   text: "text-slate-500 dark:text-slate-400",   border: "border-slate-200 dark:border-slate-500/20" },
}

function PaymentBadge({ status }) {
  const s = PAYMENT_STATUS[status] || PAYMENT_STATUS.PENDING
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${s.bg} ${s.text} border ${s.border}`}>
      {s.label}
    </span>
  )
}

function VerificationAlert({ user }) {
  const [loading, setLoading] = useState(false)
  const [changeLoading, setChangeLoading] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    try {
      await resendVerificationEmail({ email: user.email })
      toast.success("Verification email sent", { description: "Check your inbox and spam folder." })
    } catch (e) {
      toast.error(e?.response?.data?.message || "Please try again later.")
    } finally { setLoading(false) }
  }

  const handleResendChange = async () => {
    setChangeLoading(true)
    try {
      await resendEmailChange()
      toast.success("Verification email resent")
    } catch (e) {
      toast.error(e?.response?.data?.message || "Please try again later.")
    } finally { setChangeLoading(false) }
  }

  if (user?.pendingEmail) return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm mb-6">
      <ClockIcon className="h-4 w-4 text-blue-500 shrink-0" />
      <p className="flex-1 text-blue-800 font-medium text-xs">Pending verification: <span className="font-bold">{user.pendingEmail}</span></p>
      <button onClick={handleResendChange} disabled={changeLoading} className="text-xs text-blue-600 font-semibold hover:underline disabled:opacity-50">
        {changeLoading ? "Sending..." : "Resend"}
      </button>
    </div>
  )

  if (!user?.isEmailVerified) return (
    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      <p className="flex-1 text-amber-800 font-medium text-xs">Your email is not yet verified</p>
      <button onClick={handleResend} disabled={loading} className="text-xs text-amber-700 font-semibold hover:underline disabled:opacity-50">
        {loading ? "Sending..." : "Verify now"}
      </button>
    </div>
  )

  return null
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function CustomerOverview() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: ordersData, isLoading: ordersLoading } = useQuery({ queryKey: ["my-orders"], queryFn: getMyOrders })
  const { data: addrData, isLoading: addrLoading } = useQuery({ queryKey: ["addresses"], queryFn: getAddresses })

  const orders = ordersData?.data?.data?.orders || []
  const addresses = addrData?.data?.data || []

  const pendingCount = orders.filter(o => ["PENDING","PLACED","PROCESSING","SHIPPED"].includes(o.orderStatus)).length
  const deliveredCount = orders.filter(o => o.orderStatus === "DELIVERED").length
  const recentOrders = orders.slice(0, 5)
  const totalSpent = orders.filter(o => o.orderStatus === "DELIVERED").reduce((s, o) => s + o.totalPrice, 0)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-foreground">

      {/* Verification Alert */}
      {(!user?.isEmailVerified || user?.pendingEmail) && <VerificationAlert user={user} />}

      {/* ── 1. HEADER ROW ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0]}! <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your account today.</p>
        </div>

      </div>

      {/* ── 2. STAT CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Orders", value: orders.length, icon: <ShoppingBag className="h-4 sm:h-5 w-4 sm:w-5 text-blue-500" />, iconBg: "bg-blue-500/10", link: "/dashboard/orders", linkText: "View all orders >" },
          { label: "To Be Delivered", value: pendingCount, icon: <Truck className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" />, iconBg: "bg-emerald-500/10", link: "/dashboard/orders", linkText: "Track your orders >" },
          { label: "Completed Orders", value: deliveredCount, icon: <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-purple-500" />, iconBg: "bg-purple-500/10", link: "/dashboard/orders", linkText: "View history >" },
          { label: "Total Spent", value: formatPrice(totalSpent), icon: <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-rose-500" />, iconBg: "bg-rose-500/10", link: "/dashboard/orders", linkText: "View orders >" },
        ].map((s, i) => (
          <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full ${s.iconBg} flex items-center justify-center`}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1 truncate leading-tight">{s.label}</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight mb-0.5 sm:mb-1 text-foreground truncate">{s.value}</p>
                <Link to={s.link} className="text-[10px] sm:text-[11px] text-primary font-bold hover:underline truncate block">{s.linkText}</Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 3. MAIN CONTENT GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Recent Orders & Recommended */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Recent Orders */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/50">
              <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
              <Link to="/dashboard/orders" className="text-xs font-bold text-blue-600 flex items-center hover:underline">
                View All Orders <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="p-6 space-y-4 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-muted/60 rounded-xl" />)}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentOrders.map((order) => {
                    const firstItem = order.items?.[0]
                    return (
                      <Link key={order._id} to={`/dashboard/orders/${order._id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
                        <div className="h-14 w-14 rounded-lg border bg-background flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          <img 
                            src={firstItem?.product?.images?.[0]?.url || firstItem?.product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"} 
                            alt="product" 
                            className="h-full w-full object-contain" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-sm text-foreground truncate">{firstItem?.product?.name || "Product"}</p>
                          <p className="text-xs text-muted-foreground mt-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="text-right shrink-0 px-4 flex flex-col items-end gap-1">
                          <p className="font-bold text-sm text-foreground mb-1">{formatPrice(order.totalPrice)}</p>
                          <div className="flex items-center gap-1">
                            <StatusBadge status={order.orderStatus} />
                            <PaymentBadge status={order.paymentStatus} />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0 min-w-[90px] text-right pr-4 hidden sm:block">
                          {formatDate(order.createdAt)}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        {/* RIGHT COLUMN: Account Overview, Help, Notifications */}
        <div className="flex flex-col gap-6">
          
          {/* Account Overview Links */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="py-4 border-b bg-muted/50">
              <CardTitle className="text-base font-bold">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {[
                  { icon: <UserIcon className="h-5 w-5 text-muted-foreground" />, title: "Profile Information", desc: "Update your personal details", link: "/dashboard/profile" },
                  { icon: <MapPin className="h-5 w-5 text-muted-foreground" />, title: "Manage Addresses", desc: "Add or edit delivery addresses", link: "/dashboard/addresses" },
                ].map((item, i) => (
                  <Link key={i} to={item.link} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-background group-hover:shadow-sm transition-all border border-transparent group-hover:border-border">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>



        </div>
      </div>
    </div>
  )
}
