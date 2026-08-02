import { useQuery } from "@tanstack/react-query"
import {
  Users, ShoppingBag, ListOrdered, TrendingUp, Loader2, Package,
  Store, ArrowRight, Clock, AlertCircle, ShieldCheck,
  CheckCircle, XCircle, Activity
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { getDashboardStats } from "@/api/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

/* ─── Recharts custom tooltip ──────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-bold mb-1 text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

/* ─── Stat card with top gradient bar ─────────────────────────────────── */
function StatCard({ title, value, sub, icon, gradient, bg, iconColor }) {
  return (
    <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-5">
        <div className={`${bg} ${iconColor} p-2.5 rounded-xl w-fit mb-4`}>{icon}</div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-extrabold tracking-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function AdminOverview() {
  const { user } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getDashboardStats,
  })

  if (isLoading) return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading platform data…</p>
    </div>
  )

  if (isError) return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h3 className="text-lg font-semibold">Failed to load statistics</h3>
      <p className="text-muted-foreground text-sm">Please refresh the page.</p>
    </div>
  )

  const stats = data?.data?.data || {}

  /* ─── Chart data ─── */
  const userPieData = [
    { name: "Customers", value: stats.totalCustomers || 0, color: "#6366f1" },
    { name: "Sellers", value: stats.totalSellers || 0, color: "#8b5cf6" },
    { name: "Admins", value: stats.totalAdmins || 0, color: "#ec4899" },
  ]

  const orderBarData = [
    { name: "Pending", value: stats.pendingOrders || 0, fill: "#fbbf24" },
    { name: "Processing", value: stats.processingOrders || 0, fill: "#60a5fa" },
    { name: "Delivered", value: stats.deliveredOrders || 0, fill: "#34d399" },
    { name: "Cancelled", value: stats.cancelledOrders || 0, fill: "#f87171" },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* ── Clean Slim Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Admin Panel</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Platform Overview</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl text-slate-700 border-slate-200 bg-white hover:bg-slate-50" asChild>
            <Link to="/admin/requests">
              <Clock className="h-4 w-4 text-amber-500" />
              Seller Requests
              {stats.pendingSellerRequests > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">{stats.pendingSellerRequests}</span>
              )}
            </Link>
          </Button>
          <Button size="sm" className="gap-2 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
            <Link to="/admin/users"><Users className="h-4 w-4" />Manage Users</Link>
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatPrice(stats.totalRevenue || 0)} sub="Platform lifetime" icon={<TrendingUp className="h-5 w-5" />} gradient="from-emerald-500 to-teal-600" bg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Total Users" value={(stats.totalUsers || (stats.totalCustomers || 0) + (stats.totalSellers || 0) + (stats.totalAdmins || 0)).toLocaleString()} sub={`${stats.totalSellers || 0} sellers · ${stats.totalCustomers || 0} customers`} icon={<Users className="h-5 w-5" />} gradient="from-blue-500 to-indigo-600" bg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Total Products" value={(stats.totalProducts || 0).toLocaleString()} sub={`${stats.inactiveProducts || 0} inactive`} icon={<ShoppingBag className="h-5 w-5" />} gradient="from-purple-500 to-violet-600" bg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="Total Orders" value={(stats.totalOrders || (stats.pendingOrders || 0) + (stats.deliveredOrders || 0) + (stats.processingOrders || 0) + (stats.cancelledOrders || 0)).toLocaleString()} sub={`${stats.pendingOrders || 0} pending`} icon={<Package className="h-5 w-5" />} gradient="from-orange-500 to-amber-600" bg="bg-orange-50" iconColor="text-orange-600" />
      </div>



      {/* ── Action Panels ──────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Order details */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-orange-500" /> Order Details
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-8" asChild>
              <Link to="/admin/orders">View <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Pending", value: stats.pendingOrders || 0, color: "bg-amber-500" },
              { label: "Processing", value: stats.processingOrders || 0, color: "bg-blue-500" },
              { label: "Delivered", value: stats.deliveredOrders || 0, color: "bg-emerald-500" },
              { label: "Cancelled", value: stats.cancelledOrders || 0, color: "bg-red-500" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-sm`} />
                  <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-base font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User breakdown detail */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" /> User Breakdown
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-8" asChild>
              <Link to="/admin/users">Manage <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Customers", value: stats.totalCustomers || 0, dot: "bg-indigo-500" },
              { label: "Sellers", value: stats.totalSellers || 0, dot: "bg-violet-500" },
              { label: "Admins", value: stats.totalAdmins || 0, dot: "bg-pink-500" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.dot} shadow-sm`} />
                  <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-base font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Required */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-rose-500" /> Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Seller Requests</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Awaiting approval</p>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">{stats.pendingSellerRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 mb-2">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Inactive Products</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Need attention</p>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">{stats.inactiveProducts || 0}</span>
            </div>
            <Button className="w-full gap-2 mt-1" variant="outline" asChild>
              <Link to="/admin/requests"><ShieldCheck className="h-4 w-4" />Review Seller Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Access ──────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Access</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Users", icon: <Users className="h-5 w-5" />, to: "/admin/users", c: "text-blue-500" },
            { label: "Orders", icon: <Package className="h-5 w-5" />, to: "/admin/orders", c: "text-orange-500" },
            { label: "Products", icon: <ShoppingBag className="h-5 w-5" />, to: "/admin/products", c: "text-purple-500" },
            { label: "Categories", icon: <ListOrdered className="h-5 w-5" />, to: "/admin/categories", c: "text-teal-500" },
            { label: "Seller Reqs", icon: <Store className="h-5 w-5" />, to: "/admin/requests", c: "text-rose-500" },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all shadow-sm">
              <div className={`h-10 w-10 rounded-full bg-muted group-hover:bg-background shadow-sm flex items-center justify-center transition-colors ${a.c}`}>{a.icon}</div>
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
