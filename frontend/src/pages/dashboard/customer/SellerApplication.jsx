import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Store, Loader2, CheckCircle2, AlertCircle, Ban } from "lucide-react"
import { createSellerRequest, getMySellerRequest } from "@/api/sellerApi"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function SellerApplication() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [isReapplying, setIsReapplying] = useState(false)
  
  const { data: requestData, isLoading: isLoadingRequest } = useQuery({
    queryKey: ["my-seller-request"],
    queryFn: getMySellerRequest,
  })

  const mutation = useMutation({
    mutationFn: createSellerRequest,
    onSuccess: () => {
      toast.success("Seller application submitted successfully!")
      setIsReapplying(false)
      queryClient.invalidateQueries({ queryKey: ["my-seller-request"] })
    },
    onError: (error) => {
      if (error?.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        toast.error("Email Verification Required", {
          description: error?.response?.data?.message || "Please verify your email before applying as a seller."
        })
      } else {
        toast.error(error?.response?.data?.message || "Failed to submit application")
      }
    }
  })

  const [formData, setFormData] = useState({
    shopName: "",
    businessDescription: "",
    businessAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India"
    },
    documents: {
      gst: "",
      pan: "",
      identityProof: ""
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const existingRequest = requestData?.data?.data?.[0]

  if (isLoadingRequest) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.isBanned) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
          <Ban className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-destructive">Account Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          You have been banned from selling on mkthub. You can no longer submit a seller application.
        </p>
      </div>
    )
  }

  if (existingRequest && !isReapplying) {
    const statusColors = {
      PENDING: "bg-warning/10 text-warning border-warning/20",
      APPROVED: "bg-success/10 text-success border-success/20",
      REJECTED: "bg-destructive/10 text-destructive border-destructive/20"
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seller Application Status</h2>
          <p className="text-muted-foreground">View the current status of your application.</p>
        </div>

        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {existingRequest.status === "APPROVED" ? (
                <CheckCircle2 className="h-8 w-8 text-success" />
              ) : existingRequest.status === "REJECTED" ? (
                <AlertCircle className="h-8 w-8 text-destructive" />
              ) : (
                <Store className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">Application {existingRequest.status}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className={`mx-auto inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold ${statusColors[existingRequest.status]}`}>
              Status: {existingRequest.status}
            </div>
            
            {existingRequest.status === "PENDING" && (
              <p className="text-muted-foreground">
                Your application to become a seller for <strong>{existingRequest.shopName}</strong> is currently under review by our admin team. We will notify you once a decision has been made.
              </p>
            )}

            {existingRequest.status === "REJECTED" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-destructive/10 p-4 text-left">
                  <p className="font-semibold text-destructive mb-1">Reason for Rejection:</p>
                  <p className="text-sm text-destructive">{existingRequest.rejectionReason || "No specific reason provided."}</p>
                </div>
                <Button 
                  onClick={() => setIsReapplying(true)} 
                  className="w-full"
                  variant="outline"
                >
                  Submit a New Application
                </Button>
              </div>
            )}

            <div className="text-left bg-muted p-4 rounded-lg text-sm space-y-2">
              <p><strong>Brand / Store Name:</strong> {existingRequest.shopName}</p>
              <p><strong>Description:</strong> {existingRequest.businessDescription}</p>
              <p><strong>GST Number:</strong> {existingRequest.documents?.gst}</p>
              <p><strong>Submitted On:</strong> {new Date(existingRequest.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Become a Seller</h2>
        <p className="text-muted-foreground">
          {isReapplying ? "Submit a new application to become a seller." : "Fill out the form below to apply for a seller account on mkthub."}
        </p>
      </div>
      
      {isReapplying && (
        <Button variant="ghost" onClick={() => setIsReapplying(false)} className="mb-4">
          &larr; Back to Application Status
        </Button>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>All fields are required for verification purposes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Brand / Store Name</Label>
                <Input id="shopName" name="shopName" required value={formData.shopName} onChange={handleChange} placeholder="e.g. Acme Electronics" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea 
                  id="businessDescription" 
                  name="businessDescription" 
                  required 
                  value={formData.businessDescription} 
                  onChange={handleChange} 
                  placeholder="Describe the products you intend to sell"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Business Address</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="businessAddress.street">Street Address</Label>
                  <Input id="businessAddress.street" name="businessAddress.street" required value={formData.businessAddress.street} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress.city">City</Label>
                  <Input id="businessAddress.city" name="businessAddress.city" required value={formData.businessAddress.city} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress.state">State</Label>
                  <Input id="businessAddress.state" name="businessAddress.state" required value={formData.businessAddress.state} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress.postalCode">Postal Code</Label>
                  <Input id="businessAddress.postalCode" name="businessAddress.postalCode" required value={formData.businessAddress.postalCode} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress.country">Country</Label>
                  <Input id="businessAddress.country" name="businessAddress.country" required value={formData.businessAddress.country} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Verification Documents (IDs)</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documents.gst">GST Number</Label>
                  <Input id="documents.gst" name="documents.gst" required value={formData.documents.gst} onChange={handleChange} placeholder="e.g. 22AAAAA0000A1Z5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documents.pan">PAN Number</Label>
                  <Input id="documents.pan" name="documents.pan" required value={formData.documents.pan} onChange={handleChange} placeholder="e.g. ABCDE1234F" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documents.identityProof">Identity Proof (Aadhaar/Passport No.)</Label>
                  <Input id="documents.identityProof" name="documents.identityProof" required value={formData.documents.identityProof} onChange={handleChange} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
