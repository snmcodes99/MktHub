import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Search, SlidersHorizontal, Loader2, X, ChevronDown } from "lucide-react"

import { getProducts } from "@/api/productApi"
import { getCategories } from "@/api/categoryApi"
import { ProductCard } from "@/components/product/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"

/* ──────────────────────────────────────────────────────────────
   Shared filter content (used in sidebar + mobile drawer)
────────────────────────────────────────────────────────────── */
function FilterContent({
  categories,
  categoriesLoading,
  selectedCategories,
  handleCategoryChange,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onApply,          // called on mobile to close drawer
}) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Categories</h4>
        <div className="space-y-2">
          {categoriesLoading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" style={{ width: `${60 + i * 8}%` }} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No categories found</p>
          ) : (
            categories.map((category) => (
              <label
                key={category._id}
                className="flex items-center gap-3 cursor-pointer group py-1"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selectedCategories.includes(category._id)
                    ? "bg-primary border-primary"
                    : "border-input group-hover:border-primary/60"
                }`}>
                  {selectedCategories.includes(category._id) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  value={category._id}
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleCategoryChange(category._id)}
                />
                <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                  {category.name}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9 text-sm"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <span className="text-muted-foreground shrink-0">–</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-9 text-sm"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Apply button (mobile only) */}
      {onApply && (
        <Button className="w-full rounded-xl" onClick={onApply}>
          Apply Filters
          {selectedCategories.length > 0 && (
            <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </Button>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Main page
────────────────────────────────────────────────────────────── */
export default function ProductListingPage() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get("search") || ""

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => { setPage(1) }, [searchQuery, selectedCategories, minPrice, maxPrice, sort, limit])

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileFiltersOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [mobileFiltersOpen])

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { search: searchQuery, page, limit, selectedCategories, minPrice, maxPrice, sort }],
    queryFn: () => getProducts({
      search: searchQuery,
      page,
      limit,
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort: sort || undefined
    }),
  })

  const resultData = data?.data?.data || {}
  const products   = resultData.products || []
  const totalPages = resultData.pagination?.totalPages || 1

  const { data: categoryData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })
  const categories = categoryData?.data?.data || []

  const activeFilterCount = selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)

  return (
    <div className="container mx-auto px-3 py-5 sm:px-4 sm:py-8 md:px-6">

      {/* ── Mobile: Search bar ── */}
      <div className="mb-4 md:hidden">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault()
            // search handled by URL params in Navbar; just a local ref here
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            readOnly
            placeholder="Search products…"
            className="w-full h-10 rounded-xl border bg-muted/50 pl-9 pr-4 text-sm focus:outline-none"
          />
        </form>
      </div>

      {/* ── Mobile: top bar ── */}
      <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
        <h1 className="text-lg font-bold tracking-tight truncate">
          {searchQuery ? `"${searchQuery}"` : "All Products"}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort */}
          <div className="relative">
            <select
              className="appearance-none h-9 rounded-xl border border-input bg-background pl-3 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="">Sort</option>
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="relative h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold flex items-center gap-1.5 hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:block w-56 lg:w-64 shrink-0">
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="mb-5 text-base font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filters
            </h3>
            <FilterContent
              categories={categories}
              categoriesLoading={categoriesLoading}
              selectedCategories={selectedCategories}
              handleCategoryChange={handleCategoryChange}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Desktop heading + sort */}
          <div className="hidden md:flex mb-6 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
              </h1>
              {!isLoading && (
                <p className="text-sm text-muted-foreground mt-1">
                  {products.length > 0 ? `Showing ${products.length} products` : ""}
                </p>
              )}
            </div>
            <div className="relative">
              <select
                className="appearance-none h-10 rounded-xl border border-input bg-background pl-4 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] sm:aspect-square bg-muted" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-3 w-1/3 bg-muted rounded" />
                    <div className="h-4 w-4/5 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-5 w-1/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex h-64 flex-col items-center justify-center text-center gap-3">
              <div className="rounded-full bg-destructive/10 p-4">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <p className="font-semibold">Failed to load products</p>
              <p className="text-sm text-muted-foreground">Please try again later.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-lg">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              {/* 
                Grid:
                  mobile:  2 columns (compact cards)
                  sm:      2 columns
                  lg:      3 columns
                  xl:      4 columns
              */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 sm:mt-12">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    limit={limit}
                    onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
                    limitOptions={[12, 24, 48]}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══ Mobile filter drawer ══ */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileFiltersOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileFiltersOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl bg-background border-t shadow-2xl transition-transform duration-400 ease-out ${
          mobileFiltersOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-base font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters
          </h3>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors"
                onClick={() => {
                  setSelectedCategories([])
                  setMinPrice("")
                  setMaxPrice("")
                }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <FilterContent
            categories={categories}
            categoriesLoading={categoriesLoading}
            selectedCategories={selectedCategories}
            handleCategoryChange={handleCategoryChange}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onApply={() => setMobileFiltersOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
