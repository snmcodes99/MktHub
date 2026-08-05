import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Edit2, Trash2, Package, Loader2, Image as ImageIcon, Search, X, Check, XCircle, AlertCircle } from "lucide-react"
import { deleteProduct, createProduct, updateProduct, toggleProductActive } from "@/api/productApi"
import { getSellerProducts } from "@/api/sellerApi"
import { getCategories } from "@/api/categoryApi"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

export default function SellerProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [currentProduct, setCurrentProduct] = useState(null)
  
  const initialProductState = {
    name: "",
    description: "",
    brand: "",
    category: "",
    mrp: "",
    sellingPrice: "",
    stock: "",
    images: [],
    keyHighlights: [""]
  }
  
  const [productForm, setProductForm] = useState(initialProductState)
  
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, limit, searchTerm],
    queryFn: () => getSellerProducts({ limit, page, search: searchTerm }),
  })

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully")
      setDeleteModal(null)
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete product")
    }
  })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product added successfully")
      setAddModalOpen(false)
      setProductForm(initialProductState)
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add product")
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully")
      setEditModalOpen(false)
      setProductForm(initialProductState)
      setCurrentProduct(null)
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update product")
    }
  })
  
  const toggleActiveMutation = useMutation({
    mutationFn: toggleProductActive,
    onSuccess: () => {
      toast.success("Product status updated")
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update product status")
    }
  })

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!productForm.name || !productForm.description || !productForm.brand || !productForm.category || !productForm.mrp || !productForm.sellingPrice || !productForm.stock) {
      toast.error("Please fill in all required fields")
      return
    }

    const formData = new FormData()
    formData.append("name", productForm.name)
    formData.append("description", productForm.description)
    formData.append("brand", productForm.brand)
    formData.append("category", productForm.category)
    formData.append("mrp", Number(productForm.mrp))
    formData.append("sellingPrice", Number(productForm.sellingPrice))
    formData.append("stock", Number(productForm.stock))
    
    const validHighlights = productForm.keyHighlights?.filter(h => h.trim()) || []
    if (validHighlights.length > 0) {
      formData.append("keyHighlights", JSON.stringify(validHighlights))
    }
    
    if (productForm.images && productForm.images.length > 0) {
      productForm.images.forEach(file => {
        if (file instanceof File) {
          formData.append("images", file)
        }
      })
    }

    if (editModalOpen && currentProduct) {
      updateMutation.mutate({ id: currentProduct._id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }
  
  const handleHighlightChange = (index, value) => {
    const newHL = [...productForm.keyHighlights]
    newHL[index] = value
    setProductForm({ ...productForm, keyHighlights: newHL })
  }

  const addHighlightField = () => {
    setProductForm({ ...productForm, keyHighlights: [...(productForm.keyHighlights || []), ""] })
  }

  const removeHighlightField = (index) => {
    const newHL = productForm.keyHighlights.filter((_, i) => i !== index)
    setProductForm({ ...productForm, keyHighlights: newHL.length > 0 ? newHL : [""] })
  }
  
  const openEditModal = (product) => {
    setCurrentProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category?._id || product.category || "",
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      images: product.images && product.images.length > 0 ? product.images : [],
      keyHighlights: product.keyHighlights && product.keyHighlights.length > 0 ? product.keyHighlights : [""]
    })
    setEditModalOpen(true)
  }

  const products = data?.data?.data?.products || []
  const categories = categoryData?.data?.data || []

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Products</h2>
          <p className="text-muted-foreground">Manage your product catalog and inventory.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            setProductForm(initialProductState)
            setAddModalOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-10 ml-auto rounded-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 rounded-full bg-muted p-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No products found</h3>
                      <p className="text-muted-foreground mb-4 mt-1">Get started by creating your first product listing.</p>
                      <Button onClick={() => {
                        setProductForm(initialProductState)
                        setAddModalOpen(true)
                      }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id} className={!product.isActive ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url || product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        {product.stock < 5 && (
                          <span className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" /> Low stock
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                    <TableCell className="text-right">{formatPrice(product.sellingPrice)}</TableCell>
                    <TableCell className="text-right">
                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock}
                       </span>
                    </TableCell>
                    <TableCell className="text-center">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className={`h-8 px-2 text-xs rounded-full ${product.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
                         onClick={() => toggleActiveMutation.mutate(product._id)}
                         disabled={toggleActiveMutation.isPending}
                       >
                          {product.isActive ? (
                            <><Check className="mr-1 w-3 h-3" /> Active</>
                          ) : (
                            <><XCircle className="mr-1 w-3 h-3" /> Inactive</>
                          )}
                       </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(product)} aria-label={`Edit ${product.name}`}>
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteModal(product)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          {data?.data?.data?.pagination && (
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
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2 text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Delete Product
              </h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-medium text-foreground">{deleteModal.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteModal(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteMutation.mutate(deleteModal._id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Delete Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">
                {editModalOpen ? "Edit Product" : "Add New Product"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => {
                setAddModalOpen(false)
                setEditModalOpen(false)
              }} aria-label="Close product modal">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 min-h-0" data-lenis-prevent="true">
              <form id="productForm" onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <Input 
                      placeholder="e.g. Wireless Headphones" 
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand</label>
                    <Input 
                      placeholder="e.g. Sony" 
                      value={productForm.brand}
                      onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your product..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock Quantity</label>
                    <Input 
                      type="number"
                      min="0"
                      placeholder="0" 
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">MRP (₹)</label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00" 
                      value={productForm.mrp}
                      onChange={(e) => setProductForm({...productForm, mrp: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selling Price (₹)</label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00" 
                      value={productForm.sellingPrice}
                      onChange={(e) => setProductForm({...productForm, sellingPrice: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Key Highlights</label>
                    <Button type="button" variant="outline" size="sm" onClick={addHighlightField} className="h-8">
                      <Plus className="mr-1 h-3 w-3" /> Add Highlight
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(productForm.keyHighlights || [""]).map((hl, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          placeholder="e.g. Premium build quality and durability" 
                          value={hl}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                        />
                        {(productForm.keyHighlights?.length || 1) > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlightField(index)} className="shrink-0 text-destructive hover:bg-destructive/10" aria-label="Remove highlight">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Product Images</label>
                  </div>
                  <div className="space-y-2">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={(e) => {
                            const newFiles = Array.from(e.target.files);
                            const totalFiles = [...productForm.images, ...newFiles];
                            if (totalFiles.length > 8) {
                              toast.error("You can only upload a maximum of 8 images.");
                              setProductForm({...productForm, images: totalFiles.slice(0, 8)});
                            } else {
                              setProductForm({...productForm, images: totalFiles});
                            }
                            e.target.value = "";
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1 mb-2">Uploading new images will completely replace all existing images.</p>
                        {productForm.images && productForm.images.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {productForm.images.map((file, i) => (
                              <div key={i} className="group h-20 w-20 bg-muted rounded-md border border-border overflow-hidden relative">
                                <img src={file instanceof File ? URL.createObjectURL(file) : (file.url || file)} alt="" className="h-full w-full object-cover" />
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const newImages = [...productForm.images];
                                    newImages.splice(i, 1);
                                    setProductForm({...productForm, images: newImages});
                                  }}
                                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-3 bg-muted/30">
              <Button type="button" variant="outline" onClick={() => {
                setAddModalOpen(false)
                setEditModalOpen(false)
              }}>
                Cancel
              </Button>
              <Button type="submit" form="productForm" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Package className="mr-2 h-4 w-4" />
                )}
                {editModalOpen ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
