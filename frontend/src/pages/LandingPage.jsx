import { Link } from "react-router-dom"
import { ChevronRight, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts } from "@/api/productApi"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function LandingPage() {
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["landing-products", "trending"],
    queryFn: () => getProducts({ limit: 4 }),
  })
  
  const { data: newLaunchesData, isLoading: newLaunchesLoading } = useQuery({
    queryKey: ["landing-products", "new"],
    queryFn: () => getProducts({ limit: 8, sort: "-createdAt" }),
  })

  const trendingProducts = trendingData?.data?.data?.products || []
  const newProducts = newLaunchesData?.data?.data?.products || []

  return (
    <div className="flex flex-col bg-[#f5f5f5] min-h-screen pb-12 overflow-hidden">
      {/* Top Banner / Carousel Area */}
      <div className="w-full bg-slate-900 relative overflow-hidden h-[450px] md:h-[550px]">
        {/* Banner image with slow zoom animation */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
            alt="Shopping Vibe Banner" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
          <motion.div 
            className="max-w-2xl text-white"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-sm mb-6 drop-shadow-md"
            >
              Welcome to Brand Name
            </motion.span>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-xl text-balance"
            >
              Your one-stop destination for everything you need.
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl mb-10 text-gray-100 drop-shadow-lg font-medium max-w-xl text-balance"
            >
              Discover millions of products from trusted sellers. Fast delivery, secure payments, and unbeatable prices.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link to="/products">
                <Button size="lg" className="rounded-sm font-bold h-14 px-10 text-lg shadow-lg hover:scale-105 transition-transform duration-200">
                  Start Shopping
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 relative z-20 space-y-8">
        
        {/* Trending Products Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Trending Products</h2>
            <Link to="/products" className="text-primary hover:underline text-sm font-medium flex items-center">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {trendingLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {trendingProducts.length > 0 ? (
                trendingProducts.map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-muted-foreground py-8">No trending products available.</div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* New Launches Grid (Zebronics style) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">New Launches</h2>
            <Link to="/products" className="text-primary hover:underline text-sm font-medium flex items-center">
              Explore more <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {newLaunchesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {newProducts.length > 0 ? (
                newProducts.map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-muted-foreground py-8">No new products available.</div>
              )}
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
