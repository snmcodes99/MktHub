import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Edit2, Trash2, FolderTree, Loader2, Search, X } from "lucide-react"
import { getCategories, createCategory, deleteCategory, updateCategory } from "@/api/categoryApi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const [newCategoryName, setNewCategoryName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editModal, setEditModal] = useState(null) // { _id, name }
  const [editName, setEditName] = useState("")
  const [deleteModal, setDeleteModal] = useState(null) // { _id, name }

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const createMutation = useMutation({
    mutationFn: (name) => createCategory({ name }),
    onSuccess: () => {
      toast.success("Category created successfully")
      setNewCategoryName("")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create category")
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => updateCategory(id, { name }),
    onSuccess: () => {
      toast.success("Category updated successfully")
      setEditModal(null)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update category")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully")
      setDeleteModal(null)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete category")
    }
  })

  const categories = data?.data?.data || []
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    createMutation.mutate(newCategoryName)
  }

  const openEditModal = (category) => {
    setEditModal(category)
    setEditName(category.name)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!editName.trim() || editName === editModal.name) {
      setEditModal(null)
      return
    }
    updateMutation.mutate({ id: editModal._id, name: editName })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage product categories for the platform.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>Create a new category for sellers to list their products under.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4">
            <Input 
              placeholder="Category name (e.g., Electronics, Clothing)" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="max-w-md"
            />
            <Button type="submit" disabled={createMutation.isPending || !newCategoryName.trim()}>
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center border-dashed">
              <div className="mb-4 rounded-full bg-muted p-4">
                <FolderTree className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No categories found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteModal(category)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden border">
            <div className="p-1 bg-primary" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Category</h3>
                <button onClick={() => setEditModal(null)} className="p-1 rounded hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Electronics"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditModal(null)} disabled={updateMutation.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending || !editName.trim()}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden border">
            <div className="p-1 bg-destructive" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-destructive/10 p-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold">Delete Category</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteModal.name}"</span>? Products under this category may be affected.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 bg-muted/50 px-6 py-4">
              <Button variant="outline" onClick={() => setDeleteModal(null)} disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteMutation.mutate(deleteModal._id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}