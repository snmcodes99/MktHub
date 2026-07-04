import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Store, Loader2, CheckCircle2, XCircle, FileText, Search } from "lucide-react"
import { getAllSellerRequests, approveSellerRequest, rejectSellerRequest } from "@/api/sellerApi"
import { Card, CardContent } from "@/components/ui/card"
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

export default function AdminSellerRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [targetId, setTargetId] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["all-seller-requests"],
    queryFn: getAllSellerRequests,
  })

  const approveMutation = useMutation({
    mutationFn: approveSellerRequest,
    onSuccess: () => {
      toast.success("Seller approved successfully")
      setApproveModalOpen(false)
      setTargetId(null)
      queryClient.invalidateQueries({ queryKey: ["all-seller-requests"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to approve seller")
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectSellerRequest(id, { rejectionReason: reason }),
    onSuccess: () => {
      toast.success("Seller rejected")
      setRejectModalOpen(false)
      setTargetId(null)
      setRejectReason("")
      queryClient.invalidateQueries({ queryKey: ["all-seller-requests"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to reject seller")
    }
  })

  const openApproveModal = (id) => {
    setTargetId(id)
    setApproveModalOpen(true)
  }

  const openRejectModal = (id) => {
    setTargetId(id)
    setRejectReason("")
    setRejectModalOpen(true)
  }

  const handleApproveConfirm = () => {
    approveMutation.mutate(targetId)
  }

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    rejectMutation.mutate({ id: targetId, reason: rejectReason })
  }

  const rawRequests = data?.data?.data || []
  // Hide requests that are already approved or from existing sellers
  const requests = rawRequests.filter(req => req.status !== "APPROVED" && req.user?.role !== "SELLER")
  
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === "PENDING").length,
    REJECTED: requests.filter(r => r.status === "REJECTED").length,
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
          <h2 className="text-2xl font-bold tracking-tight">Seller Applications</h2>
          <p className="text-muted-foreground">Review and manage pending seller requests.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by shop, name, or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "ALL", label: "All", color: "" },
          { key: "PENDING", label: "Pending", color: "text-amber-600" },
          { key: "REJECTED", label: "Rejected", color: "text-red-600" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : `bg-background ${color || "text-muted-foreground"} border-border hover:bg-muted`
            }`}
          >
            {label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === key ? "bg-white/20" : "bg-muted"}`}>
              {statusCounts[key]}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center border-dashed">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No requests found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => {
                  const statusColors = {
                    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                    REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }
                  
                  return (
                    <TableRow key={req._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{req.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{req.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{req.shopName}</div>
                        <div className="text-xs text-muted-foreground max-w-[200px] truncate">{req.businessDescription}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[req.status]}`}>
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-mono">{req.documents?.gst || "N/A"}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {req.status === "PENDING" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-success hover:bg-success/10 hover:text-success border-success/20"
                              onClick={() => openApproveModal(req._id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                              onClick={() => openRejectModal(req._id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <XCircle className="mr-1 h-3 w-3" /> Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Approve Seller Application</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to approve this application? The user will immediately be granted Seller privileges and can begin listing products.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 bg-muted/50 p-4">
              <Button 
                variant="outline" 
                onClick={() => setApproveModalOpen(false)}
                disabled={approveMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="bg-success text-success-foreground hover:bg-success/90"
                onClick={handleApproveConfirm}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Seller Application</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please provide a reason for rejecting this seller application. This will be sent to the user.
                </p>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 bg-muted/50 p-4">
              <Button 
                variant="outline" 
                onClick={() => setRejectModalOpen(false)}
                disabled={rejectMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
              >
                {rejectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reject Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
