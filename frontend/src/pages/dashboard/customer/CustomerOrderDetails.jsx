import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Package, Loader2, Download } from "lucide-react"
import { getOrderById, downloadInvoice } from "@/api/orderApi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "@/lib/utils"
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants"
import { toast } from "sonner"
import { useState } from "react"

export default function CustomerOrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isDownloading, setIsDownloading] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
  })

  const handleDownloadInvoice = async () => {
    setIsDownloading(true)
    try {
      const response = await downloadInvoice(id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${id.slice(-8).toUpperCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error("Failed to download invoice")
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !data?.data?.data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Order not found or an error occurred.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/orders")}>
          Back to Orders
        </Button>
      </div>
    )
  }

  const order = data.data.data
  const statusColor = ORDER_STATUSES[order.orderStatus]?.color || "secondary"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/orders")} aria-label="Back to orders">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
          <p className="text-muted-foreground">Detailed information about your order.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className={`h-1 w-full bg-${statusColor}`} />
        <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-4">
          <div>
            <CardTitle className="text-lg">Order #{order._id.slice(-8).toUpperCase()}</CardTitle>
            <CardDescription>Placed on {formatDate(order.createdAt)}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
            <div className={`flex items-center rounded-full px-3 py-1 text-xs font-medium border bg-${statusColor}/10 text-${statusColor} border-${statusColor}/20`}>
              {ORDER_STATUSES[order.orderStatus]?.label || order.orderStatus}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 hover:bg-muted"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Shipping Information</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.houseNo}, {order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.country} - {order.shippingAddress?.zipCode}</p>
                <p className="pt-2">Phone: {order.shippingAddress?.phoneNo}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Payment Information</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium text-${PAYMENT_STATUSES[order.paymentStatus]?.color || 'secondary'}`}>
                    {PAYMENT_STATUSES[order.paymentStatus]?.label || order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.product?._id || item.product} className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]?.url || item.product.images[0]}
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
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.sellingPrice)}</p>
                  </div>
                  <div className="font-medium">
                    {formatPrice(item.sellingPrice * item.quantity)}
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t pt-4">
                <span className="font-medium text-lg">Total Amount</span>
                <span className="font-bold text-xl text-primary">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
