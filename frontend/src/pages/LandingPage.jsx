import { useRef } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, ChevronLeft, Loader2, ShoppingBag, ArrowRight, Flame, Tag } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts } from "@/api/productApi"
import { getCategories } from "@/api/categoryApi"

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
  const trendingRef    = useRef(null)
  const newLaunchesRef = useRef(null)

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current
      ref.current.scrollTo({
        left: direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75,
        behavior: "smooth",
      })
    }
  }

  const { data: trendingData,    isLoading: trendingLoading    } = useQuery({ queryKey: ["landing-products", "trending"], queryFn: () => getProducts({ limit: 12 }) })
  const { data: newLaunchesData, isLoading: newLaunchesLoading } = useQuery({ queryKey: ["landing-products", "new"],      queryFn: () => getProducts({ limit: 15, sort: "-createdAt" }) })

  const trendingProducts = trendingData?.data?.data?.products    || []
  const newProducts      = newLaunchesData?.data?.data?.products || []

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen pb-10 md:pb-12 font-sans">

      {/* ══ 1. HERO ══════════════════════════════════════════════ */}
      <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 max-w-[1536px] mx-auto pt-4 md:pt-8">
        <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden border border-border/50 shadow-sm bg-white dark:bg-slate-900">
          
          {/* ── Mobile Hero: 70/30 split like PC ── */}
          <div className="md:hidden flex items-center min-h-[340px] relative">
            {/* BG image layer (70/30 split) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-[45%] bg-white dark:bg-slate-900 z-10" />
              <div className="absolute inset-y-0 right-0 w-[65%] z-0">
                <div className="absolute inset-0 bg-[url('/hero-bg-shopping.png')] bg-cover bg-center" />
                <div className="absolute inset-y-0 left-0 w-[95%] bg-gradient-to-r from-white via-white/85 to-transparent dark:from-slate-900 dark:via-slate-900/85 backdrop-blur-[2px] [mask-image:linear-gradient(to_right,black_30%,transparent_100%)]" />
              </div>
            </div>

            {/* Text Overlay */}
            <div className="relative z-10 w-full px-5 py-6">
              <h1 className="text-[32px] leading-[1.05] font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Welcome to <br/>mkt<span className="text-emerald-500">hub</span>
              </h1>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-6 max-w-[220px] font-medium">
                A full-stack multi-vendor e-commerce platform built for educational purposes. Browse & buy from verified sellers.
              </p>
              
              <Link to="/products" className="inline-block max-w-[180px] w-full">
                <Button className="w-full h-11 rounded-full font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all duration-300 text-[13px] gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Desktop Hero: side-by-side ── */}
          <div className="hidden md:flex items-center min-h-[400px] lg:min-h-[480px]">
            {/* BG image layer */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-[30%] bg-white dark:bg-slate-900 z-10" />
              <div className="absolute inset-y-0 right-0 w-[70%] z-0">
                <div className="absolute inset-0 bg-[url('/hero-bg-shopping.png')] bg-cover bg-center" />
                <div className="absolute inset-y-0 left-0 w-[75%] lg:w-[65%] bg-gradient-to-r from-white via-white/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 backdrop-blur-md [mask-image:linear-gradient(to_right,black_15%,transparent_100%)]" />
              </div>
            </div>
            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl px-10 py-16 md:px-16 md:py-20">
              <h1 className="text-5xl lg:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
                Welcome to mkt<span className="text-emerald-500">hub</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium mb-10 max-w-lg">
                A full-stack multi-vendor e-commerce platform built for educational purposes.
                Browse and buy as a customer, or register a seller account to manage your inventory.
              </p>
              <Link to="/products">
                <Button className="h-13 px-8 md:h-14 md:px-10 rounded-full font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300 text-sm md:text-base gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 2. POPULAR CATEGORIES (CIRCULAR PREMIUM) ═════════════════════════════ */}
      <div className="w-full px-4 md:px-8 lg:px-12 max-w-[1536px] mx-auto mt-10 md:mt-16">
        <div className="flex items-end justify-between mb-5 md:mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Top Categories
            </h2>
            <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">Find exactly what you need</p>
          </div>
        </div>

        {/* Circular Cards — Horizontal scroll */}
        <div
          className="flex items-start gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-4 pt-2 -mx-2 px-2 md:flex-wrap md:justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?search=${cat.slug}`}
              className="flex flex-col items-center gap-3 group shrink-0"
            >
              <div className="relative">
                {/* Premium Glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-emerald-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                
                {/* Circular Image Container */}
                <div
                  className="relative w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shadow-md bg-white dark:bg-slate-800 
                             border-[3px] border-white dark:border-slate-800 group-hover:border-emerald-400 dark:group-hover:border-emerald-500
                             transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-emerald-500/20 z-10 overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${cat.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    aria-label={cat.name}
                  />
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>
              </div>
              <span className="text-[11px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 text-center tracking-tight transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══ 3. PRODUCT CAROUSELS ═════════════════════════════════ */}
      <section className="w-full px-4 md:px-8 lg:px-12 max-w-[1536px] mx-auto mt-8 md:mt-12 space-y-12 md:space-y-20">

        {/* Trending */}
        <ProductCarousel
          title="Trending Now"
          subtitle="The most loved items this week"
          icon={<Flame className="w-5 h-5 text-orange-500" strokeWidth={2.5} />}
          viewAllTo="/products"
          scrollRef={trendingRef}
          onScroll={scroll}
          isLoading={trendingLoading}
          products={trendingProducts}
          emptyMsg="No products available yet."
        />

        {/* New Launches */}
        <ProductCarousel
          title="Fresh Arrivals"
          subtitle="Just landed from our top sellers"
          icon={<Tag className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />}
          viewAllTo="/products?sort=-createdAt"
          scrollRef={newLaunchesRef}
          onScroll={scroll}
          isLoading={newLaunchesLoading}
          products={newProducts}
          emptyMsg="No new products available."
        />

      </section>
    </div>
  )
}

/* ── Reusable carousel section ─────────────────────────────── */
function ProductCarousel({ title, subtitle, icon, viewAllTo, scrollRef, onScroll, isLoading, products, emptyMsg }) {
  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 md:mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {title} {icon}
          </h2>
          <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link to={viewAllTo} className="text-xs md:text-sm font-bold text-emerald-600 hover:text-emerald-700 items-center gap-1 hidden sm:flex group">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {/* Scroll arrows — hidden on mobile */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => onScroll(scrollRef, "left")}
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => onScroll(scrollRef, "right")}
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
            >
              <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-slate-500 py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-sm font-medium">
          {emptyMsg}
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto pb-6 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[calc(50vw-24px)] sm:w-[240px] md:w-[260px] snap-start shrink-0"
              >
                <div className="h-full transition-transform duration-300 hover:-translate-y-1">
                   <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
          {/* Mobile View All link below carousel */}
          <Link
            to={viewAllTo}
            className="sm:hidden mt-2 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400 active:scale-95 transition-transform"
          >
            Explore More <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      )}
    </div>
  )
}
