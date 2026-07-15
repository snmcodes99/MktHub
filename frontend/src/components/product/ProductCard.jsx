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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg">
      <Link to={`/products/${product._id}`} className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
            {discount}% OFF
          </div>
        )}
      </Link>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-xs text-muted-foreground">
          {product.category?.name || "Category"}
        </div>
        
        <Link to={`/products/${product._id}`} className="mb-2 line-clamp-2 font-medium hover:text-primary transition-colors">
          {product.name}
        </Link>
        
        <div className="mb-4 flex items-center gap-1">
          {product.totalReviews > 0 ? (
            <>
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{product.averageRating}</span>
              <span className="text-xs text-muted-foreground">({product.totalReviews} reviews)</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No reviews yet</span>
          )}
        </div>
        
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-lg font-bold">{formatPrice(product.sellingPrice)}</div>
            {product.mrp > product.sellingPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(product.mrp)}
              </div>
            )}
          </div>
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-full transition-transform active:scale-95"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || product.stock === 0}
          >
            {addToCartMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
