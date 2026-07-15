import { useRef } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts } from "@/api/productApi"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

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
    <div className="flex flex-col bg-[#f5f5f5] min-h-screen pb-12 overflow-hidden">
      {/* Top Banner / Carousel Area */}
      <div className="w-full bg-slate-900 relative overflow-hidden h-[450px] md:h-[550px]">
        {/* Banner image with slow zoom animation */}
        <motion.div 
          className="absolute inset-0 origin-center"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img 
            src="/hero-bg.png" 
            alt="Shopping Vibe Banner" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
          <motion.div 
            className="max-w-xl text-white"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Eyebrow — subtle, not shouting */}
            <motion.p
              variants={itemVariants}
              className="text-sm font-semibold text-emerald-400 tracking-widest uppercase mb-4"
            >
              mkthub — Buy. Sell. Connect.
            </motion.p>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-[1.1] tracking-tight drop-shadow-xl"
            >
              The marketplace<br />
              <span className="text-emerald-400">built for everyone.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-base md:text-lg mb-10 text-white/70 max-w-sm leading-relaxed"
            >
              Shop from thousands of sellers. Find great deals, get fast delivery, and pay with confidence.
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <Link to="/products">
                <Button size="lg" className="rounded-full font-bold h-12 px-8 text-base shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  Shop Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 relative z-20 space-y-8">
        
        {/* Trending Products Row */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white p-6 rounded shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Trending Products</h2>
              <Link to="/products" className="text-primary hover:underline text-sm font-medium flex items-center">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-2 hidden md:flex">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(trendingRef, 'left')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(trendingRef, 'right')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {trendingLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              ref={trendingRef}
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trendingProducts.length > 0 ? (
                trendingProducts.map((product) => (
                  <motion.div key={product._id} variants={itemVariants} className="min-w-[280px] sm:min-w-[300px] snap-start">
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 w-full text-center">No trending products available.</div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* New Launches Grid (Zebronics style) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white p-6 rounded shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">New Launches</h2>
              <Link to="/products" className="text-primary hover:underline text-sm font-medium flex items-center">
                Explore more <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-2 hidden md:flex">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(newLaunchesRef, 'left')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(newLaunchesRef, 'right')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {newLaunchesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              ref={newLaunchesRef}
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newProducts.length > 0 ? (
                newProducts.map((product) => (
                  <motion.div key={product._id} variants={itemVariants} className="min-w-[240px] sm:min-w-[280px] snap-start">
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 w-full text-center">No new products available.</div>
              )}
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
