import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react"

import { getProducts } from "@/api/productApi"
import { getCategories } from "@/api/categoryApi"
import { ProductCard } from "@/components/product/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProductListingPage() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const [page, setPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState("")

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedCategories, minPrice, maxPrice, sort])

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { search: searchQuery, page, selectedCategories, minPrice, maxPrice, sort }],
    queryFn: () => getProducts({ 
        search: searchQuery, 
        page, 
        limit: 12,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sort || undefined
    }),
  })

  const resultData = data?.data?.data || {}
  const products = resultData.products || []
  const totalPages = resultData.pagination?.totalPages || 1

  const { data: categoryData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const categories = categoryData?.data?.data || []

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Sidebar Filters */}
        <aside className="hidden w-64 shrink-0 md:block space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" /> Filters
            </h3>
            <div className="space-y-4">
              {/* Filter sections placeholder */}
              <div className="border-t pt-4">
                <h4 className="mb-2 font-medium">Categories</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {categoriesLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                      <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="text-muted-foreground italic">No categories found</p>
                  ) : (
                    categories.map((category) => (
                      <label key={category._id} className="flex items-center gap-2 hover:text-foreground cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-input text-primary focus:ring-primary" 
                          value={category._id} 
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                        /> {category.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="mb-2 font-medium">Price Range</h4>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" className="h-8" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <span>-</span>
                  <Input type="number" placeholder="Max" className="h-8" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
            </h1>
            
            <div className="flex items-center gap-4">
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="flex h-64 items-center justify-center text-destructive">
              Failed to load products. Please try again.
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 font-medium">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
