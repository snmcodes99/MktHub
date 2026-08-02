import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Package, Loader2, Trash2, Search, Image as ImageIcon, AlertTriangle, CheckCircle } from "lucide-react"
import { getProducts, deleteProduct } from "@/api/productApi"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [deleteModal, setDeleteModal] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["all-products-admin", page, limit, searchTerm],
    queryFn: () => getProducts({ limit, page, search: searchTerm, showInactive: "true" }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully")
      setDeleteModal(null)
      queryClient.invalidateQueries({ queryKey: ["all-products-admin"] })
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to delete product")
  })

  const products = data?.data?.data?.products || []

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Products Registry</h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor and manage all products listed on the platform.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search products, sellers..."
            className="pl-9 bg-white border-slate-200 rounded-xl text-sm h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="px-5 py-3 text-sm font-medium text-muted-foreground">Seller</th>
                  <th className="px-5 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-5 py-3 text-sm font-medium text-muted-foreground text-right">Price</th>
                  <th className="px-5 py-3 text-sm font-medium text-muted-foreground text-center">Stock</th>
                  <th className="px-5 py-3 text-sm font-medium text-muted-foreground text-center">Status</th>
                  <th className="px-5 py-3 text-sm font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          {product.images?.length > 0 ? (
                            <img
                              src={product.images[0].url || product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground max-w-[200px] truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">#{product._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {(product.seller?.name || "?")[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-foreground font-medium">{product.seller?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-sm text-foreground">{formatPrice(product.sellingPrice)}</p>
                      {product.mrp > product.sellingPrice && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-xs font-semibold">
                          <AlertTriangle className="h-3 w-3" /> 0
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 min-w-[28px] px-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-xs font-semibold">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 text-xs font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDeleteModal(product)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.data?.data?.pagination && (
          <div className="border-t border-border px-5 py-3">
            <Pagination
              currentPage={page}
              totalPages={data.data.data.pagination.totalPages}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit)
                setPage(1)
              }}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-1 w-full bg-red-500" />
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Delete Product</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteModal.name}"</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setDeleteModal(null)} disabled={deleteMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => deleteMutation.mutate(deleteModal._id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
