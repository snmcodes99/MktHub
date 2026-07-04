import { useQuery } from "@tanstack/react-query"
import { DollarSign, ShoppingBag, Package, Store, Loader2 } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import axiosClient from "@/api/axiosClient"

export default function SellerOverview() {
  const { user } = useAuth()
  
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: async () => {
      const response = await axiosClient.get("/seller/dashboard");
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(dashboardData?.totalRevenue || 0),
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Active Products",
      value: dashboardData?.activeProducts || 0,
      icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Orders Pending",
      value: dashboardData?.ordersPending || 0,
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Store Rating",
      value: dashboardData?.storeRating ? dashboardData.storeRating.toString() + " / 5.0" : "No ratings yet",
      icon: <Store className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/seller/orders'}>
            <Package className="mr-2 h-4 w-4" /> View Orders
          </Button>
          <Button onClick={() => window.location.href = '/seller/products'}>
            <ShoppingBag className="mr-2 h-4 w-4" /> Manage Products
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Revenue</CardTitle>
            <div className="bg-green-200/50 p-2 rounded-full">
              <DollarSign className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-950">{formatPrice(dashboardData?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">Active Products</CardTitle>
            <div className="bg-indigo-200/50 p-2 rounded-full">
              <ShoppingBag className="h-4 w-4 text-indigo-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-950">{dashboardData?.activeProducts || 0}</div>
            <p className="text-xs text-indigo-700/70 mt-1">Out of {dashboardData?.totalProducts || 0} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Orders Pending</CardTitle>
            <div className="bg-amber-200/50 p-2 rounded-full">
              <Package className="h-4 w-4 text-amber-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950">{dashboardData?.ordersPending || 0}</div>
            <p className="text-xs text-amber-700/70 mt-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Store Rating</CardTitle>
            <div className="bg-purple-200/50 p-2 rounded-full">
              <Store className="h-4 w-4 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-950">{dashboardData?.storeRating ? dashboardData.storeRating.toString() : "N/A"}</div>
            <p className="text-xs text-purple-700/70 mt-1">Average product rating</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentProducts && dashboardData.recentProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentProducts.map(product => (
                  <div key={product._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(product.sellingPrice)}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You haven't added any products yet.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentOrders.map(order => (
                  <div key={order._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        {order.customerName && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {order.customerName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(order.totalPrice)}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent orders.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
