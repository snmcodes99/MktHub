import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, ShoppingCart, Loader2, Package, Shield, RefreshCw, Zap, Minus, Plus, ChevronRight, Check, Heart, Share2, Truck, Calendar, ShieldCheck, BadgeCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { getProductById } from "@/api/productApi"
import { addToCart } from "@/api/cartApi"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatPrice, getDiscount } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductReviews } from "@/components/product/ProductReviews"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

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
    navigate("/checkout", { 
      state: { source: "BUY_NOW", productId: id, quantity } 
    })
  }

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen pb-12">
        <div className="border-b border-border bg-background py-3">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-5 flex flex-col md:flex-row gap-4">
              <div className="flex md:flex-col gap-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-xl" />)}
              </div>
              <Skeleton className="flex-1 aspect-square rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 mt-8">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data?.data?.data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center bg-background">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Product Not Found</h2>
        <p className="mt-3 text-muted-foreground max-w-md">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="mt-8">
          <Button size="lg" className="rounded-full">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  const product = data.data.data
  const discount = getDiscount(product.mrp, product.sellingPrice)
  const isLowStock = product.stock > 0 && product.stock < 10

  const highlights = product.keyHighlights?.length > 0 
    ? product.keyHighlights 
    : product.description.length > 50 
      ? product.description.split('.').filter(s => s.trim().length > 10).slice(0, 4)
      : [
          "Premium build quality and durability",
          "High performance and efficiency",
          "Modern and sleek design",
          "Perfect for daily use"
        ];

  return (
    <div className="bg-background min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center text-xs md:text-sm text-muted-foreground font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 mx-1.5 md:mx-2 opacity-50" />
            <Link to="/products" className="hover:text-primary transition-colors">{product.category?.name || "Category"}</Link>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 mx-1.5 md:mx-2 opacity-50" />
            <span className="text-foreground truncate max-w-[150px] md:max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ── LEFT: Image Gallery (4 Cols) ── */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24">
            
            {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide py-1 md:py-0 md:max-h-[500px]" data-lenis-prevent="true">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-square w-16 md:w-20 shrink-0 overflow-hidden rounded-xl transition-all duration-200 border-2 bg-card ${
                      activeImage === index 
                        ? "border-primary shadow-sm" 
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={image?.url || image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative aspect-square md:aspect-[4/5] lg:aspect-square overflow-hidden rounded-2xl border border-border bg-card flex items-center justify-center p-4">
              <AnimatePresence mode="wait">
                {product.images && product.images.length > 0 ? (
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[activeImage]?.url || product.images[activeImage]}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">No image available</div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── MIDDLE: Product Info (4 Cols) ── */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
            
            {/* Status / Badge */}
            {product.stock > 0 ? (
               <div className="w-fit mb-3 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                 In Stock
               </div>
            ) : (
               <div className="w-fit mb-3 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                 Out of Stock
               </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & QnA */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.averageRating || 0) ? 'fill-current' : 'text-muted-foreground opacity-50'}`} />
                ))}
              </div>
              <a href="#reviews" className="font-medium text-primary hover:underline">
                {product.averageRating?.toFixed(1) || "0.0"} ({product.totalReviews} reviews)
              </a>
            </div>

            {/* Seller Line */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-1">
                Seller: <span className="font-semibold text-foreground ml-1">{product.seller?.name || "RetailNet"}</span>
                <BadgeCheck className="h-4 w-4 text-blue-500" />
              </p>
            </div>

            <Separator className="my-6" />

            {/* Key Highlights */}
            <div>
              <h3 className="text-base font-bold text-foreground mb-3">Key Highlights</h3>
              <ul className="space-y-2.5">
                {highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-snug">{highlight.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            {/* About this item (Description) */}
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">About this item</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                {product.description}
              </p>
            </div>
            
          </div>

          {/* ── RIGHT: Action Card (3 Cols) ── */}
          <div className="lg:col-span-3 xl:col-span-3">
            <div className="border border-border rounded-2xl p-5 shadow-sm bg-card">
              
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="w-fit bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 rounded font-bold text-xs mb-3">
                  {discount}% OFF
                </div>
              )}
              
              {/* Price Block */}
              <div className="flex items-end gap-3 mb-1">
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {formatPrice(product.sellingPrice)}
                </div>
                {product.mrp > product.sellingPrice && (
                  <div className="text-sm font-medium text-muted-foreground line-through mb-1.5">
                    {formatPrice(product.mrp)}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Inclusive of all taxes</p>



              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden h-9">
                  <button
                    className="flex h-9 w-9 items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || product.stock === 0}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3 text-foreground" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={product.stock === 0 ? 0 : quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setQuantity(Math.max(1, Math.min(product.stock, val)));
                      else if (e.target.value === "") setQuantity("");
                    }}
                    onBlur={() => { if (quantity === "" || quantity < 1) setQuantity(1); }}
                    disabled={product.stock === 0}
                    aria-label="Quantity"
                    className="flex h-9 w-10 items-center justify-center font-semibold text-sm text-center bg-transparent border-x border-border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground"
                  />
                  <button
                    className="flex h-9 w-9 items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-11 text-sm font-bold bg-[#ffd814] hover:bg-[#f7ca00] text-black shadow-sm rounded-full border border-[#fcd200]" 
                  disabled={product.stock === 0 || addToCartMutation.isPending}
                  onClick={handleAddToCart}
                >
                  {addToCartMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" /> : <ShoppingCart className="mr-2 h-4 w-4 text-black" />}
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
                
                <Button 
                  className="w-full h-11 text-sm font-bold bg-[#ffa41c] hover:bg-[#fa8900] text-black shadow-sm rounded-full border border-[#ff8f00]" 
                  disabled={product.stock === 0}
                  onClick={handleBuyNow}
                >
                  <Zap className="mr-2 h-4 w-4 text-black" />
                  Buy Now
                </Button>
              </div>

            </div>

            {/* Sold By Mini Card below */}
            <div className="mt-4 border border-border rounded-xl p-4 bg-muted/40">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Sold By</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground">{product.seller?.name || "mkthub Seller"}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <Separator className="my-8 md:my-12 bg-border" />
        <div id="reviews" className="scroll-mt-24">
          <ProductReviews productId={product._id} />
        </div>
      </div>
    </div>
  )
}
