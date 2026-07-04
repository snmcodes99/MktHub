import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MapPin, Loader2, Plus, Edit2, Trash2, Star, X } from "lucide-react"
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/api/addressApi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function CustomerAddresses() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const defaultFormState = {
    name: "", phoneNo: "", houseNo: "", street: "", city: "", state: "", zipCode: "", addressType: "HOME"
  }
  const [formData, setFormData] = useState(defaultFormState)
  
  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  })

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      toast.success("Address added successfully")
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      closeForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add address")
    }
  })
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAddress(id, data),
    onSuccess: () => {
      toast.success("Address updated successfully")
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      closeForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update address")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success("Address deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    }
  })

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      toast.success("Default address updated")
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    }
  })

  const addresses = data?.data?.data || []

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  
  const handleEditClick = (address) => {
    setFormData({
      name: address.name || "",
      phoneNo: address.phoneNo || "",
      houseNo: address.houseNo || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      addressType: address.addressType || "HOME"
    })
    setEditingId(address._id)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeForm = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData(defaultFormState)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Addresses</h2>
          <p className="text-muted-foreground">Manage your shipping and billing addresses.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Address
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="animate-fade-in border-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Edit Address" : "Add New Address"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={closeForm}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input name="phoneNo" value={formData.phoneNo} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>House / Flat No.</Label>
                  <Input name="houseNo" value={formData.houseNo} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Street / Locality</Label>
                  <Input name="street" value={formData.street} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input name="city" value={formData.city} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input name="state" value={formData.state} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Address Type</Label>
                  <select 
                    name="addressType" 
                    value={formData.addressType} 
                    onChange={handleInputChange} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="HOME">Home</option>
                    <option value="OFFICE">Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Save Changes" : "Save Address"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 && !showAddForm ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center border-dashed">
          <div className="mb-4 rounded-full bg-muted p-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No addresses saved</h3>
          <p className="text-muted-foreground">Add an address to make checkout faster.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address._id} className={address.isDefault ? "border-primary" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {address.addressType} 
                  {address.isDefault && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {!address.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      title="Set as default"
                      onClick={() => setDefaultMutation.mutate(address._id)}
                      disabled={setDefaultMutation.isPending}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    title="Edit address"
                    onClick={() => handleEditClick(address)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    title="Delete address"
                    onClick={() => {
                      if (window.confirm("Delete this address?")) {
                        deleteMutation.mutate(address._id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <p className="font-medium text-foreground">{address.name || "Name not provided"}</p>
                  <p>{address.houseNo}, {address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                  <p className="pt-2">Phone: {address.phoneNo}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
