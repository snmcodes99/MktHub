import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, ShoppingCart, Loader2, Package, Shield, RefreshCw, Zap, Minus, Plus } from "lucide-react"

import { getProductById } from "@/api/productApi"
import { addToCart } from "@/api/cartApi"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatPrice, getDiscount } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ProductReviews } from "@/components/product/ProductReviews"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  })

  const addToCartMutation = useMutation({
    mutationFn: (data) => addToCart(data),
    onSuccess: () => {
      toast.success("Added to cart!")
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add to cart")
    }
  })

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }
    addToCartMutation.mutate({ productId: id, quantity })
  }

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login to buy")
      return
    }
    // Navigate to checkout with BUY_NOW state
    navigate("/checkout", { 
      state: { 
        source: "BUY_NOW", 
        productId: id, 
        quantity 
      } 
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !data?.data?.data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="mt-6">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  const product = data.data.data
  const discount = getDiscount(product.mrp, product.sellingPrice)

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            {discount > 0 && (
              <div className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground shadow-sm">
                {discount}% OFF
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === index ? "border-primary shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-medium text-primary">
            {product.category?.name || "Uncategorized"}
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            {product.name}
          </h1>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Star className="h-4 w-4 fill-primary" />
              {product.averageRating || "0.0"}
            </div>
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
              {product.totalReviews || 0} reviews
            </a>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <div className="text-4xl font-extrabold tracking-tight">
              {formatPrice(product.sellingPrice)}
            </div>
            {product.mrp > product.sellingPrice && (
              <div className="mb-1 text-lg text-muted-foreground line-through">
                {formatPrice(product.mrp)}
              </div>
            )}
          </div>

          <p className="mt-6 text-base text-muted-foreground leading-relaxed text-balance">
            {product.description}
          </p>

          <Separator className="my-8" />

          {/* Quantity Selector */}
          <div className="mb-6 flex items-center gap-4">
            <span className="font-medium text-sm">Quantity:</span>
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none rounded-l-lg hover:bg-muted"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1 || product.stock === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={product.stock === 0 ? 0 : quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setQuantity(Math.max(1, Math.min(product.stock, val)));
                  } else if (e.target.value === "") {
                    setQuantity(""); // Allow clearing temporarily while typing
                  }
                }}
                onBlur={() => {
                  if (quantity === "" || quantity < 1) {
                    setQuantity(1);
                  }
                }}
                disabled={product.stock === 0}
                className="flex h-10 w-12 items-center justify-center font-medium text-sm border-x text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none rounded-r-lg hover:bg-muted"
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock || product.stock === 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="flex-1 text-lg h-14 rounded-xl" 
              disabled={product.stock === 0 || addToCartMutation.isPending}
              onClick={handleAddToCart}
            >
              {addToCartMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="flex-1 text-lg h-14 rounded-xl bg-orange-500 text-white hover:bg-orange-600 border-none" 
              disabled={product.stock === 0}
              onClick={handleBuyNow}
            >
              <Zap className="mr-2 h-5 w-5 fill-current" />
              Buy Now
            </Button>
          </div>

          {product.stock > 0 && product.stock < 10 && (
            <p className="mt-4 text-sm font-medium text-warning">
              Only {product.stock} left in stock - order soon.
            </p>
          )}

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 border-t pt-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold">Free Delivery</h4>
              <p className="mt-1 text-xs text-muted-foreground">For orders over ₹999</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold">30 Days Return</h4>
              <p className="mt-1 text-xs text-muted-foreground">If goods have problems</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold">Secure Payment</h4>
              <p className="mt-1 text-xs text-muted-foreground">100% secure payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews productId={product._id} />
    </div>
  )
}
