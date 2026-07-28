import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Store, Loader2, CheckCircle2, XCircle, Search, User,
  Clock, ShieldCheck, ShieldX, Building2, FileText, AlertCircle,
  MapPin, CreditCard, Hash, FileCheck, Mail, Briefcase
} from "lucide-react"
import { getAllSellerRequests, approveSellerRequest, rejectSellerRequest } from "@/api/sellerApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"

const STATUS_CONFIG = {
  PENDING:  { label: "Pending",  bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-200"  },
  APPROVED: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  REJECTED: { label: "Rejected", bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-400",     border: "border-red-200"    },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function AdminSellerRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [page, setPage] = useState(1)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [targetReq, setTargetReq] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["seller-requests", page],
    queryFn: () => getAllSellerRequests({ limit: 10, page }),
  })

  const approveMutation = useMutation({
    mutationFn: approveSellerRequest,
    onSuccess: () => {
      toast.success("Seller approved successfully!")
      setApproveModalOpen(false)
      setTargetReq(null)
      queryClient.invalidateQueries({ queryKey: ["all-seller-requests"] })
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to approve seller"),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectSellerRequest(id, { rejectionReason: reason }),
    onSuccess: () => {
      toast.success("Application rejected")
      setRejectModalOpen(false)
      setTargetReq(null)
      setRejectReason("")
      queryClient.invalidateQueries({ queryKey: ["all-seller-requests"] })
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to reject"),
  })

  const allRequests = data?.data?.data?.sellerRequests || []
  const requests = Array.isArray(allRequests) ? allRequests : []

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === "PENDING").length,
    APPROVED: requests.filter(r => r.status === "APPROVED").length,
    REJECTED: requests.filter(r => r.status === "REJECTED").length,
  }

  const filtered = requests.filter(req => {
    const q = searchTerm.toLowerCase().trim()
    const matchSearch = !q ||
      req.shopName?.toLowerCase().includes(q) ||
      req.user?.email?.toLowerCase().includes(q) ||
      req.user?.name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === "ALL" || req.status === statusFilter
    return matchSearch && matchStatus
  })

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (isError) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-lg font-semibold">Failed to load requests</p>
      <p className="text-sm text-muted-foreground">Please refresh the page.</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 80% 50%, white 0%, transparent 60%)"}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-amber-100 text-xs font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
            <h1 className="text-2xl font-bold">Seller Applications</h1>
            <p className="text-amber-100 text-sm mt-1">Review and manage seller applications</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
              <p className="text-2xl font-black">{counts.PENDING}</p>
              <p className="text-amber-100 text-xs font-semibold">Pending</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
              <p className="text-2xl font-black">{counts.APPROVED}</p>
              <p className="text-amber-100 text-xs font-semibold">Approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by shop, name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "ALL", label: "All", count: counts.ALL },
            { key: "PENDING", label: "Pending", count: counts.PENDING },
            { key: "APPROVED", label: "Approved", count: counts.APPROVED },
            { key: "REJECTED", label: "Rejected", count: counts.REJECTED },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === tab.key ? "bg-white/25" : "bg-muted"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold">No applications found</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              {requests.length === 0
                ? "No seller applications have been submitted yet."
                : "Try adjusting your search or filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(req => (
            <div key={req._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-background border rounded-xl shadow-sm hover:shadow-md transition-all gap-4 relative overflow-hidden ${req.status === "PENDING" ? "border-amber-200" : req.status === "APPROVED" ? "border-emerald-200" : "border-border"}`}>
              {/* Accent line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${req.status === "PENDING" ? "bg-gradient-to-b from-amber-400 to-orange-500" : req.status === "APPROVED" ? "bg-gradient-to-b from-emerald-400 to-teal-500" : "bg-gradient-to-b from-red-400 to-rose-500"}`} />
              
              <div className="flex items-center gap-4 min-w-0 pl-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{req.shopName}</p>
                  <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-xs truncate">{req.user?.name} • {req.user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end pl-2 sm:pl-0">
                <StatusBadge status={req.status} />
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground w-28">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => { setTargetReq(req); setDetailsModalOpen(true); }} className="hover:bg-primary/10 hover:text-primary transition-colors">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.data?.pagination && (
        <Pagination 
          currentPage={page} 
          totalPages={data.data.pagination.totalPages} 
          onPageChange={setPage} 
        />
      )}

      {/* Details Modal */}
      {detailsModalOpen && targetReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border">
            {/* Header */}
            <div className={`p-6 text-white relative ${targetReq.status === "PENDING" ? "bg-gradient-to-r from-amber-500 to-orange-500" : targetReq.status === "APPROVED" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`}>
              <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 80% 50%, white 0%, transparent 60%)"}} />
              <div className="relative flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{targetReq.shopName}</h2>
                  <p className="text-white/80 text-sm flex items-center gap-1.5"><User className="h-4 w-4" /> {targetReq.user?.name} • {targetReq.user?.email}</p>
                </div>
                <button onClick={() => setDetailsModalOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0" data-lenis-prevent="true">
              <div className="flex items-center justify-between">
                <StatusBadge status={targetReq.status} />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Applied {new Date(targetReq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>

              {targetReq.businessDescription && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Business Description</h4>
                  <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">{targetReq.businessDescription}</p>
                </div>
              )}

              {targetReq.businessAddress && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> Registered Address</h4>
                  <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">
                    {targetReq.businessAddress.street},<br />
                    {targetReq.businessAddress.city}, {targetReq.businessAddress.state} - {targetReq.businessAddress.postalCode}<br />
                    {targetReq.businessAddress.country}
                  </p>
                </div>
              )}

              {targetReq.documents && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><FileCheck className="h-4 w-4" /> Documents</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {targetReq.documents.gst && (
                      <div className="flex items-center gap-3 bg-muted/30 border border-border/50 p-3 rounded-xl">
                        <FileCheck className="h-6 w-6 text-emerald-500" />
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">GST Number</p>
                          <p className="font-mono text-sm">{targetReq.documents.gst}</p>
                        </div>
                      </div>
                    )}
                    {targetReq.documents.pan && (
                      <div className="flex items-center gap-3 bg-muted/30 border border-border/50 p-3 rounded-xl">
                        <CreditCard className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">PAN Number</p>
                          <p className="font-mono text-sm">{targetReq.documents.pan}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {targetReq.status === "REJECTED" && targetReq.rejectionReason && (
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-sm text-red-700">
                  <span className="font-semibold flex items-center gap-1.5 mb-2"><AlertCircle className="h-4 w-4" /> Reason for rejection:</span>
                  <p className="text-red-600/90">{targetReq.rejectionReason}</p>
                </div>
              )}
            </div>
            
            {/* Footer / Actions */}
            {targetReq.status === "PENDING" && (
              <div className="p-4 border-t bg-muted/20 flex gap-3">
                <Button
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => { setDetailsModalOpen(false); setApproveModalOpen(true); }}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Approve Application
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => { setDetailsModalOpen(false); setRejectReason(""); setRejectModalOpen(true); }}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <ShieldX className="h-4 w-4" />
                  Reject Application
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && targetReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Approve Application</h3>
                  <p className="text-xs text-muted-foreground">{targetReq.shopName}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>{targetReq.user?.name}</strong> will immediately be granted Seller privileges and can begin listing products.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t bg-muted/30 p-4">
              <Button variant="outline" onClick={() => setApproveModalOpen(false)} disabled={approveMutation.isPending}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => approveMutation.mutate(targetReq._id)} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Yes, Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && targetReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <ShieldX className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Reject Application</h3>
                  <p className="text-xs text-muted-foreground">{targetReq.shopName} by {targetReq.user?.name}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Provide a reason — this will be communicated to the applicant.</p>
              <textarea
                className="w-full min-h-[100px] rounded-xl border bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t bg-muted/30 p-4">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)} disabled={rejectMutation.isPending}>Cancel</Button>
              <Button variant="destructive" className="gap-2" onClick={() => rejectMutation.mutate({ id: targetReq._id, reason: rejectReason })} disabled={rejectMutation.isPending || !rejectReason.trim()}>
                {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject Application
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
