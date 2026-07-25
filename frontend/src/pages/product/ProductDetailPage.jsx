import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, ShoppingCart, Loader2, Package, Shield, RefreshCw, Zap, Minus, Plus, ChevronRight, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { getProductById } from "@/api/productApi"
import { addToCart } from "@/api/cartApi"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatPrice, getDiscount } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ProductReviews } from "@/components/product/ProductReviews"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

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
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !data?.data?.data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold tracking-tight">Product Not Found</h2>
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

  return (
    <div className="bg-[#fafafa] min-h-screen pb-12">
      {/* Breadcrumb - Sleek & Premium */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
            <span className="text-foreground truncate max-w-[200px] md:max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          
          {/* Left Column: Image Gallery (Sticky) */}
          <motion.div 
            className="flex flex-col gap-4 lg:col-span-5 xl:col-span-5 w-full sticky top-24"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-black/5 group">
              <AnimatePresence mode="wait">
                {product.images && product.images.length > 0 ? (
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground bg-muted/30">
                    No image available
                  </div>
                )}
              </AnimatePresence>
              
              {discount > 0 && (
                <div className="absolute left-6 top-6 rounded-full bg-destructive/90 backdrop-blur-md px-4 py-1.5 text-sm font-bold text-white shadow-lg border border-destructive/20">
                  {discount}% OFF
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-square w-24 shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-300 ${
                      activeImage === index 
                        ? "border-2 border-primary shadow-md ring-4 ring-primary/10 opacity-100 scale-100" 
                        : "border border-black/10 opacity-60 hover:opacity-100 scale-95 hover:scale-100"
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Product Info */}
          <motion.div 
            className="flex flex-col lg:col-span-6 xl:col-span-7 py-2 lg:pl-8"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary tracking-wide">
                {product.category?.name || "Premium Collection"}
              </span>
              {product.brand && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 tracking-wide border border-slate-200">
                  {product.brand}
                </span>
              )}
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-balance text-slate-900">
              {product.name}
            </motion.h1>
            
            <motion.div variants={fadeUp} className="mt-6 flex items-center gap-4">
              {product.totalReviews > 0 ? (
                <>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-bold text-amber-700">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {product.averageRating}
                  </div>
                  <a href="#reviews" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-muted hover:decoration-primary">
                    Read {product.totalReviews} Reviews
                  </a>
                </>
              ) : (
                <a href="#reviews" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  No reviews yet — <span className="underline underline-offset-4">be the first</span>
                </a>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex items-end gap-4">
              <div className="text-5xl font-black tracking-tighter text-slate-900">
                {formatPrice(product.sellingPrice)}
              </div>
              {product.mrp > product.sellingPrice && (
                <div className="mb-1.5 text-xl font-medium text-muted-foreground line-through decoration-slate-300">
                  {formatPrice(product.mrp)}
                </div>
              )}
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 text-lg text-slate-600 leading-relaxed text-balance">
              {product.description}
            </motion.p>

            <motion.div variants={fadeUp}>
              <Separator className="my-10 bg-slate-200" />
            </motion.div>

            {/* Status & Quantity */}
            <motion.div variants={fadeUp} className="space-y-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full w-fit">
                  <Check className="h-4 w-4" /> In Stock & Ready to Ship
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-bold text-destructive bg-destructive/10 px-4 py-2 rounded-full w-fit">
                  Out of Stock
                </div>
              )}

              {isLowStock && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-amber-500 text-amber-500" /> 
                    Selling fast! Only {product.stock} left in stock.
                  </p>
                  <div className="w-full bg-amber-200/50 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${(product.stock / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6">
                <span className="font-semibold text-slate-900">Quantity</span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-1">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || product.stock === 0}
                  >
                    <Minus className="h-4 w-4 text-slate-600" />
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
                    className="flex h-10 w-12 items-center justify-center font-bold text-lg text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                  >
                    <Plus className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="flex-1 text-lg h-16 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300" 
                disabled={product.stock === 0 || addToCartMutation.isPending}
                onClick={handleAddToCart}
              >
                {addToCartMutation.isPending ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-3 h-5 w-5" />}
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 text-lg h-16 rounded-2xl bg-white border-2 hover:bg-slate-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300" 
                disabled={product.stock === 0}
                onClick={handleBuyNow}
              >
                <Zap className="mr-3 h-5 w-5 fill-slate-900 text-slate-900" />
                Buy it Now
              </Button>
            </motion.div>

            {/* Premium Features Guarantee */}
            <motion.div variants={fadeUp} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center p-2">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Fast Delivery</h4>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">Free shipping on orders over ₹999</p>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Easy Returns</h4>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">30-day hassle-free return policy</p>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Secure Checkout</h4>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">100% protected payments</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <Separator className="my-12 bg-slate-200" />
        <div id="reviews" className="scroll-mt-24">
          <ProductReviews productId={product._id} />
        </div>
      </div>
    </div>
  )
}
