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
              { label: "Pending", value: stats.pendingOrders || 0, color: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
              { label: "Processing", value: stats.processingOrders || 0, color: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50" },
              { label: "Delivered", value: stats.deliveredOrders || 0, color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Cancelled", value: stats.cancelledOrders || 0, color: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
            ].map(item => (
              <div key={item.label} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${item.bg}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className={`text-sm font-semibold ${item.text}`}>{item.label}</span>
                </div>
                <span className={`text-base font-extrabold ${item.text}`}>{item.value}</span>
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
              { label: "Customers", value: stats.totalCustomers || 0, bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400" },
              { label: "Sellers", value: stats.totalSellers || 0, bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
              { label: "Admins", value: stats.totalAdmins || 0, bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-400" },
            ].map(item => (
              <div key={item.label} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${item.bg}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span className={`text-sm font-semibold ${item.text}`}>{item.label}</span>
                </div>
                <span className={`text-base font-extrabold ${item.text}`}>{item.value}</span>
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
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">Seller Requests</p>
                  <p className="text-xs text-amber-600">Awaiting approval</p>
                </div>
              </div>
              <span className="text-2xl font-black text-amber-700">{stats.pendingSellerRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900">Inactive Products</p>
                  <p className="text-xs text-red-600">Need attention</p>
                </div>
              </div>
              <span className="text-2xl font-black text-red-700">{stats.inactiveProducts || 0}</span>
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
            { label: "Users", icon: <Users className="h-5 w-5" />, to: "/admin/users", c: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-100" },
            { label: "Orders", icon: <Package className="h-5 w-5" />, to: "/admin/orders", c: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-100" },
            { label: "Products", icon: <ShoppingBag className="h-5 w-5" />, to: "/admin/products", c: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100 border-purple-100" },
            { label: "Categories", icon: <ListOrdered className="h-5 w-5" />, to: "/admin/categories", c: "text-teal-600", bg: "bg-teal-50 hover:bg-teal-100 border-teal-100" },
            { label: "Seller Reqs", icon: <Store className="h-5 w-5" />, to: "/admin/requests", c: "text-rose-600", bg: "bg-rose-50 hover:bg-rose-100 border-rose-100" },
          ].map((a) => (
            <Link key={a.label} to={a.to} className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all ${a.bg}`}>
              <div className={`h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${a.c}`}>{a.icon}</div>
              <span className={`text-xs font-bold ${a.c}`}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
