import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CreditCard, Truck, Loader2, MapPin, Plus } from "lucide-react"
import { toast } from "sonner"

import { getCart } from "@/api/cartApi"
import { placeOrder } from "@/api/orderApi"
import { getAddresses } from "@/api/addressApi"
import { processPayment } from "@/api/paymentApi"
import { getProductById } from "@/api/productApi"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("CARD") // ONLINE or COD later
  const [isProcessing, setIsProcessing] = useState(false)

  const isBuyNow = location.state?.source === "BUY_NOW"
  const buyNowProductId = location.state?.productId
  const buyNowQuantity = location.state?.quantity || 1

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !isBuyNow
  })

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["product", buyNowProductId],
    queryFn: () => getProductById(buyNowProductId),
    enabled: isBuyNow && !!buyNowProductId
  })

  const { data: addressData, isLoading: addressLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  })

  const addresses = addressData?.data?.data || []
  
  let orderSummary = { items: [], totalPrice: 0 }

  if (isBuyNow && productData?.data?.data) {
    const p = productData.data.data
    orderSummary.items = [{
      _id: "buy_now_item",
      product: p,
      quantity: buyNowQuantity,
      price: p.sellingPrice
    }]
    orderSummary.totalPrice = p.sellingPrice * buyNowQuantity
  } else if (!isBuyNow && cartData?.data?.data) {
    orderSummary = cartData.data.data
  }

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
      setSelectedAddress(defaultAddr._id)
    }
  }, [addresses, selectedAddress])

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address")
      return
    }

    setIsProcessing(true)
    try {
      const payload = {
        addressId: selectedAddress,
        source: isBuyNow ? "BUY_NOW" : "CART"
      }
      
      if (isBuyNow) {
        payload.productId = buyNowProductId
        payload.quantity = buyNowQuantity
      }

      if (paymentMethod === "COD") {
        payload.paymentMethod = "COD"
        // 1. Place order
        await placeOrder(payload)
        toast.success("Order placed successfully with Cash on Delivery.")
        
        // 3. Clear cart cache and redirect
        if (!isBuyNow) {
          queryClient.invalidateQueries({ queryKey: ["cart"] })
        }
        queryClient.invalidateQueries({ queryKey: ["my-orders"] })
        navigate("/dashboard") // or order success page
      } else if (paymentMethod === "CARD") {
        toast.info("Initializing payment gateway...")
        
        const isLoaded = await loadRazorpayScript()
        if (!isLoaded) {
          throw new Error("Razorpay SDK failed to load. Are you online?")
        }

        const res = await processPayment(payload)
        if (!res.data || !res.data.success) {
          throw new Error(res.data?.message || "Failed to initialize payment")
        }

        const checkoutData = res.data.data
        
        const options = {
          key: checkoutData.keyId,
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          name: "mkthub",
          description: "Order Payment",
          order_id: checkoutData.gatewayOrderId,
          handler: function (response) {
            toast.success("Payment successful! Order placed.")
            if (!isBuyNow) {
              queryClient.invalidateQueries({ queryKey: ["cart"] })
            }
            queryClient.invalidateQueries({ queryKey: ["my-orders"] })
            navigate("/dashboard")
          },
          prefill: {
            name: "Customer",
            email: "customer@example.com"
          },
          theme: {
            color: "#0f172a"
          }
        }
        
        const paymentObject = new window.Razorpay(options)
        paymentObject.on('payment.failed', function (response) {
            toast.error(response.error.description || "Payment failed")
        })
        paymentObject.open()
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to process checkout")
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartLoading || addressLoading || productLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (orderSummary.items.length === 0) {
    navigate("/cart")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Checkout Steps */}
        <div className="flex-1 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Address
            </h2>
            
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="mb-4 text-muted-foreground">You don't have any saved addresses.</p>
                <Button variant="outline" onClick={() => navigate("/dashboard/addresses")}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Address
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <label
                    key={address._id}
                    className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all hover:border-primary/50 ${
                      selectedAddress === address._id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address._id}
                      checked={selectedAddress === address._id}
                      onChange={() => setSelectedAddress(address._id)}
                      className="sr-only"
                    />
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">{address.fullName}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {address.addressType}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{address.phone}</span>
                    <span className="mt-2 text-sm text-muted-foreground">
                      {address.street}, {address.city}, {address.state} {address.zipCode}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <CreditCard className="h-5 w-5 text-primary" /> Payment Method
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <label
                className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all hover:border-primary/50 ${
                  paymentMethod === "CARD" ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold">Credit/Debit Card / UPI</div>
                    <div className="text-xs text-muted-foreground">Secure online payment via Razorpay</div>
                  </div>
                </div>
              </label>

              <label
                className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all hover:border-primary/50 ${
                  paymentMethod === "COD" ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-xs text-muted-foreground">Pay when you receive</div>
                  </div>
                </div>
              </label>
            </div>


          </div>
        </div>

        {/* Order Summary */}
        <div className="sticky top-24 w-full rounded-2xl border bg-card p-6 shadow-sm lg:w-96">
          <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
          
          <div className="mb-6 space-y-4 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin">
            {orderSummary.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <img src={item.product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"} alt={item.product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="truncate text-sm font-medium">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-semibold">{formatPrice((item.price || item.product.sellingPrice) * item.quantity)}</div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(orderSummary.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-success">Free</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-6 flex justify-between text-lg font-bold">
            <span>Total to pay</span>
            <span className="text-primary">{formatPrice(orderSummary.totalPrice)}</span>
          </div>
          
          <Button 
            size="lg" 
            className="w-full text-base h-14 rounded-xl"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Processing...
              </span>
            ) : paymentMethod === "CARD" ? "Pay Now" : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}
