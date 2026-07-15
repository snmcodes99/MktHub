import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield } from "lucide-react"
import { toast } from "sonner"

import { getCart, updateCartItem, removeCartItem } from "@/api/cartApi"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"

export default function CartPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }) => updateCartItem(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update quantity")
    }
  })

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      toast.success("Item removed from cart")
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove item")
    }
  })

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Your cart is waiting</h2>
        <p className="mb-8 text-muted-foreground">Please log in to view your cart and start shopping.</p>
        <Link to="/login">
          <Button size="lg" className="rounded-full px-8">Log in to your account</Button>
        </Link>
      </div>
    )
  }

  const cart = data?.data?.data
  const items = cart?.items || []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <div className="flex animate-pulse flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted" />
            ))}
          </div>
          <div className="w-full lg:w-96">
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Your cart is empty</h2>
        <p className="mb-8 text-muted-foreground max-w-sm text-balance">
          Looks like you haven't added anything to your cart yet. Discover something new today!
        </p>
        <Link to="/products">
          <Button size="lg" className="rounded-full px-8">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return
    if (newQuantity > item.product.stock) {
      toast.error(`Only ${item.product.stock} items available`)
      return
    }
    updateMutation.mutate({ id: item.product._id, quantity: newQuantity })
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
              <Link to={`/products/${item.product._id}`} className="shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-xl bg-muted">
                  <img
                    src={item.product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex flex-1 flex-col">
                <Link to={`/products/${item.product._id}`} className="mb-1 font-semibold hover:text-primary transition-colors">
                  {item.product.name}
                </Link>
                <div className="text-lg font-bold">{formatPrice(item.product.sellingPrice)}</div>
                
                <div className="mt-4 flex items-center justify-between sm:mt-auto">
                  <div className="flex items-center rounded-lg border bg-background">
                    <button
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      key={`${item._id}-${item.quantity}`}
                      type="number"
                      min="1"
                      max={item.product.stock}
                      defaultValue={item.quantity}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val !== item.quantity) {
                          handleUpdateQuantity(item, Math.max(1, Math.min(item.product.stock, val)));
                        } else {
                          e.target.value = item.quantity;
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                      disabled={updateMutation.isPending}
                      className="flex h-8 w-12 items-center justify-center font-medium text-sm border-x text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock || updateMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeMutation.mutate(item.product._id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="sticky top-24 w-full rounded-2xl border bg-card p-6 shadow-sm lg:w-96">
          <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
              <span className="font-medium">{formatPrice(cart.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping estimate</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax estimate</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-6 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
          
          <Link to="/checkout" className="block">
            <Button size="lg" className="w-full text-base h-14 rounded-xl group">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <p className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" /> Secure checkout powered by mkthub
          </p>
        </div>
      </div>
    </div>
  )
}
