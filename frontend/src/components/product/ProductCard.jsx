import { Link } from "react-router-dom"
import { Star, ShoppingCart, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { formatPrice, getDiscount } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { addToCart } from "@/api/cartApi"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

export function ProductCard({ product }) {
  const discount = getDiscount(product.mrp, product.sellingPrice)
  const queryClient = useQueryClient()
  const { user } = useAuth()

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

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }
    addToCartMutation.mutate({ productId: product._id, quantity: 1 })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      {/* Image */}
      <Link to={`/products/${product._id}`} className="relative overflow-hidden bg-muted">
        {/* 
          Responsive aspect ratio:
          - Mobile: shorter (4:3) to show more cards
          - Tablet+: square (1:1) for a cleaner grid
        */}
        <div className="aspect-[4/3] sm:aspect-square">
          <img
            src={product.images?.[0]?.url || product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=70"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute left-2.5 top-2.5 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground shadow">
            {discount}% OFF
          </div>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Category */}
        <div className="mb-1 text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {product.category?.name || "Category"}
        </div>

        {/* Name */}
        <Link
          to={`/products/${product._id}`}
          className="mb-2 line-clamp-2 text-sm font-semibold leading-snug hover:text-primary transition-colors"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-1">
          {product.totalReviews > 0 ? (
            <>
              <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" />
              <span className="text-xs font-semibold">{product.averageRating}</span>
              <span className="text-[11px] text-muted-foreground">({product.totalReviews})</span>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground">No reviews yet</span>
          )}
        </div>

        {/* Price + Cart */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="text-base font-bold sm:text-lg leading-tight">{formatPrice(product.sellingPrice)}</div>
            {product.mrp > product.sellingPrice && (
              <div className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</div>
            )}
          </div>
          <Button
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full shrink-0 transition-transform active:scale-95"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || product.stock === 0}
          >
            {addToCartMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
