import { Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Store, CheckCircle2 } from "lucide-react"

export default function SellerDashboard() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Clean slim header — no blobs, no backdrop blur */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Store className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Seller Central</p>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {user?.name ? `${user.name}'s Store` : "My Store"}
            </h1>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Active Seller
        </span>
      </div>

      {/* Page content */}
      <div className="bg-card rounded-xl border shadow-sm p-4 md:p-6 min-h-[500px]">
        <Outlet />
      </div>
    </div>
  )
}
