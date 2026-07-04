import { useQuery } from "@tanstack/react-query"
import { Users, ShoppingBag, ListOrdered, TrendingUp, Loader2, Package, Store, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { getDashboardStats } from "@/api/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

export default function AdminOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Failed to Load Statistics</h3>
        <p className="text-muted-foreground mt-1">Please refresh the page to try again.</p>
      </div>
    )
  }

  const stats = data?.data?.data

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Users",
      value: (stats?.totalUsers || 0).toLocaleString(),
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: (stats?.totalProducts || 0).toLocaleString(),
      icon: ShoppingBag,
      gradient: "from-purple-500 to-violet-600",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Orders",
      value: (stats?.totalOrders || 0).toLocaleString(),
      icon: Package,
      gradient: "from-orange-500 to-amber-600",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      iconColor: "text-orange-600",
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your platform's real-time overview.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl ${stat.bg} p-3`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* User Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Customers", value: stats?.totalCustomers || 0, color: "bg-slate-400" },
              { label: "Sellers", value: stats?.totalSellers || 0, color: "bg-indigo-500" },
              { label: "Admins", value: stats?.totalAdmins || 0, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold text-sm">{item.value.toLocaleString()}</span>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link to="/admin/users">Manage Users <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" /> Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Pending", value: stats?.pendingOrders || 0, color: "bg-yellow-400" },
              { label: "Processing", value: stats?.processingOrders || 0, color: "bg-blue-400" },
              { label: "Delivered", value: stats?.deliveredOrders || 0, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold text-sm">{item.value.toLocaleString()}</span>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link to="/admin/orders">Manage Orders <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="border-orange-200 dark:border-orange-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" /> Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending Seller Requests</span>
              </div>
              <span className="font-bold text-amber-700 dark:text-amber-400 text-lg">{stats?.pendingSellerRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Inactive Products</span>
              </div>
              <span className="font-bold text-red-700 dark:text-red-400 text-lg">{stats?.inactiveProducts || 0}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link to="/admin/requests">Review Requests <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
