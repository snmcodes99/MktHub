import { useQuery } from "@tanstack/react-query"
import { Package, Clock, CheckCircle, Store, User as UserIcon, Mail, Calendar, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { getMyOrders } from "@/api/orderApi"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"

export default function CustomerOverview() {
  const { user } = useAuth()
  
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
  })

  const orders = data?.data?.data || []
  
  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: <Package className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Pending Orders",
      value: orders.filter(o => o.orderStatus === "PENDING" || o.orderStatus === "PLACED").length,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-100 dark:bg-amber-900/30"
    },
    {
      title: "Delivered",
      value: orders.filter(o => o.orderStatus === "DELIVERED").length,
      icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-100 dark:bg-emerald-900/30"
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Profile Header */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-sm">
                <UserIcon className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user?.email}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {user?.role === 'SELLER' && (
                <Link to="/seller" className="w-full sm:w-auto">
                  <Button className="w-full gap-2 shadow-sm">
                    <Store className="h-4 w-4" />
                    Seller Dashboard
                  </Button>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="w-full sm:w-auto">
                  <Button variant="default" className="w-full gap-2 shadow-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                    <Store className="h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="w-full sm:w-auto shadow-sm" asChild>
                <Link to="/dashboard/profile">Edit Profile</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Orders Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases and their status.</CardDescription>
          </div>
          {orders.length > 0 && (
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1" asChild>
              <Link to="/dashboard/orders">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/60 rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No orders yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">You haven't placed any orders. When you do, they will show up here.</p>
              <Button className="mt-6" asChild>
                <Link to="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        {formatDate(order.createdAt)}
                        <span className="inline-block w-1 h-1 rounded-full bg-border" />
                        {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 sm:gap-1 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                    <p className="font-bold">{formatPrice(order.totalPrice)}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="sm:hidden pt-4">
                <Button variant="outline" className="w-full items-center gap-2" asChild>
                  <Link to="/dashboard/orders">
                    View All Orders <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
