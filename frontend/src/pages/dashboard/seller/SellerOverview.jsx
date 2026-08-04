import { useQuery } from "@tanstack/react-query"
import {
  DollarSign, ShoppingBag, Package, Store, Loader2, TrendingUp,
  ArrowRight, Star, AlertCircle, BarChart2, Boxes, Calendar as CalendarIcon,
  ChevronDown, ArrowUp, Bell, MessageSquare, Plus, CheckCircle, Search
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "@/lib/utils"
import axiosClient from "@/api/axiosClient"
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"

const STATUS_STYLE = {
  PENDING:    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  PLACED:     "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PROCESSING: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  SHIPPED:    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  DELIVERED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  CANCELLED:  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-bold mb-1 text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-bold text-[14px]">
          {p.value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  )
}

export default function SellerOverview() {
  const { user } = useAuth()

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: async () => {
      const res = await axiosClient.get("/seller/dashboard")
      return res.data.data
    }
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-semibold">Failed to load dashboard</p>
      </div>
    )
  }

  const d = dashboardData || {}

  const revenueTrendData = d.revenueTrend?.length > 0 ? d.revenueTrend : [
    { name: "Mon", value: 0 }, { name: "Tue", value: 0 }, { name: "Wed", value: 0 },
    { name: "Thu", value: 0 }, { name: "Fri", value: 0 }, { name: "Sat", value: 0 }, { name: "Sun", value: 0 }
  ];

  const topProducts = d.topProducts?.length > 0
    ? d.topProducts.map(p => ({ ...p, trend: "+5%" }))
    : [];

  const pieData = [
    { name: "Active",       value: d.activeProducts     || 0, color: "#22c55e" },
    { name: "Out of Stock", value: d.outOfStockProducts  || 0, color: "#3b82f6" },
    { name: "Draft",        value: d.draftProducts       || 0, color: "#eab308" }
  ].filter(p => p.value > 0);

  const statCards = [
    { title: "Total Products", value: d.totalProducts || 0,                          bg: "bg-blue-100 dark:bg-blue-900/30",   icon: <Package   className="h-5 w-5 text-blue-600   dark:text-blue-400"   /> },
    { title: "Total Orders",   value: d.recentOrders ? d.recentOrders.length : 0,    bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> },
    { title: "Total Revenue",  value: formatPrice(d.totalRevenue || 0),               bg: "bg-purple-100 dark:bg-purple-900/30",   icon: <DollarSign  className="h-5 w-5 text-purple-600  dark:text-purple-400"  /> },
    { title: "Store Rating",   value: d.storeRating ? `${Number(d.storeRating).toFixed(1)} / 5` : "0 / 5",
      trend: d.storeRating ? "Based on recent reviews" : "No reviews yet",
      bg: "bg-amber-100 dark:bg-amber-900/30", icon: <Star className="h-5 w-5 text-amber-500 dark:text-amber-400" />, isRating: true },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || "TechStore"}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-medium">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Last 7 Days <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s, i) => (
          <Card key={i} className="shadow-sm overflow-hidden">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  {s.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-0.5 truncate uppercase tracking-wider leading-tight">{s.title}</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground truncate">{s.value}</p>
                </div>
              </div>
              {s.isRating && (
                <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
                  <span className="text-muted-foreground truncate">{s.trend}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts & Top Products ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
            <CardTitle className="text-base font-bold">Sales Overview</CardTitle>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-semibold">
              Last 7 Days <ChevronDown className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-6 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}K`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)"
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                  activeDot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "hsl(var(--card))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
            <CardTitle className="text-base font-bold">Top Selling Products</CardTitle>
            <span className="text-xs font-bold text-primary cursor-pointer hover:underline">View All</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {topProducts?.length > 0 ? (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors">
                    <div className="h-12 w-12 rounded-lg border border-border bg-muted flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img src={p.img?.url || p.img} alt={p.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.sold} sold</p>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <ArrowUp className="h-3 w-3" /> {p.trend}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No sales data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Bottom Row: Tables & Activity ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-border">
            <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
            <span className="text-xs font-bold text-primary cursor-pointer hover:underline">View All</span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-sm font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recentOrders?.length > 0 ? (
                  d.recentOrders.slice(0, 4).map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 font-semibold text-muted-foreground">{order.orderNumber || `#${order._id?.substring(0,8).toUpperCase()}`}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{order.customerName || "Customer"}</td>
                      <td className="px-4 py-3 font-bold text-foreground">{formatPrice(order.totalPrice)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[order.orderStatus] || "bg-muted text-muted-foreground"}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm text-muted-foreground font-medium">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Product Performance (Donut) */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-0 border-b border-border">
            <CardTitle className="text-base font-bold">Product Performance</CardTitle>
            <span className="text-xs font-bold text-primary cursor-pointer hover:underline mb-3">View All</span>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-between flex-1">
            <div className="relative h-32 w-32 shrink-0">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-4 border-border border-dashed" />
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-bold text-foreground leading-tight">{d.totalProducts || 0}</span>
                <span className="text-[9px] font-semibold text-muted-foreground">Total Products</span>
              </div>
            </div>
            <div className="flex-1 pl-6 space-y-3">
              {pieData.length > 0 ? (
                pieData.map((dataItem, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: dataItem.color }} />
                    <span className="flex-1">{dataItem.name}</span>
                    <span className="text-foreground font-bold">{dataItem.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No products added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
