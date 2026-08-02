import { useRef } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, ChevronLeft, Loader2, ShoppingBag } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts } from "@/api/productApi"
import { getCategories } from "@/api/categoryApi"

// Hardcoded popular categories with curated photos
const POPULAR_CATEGORIES = [
  { name: "Electronics",    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=160&h=160&fit=crop&q=80",  slug: "Electronics" },
  { name: "Clothing",       image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=160&h=160&fit=crop&q=80",  slug: "Clothing" },
  { name: "Books",          image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=160&h=160&fit=crop&q=80", slug: "Books" },
  { name: "Home & Kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=160&h=160&fit=crop&q=80", slug: "Home" },
  { name: "Sports",         image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=160&h=160&fit=crop&q=80", slug: "Sports" },
  { name: "Beauty",         image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&h=160&fit=crop&q=80", slug: "Beauty" },
  { name: "Footwear",       image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop&q=80", slug: "Footwear" },
  { name: "Toys",           image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=160&h=160&fit=crop&q=80", slug: "Toys" },
]

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

  const { data: categoryData } = useQuery({
    queryKey: ["landing-categories"],
    queryFn: getCategories,
  })

  const trendingProducts = trendingData?.data?.data?.products || []
  const newProducts = newLaunchesData?.data?.data?.products || []
  const categories = categoryData?.data?.data || []

  return (
    <div className="flex flex-col bg-background min-h-screen pb-12">

      {/* ── 1. Hero Banner ── */}
      <div className="w-full px-4 md:px-8 lg:px-12 max-w-[1536px] mx-auto pt-6 md:pt-8">
        <div className="relative rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden min-h-[400px] md:min-h-[480px] flex items-center border border-border/50 shadow-sm">

          {/* Background: solid left 30% + image right 70% with blur fade */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[30%] bg-white dark:bg-slate-900 z-10"></div>
            <div className="absolute inset-y-0 right-0 w-[70%] z-0">
              <div className="absolute inset-0 bg-[url('/hero-bg-shopping.png')] bg-cover bg-center"></div>
              {/* Blur fade over left portion of the photo */}
              <div className="absolute inset-y-0 left-0 w-[75%] lg:w-[65%] bg-gradient-to-r from-white via-white/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 backdrop-blur-md [mask-image:linear-gradient(to_right,black_15%,transparent_100%)]"></div>
            </div>
          </div>

          {/* Left Content */}
          <div className="relative z-10 w-full max-w-2xl px-6 py-12 md:px-16 md:py-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
              Welcome to mkt<span className="text-emerald-500">hub</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium mb-10 max-w-lg">
              A full-stack multi-vendor e-commerce platform built for educational purposes.
              You can browse and buy products as a customer, or register a seller account to manage your own inventory.
            </p>
            <Link to="/products">
              <Button className="h-12 px-8 md:h-14 md:px-10 rounded-full font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300 text-sm md:text-base">
                <ShoppingBag className="mr-2 h-5 w-5" /> Browse Products
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* ── 2. Popular Categories ── */}
      <div className="w-full px-4 md:px-8 lg:px-12 max-w-[1536px] mx-auto mt-10 md:mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Popular Categories</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Browse by what you love</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex items-start justify-center gap-8 md:gap-12 overflow-x-auto pb-3 flex-wrap" style={{ scrollbarWidth: 'none' }}>
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?search=${cat.slug}`}
              className="flex flex-col items-center gap-2.5 group shrink-0"
            >
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full ring-2 ring-emerald-200 dark:ring-emerald-800 shadow-md"
                style={{
                  backgroundImage: `url(${cat.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-label={cat.name}
              />
              {/* Label */}
              <span className="text-[11px] md:text-xs font-bold text-slate-600 dark:text-slate-400 text-center leading-tight max-w-[72px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 3. Standard Product Grids ── */}
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
