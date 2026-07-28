import { useRef } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, ChevronLeft, Loader2, Store, ShoppingBag, Info } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts } from "@/api/productApi"

export default function LandingPage() {
  const trendingRef = useRef(null)
  const newLaunchesRef = useRef(null)

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current
      const scrollAmount = clientWidth * 0.8
      ref.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      })
    }
  }

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["landing-products", "trending"],
    queryFn: () => getProducts({ limit: 12 }),
  })
  
  const { data: newLaunchesData, isLoading: newLaunchesLoading } = useQuery({
    queryKey: ["landing-products", "new"],
    queryFn: () => getProducts({ limit: 15, sort: "-createdAt" }),
  })

  const trendingProducts = trendingData?.data?.data?.products || []
  const newProducts = newLaunchesData?.data?.data?.products || []

  return (
    <div className="flex flex-col bg-background min-h-screen pb-12">
      
      {/* ── 1. Hero ── */}
      <section className="relative py-20 md:py-32 border-b border-border bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('/hero-bg-shopping.png')" }}>
        <div className="absolute inset-0 bg-background/60 dark:bg-background/70"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-4xl text-center">
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
            Welcome to mkt<span className="text-emerald-500">hub</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A full-stack multi-vendor e-commerce platform built for educational purposes. 
            You can browse and buy products as a customer, or register a seller account to manage your own inventory.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300">
                <ShoppingBag className="mr-2 h-5 w-5" /> Browse Products
              </Button>
            </Link>
          </div>
          
        </div>
      </section>

      {/* ── 2. Standard Product Grids ── */}
      <section className="container mx-auto px-4 md:px-8 py-12 space-y-16">
        
        {/* Trending Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Trending Products</h2>
              <p className="text-sm text-muted-foreground mt-1">Products listed by various sellers across the platform.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/products" className="text-primary hover:underline text-sm font-medium hidden md:block">
                View All
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border bg-card" onClick={() => scroll(trendingRef, 'left')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border bg-card" onClick={() => scroll(trendingRef, 'right')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {trendingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div 
              ref={trendingRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trendingProducts.length > 0 ? (
                trendingProducts.map((product) => (
                  <div key={product._id} className="min-w-[240px] sm:min-w-[260px] snap-start">
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 w-full text-center border border-dashed border-border rounded-lg bg-muted/30">
                  No products available in the database yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Launches */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recently Added</h2>
              <p className="text-sm text-muted-foreground mt-1">The newest items added by our test sellers.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/products?sort=-createdAt" className="text-primary hover:underline text-sm font-medium hidden md:block">
                View All
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border bg-card" onClick={() => scroll(newLaunchesRef, 'left')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border bg-card" onClick={() => scroll(newLaunchesRef, 'right')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {newLaunchesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div 
              ref={newLaunchesRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newProducts.length > 0 ? (
                newProducts.map((product) => (
                  <div key={product._id} className="min-w-[240px] sm:min-w-[260px] snap-start">
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 w-full text-center border border-dashed border-border rounded-lg bg-muted/30">
                  No new products available.
                </div>
              )}
            </div>
          )}
        </div>

      </section>
    </div>
  )
}
