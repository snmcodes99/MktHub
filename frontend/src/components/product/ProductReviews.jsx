import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Loader2, User, Send } from "lucide-react"

import { getProductReviews, createReview } from "@/api/reviewApi"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export function ProductReviews({ productId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => getProductReviews(productId),
  })

  const mutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success("Review submitted successfully!")
      setComment("")
      setRating(5)
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to submit review")
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to submit a review")
      return
    }
    mutation.mutate({ productId, rating, comment })
  }

  const reviews = data?.data?.data || []

  return (
    <div className="mt-16 space-y-8" id="reviews">
      <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
      
      <div className="grid gap-8 md:grid-cols-12">
        {/* Write Review Form */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Review</label>
                  <Textarea
                    placeholder="What did you like or dislike?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="min-h-[100px] resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={mutation.isPending || !comment.trim()}
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Review
                </Button>
              </form>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground mb-4">You need to login to submit a review.</p>
                <Button asChild variant="outline" className="w-full">
                  <a href="/login">Login</a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No reviews yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share your thoughts on this product.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="flex gap-4 border-b pb-6 last:border-0">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{review.user?.name || "Anonymous User"}</h4>
                      <span className="text-xs text-muted-foreground">
                        {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-pretty">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
