import { Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Store, CheckCircle2 } from "lucide-react"

export default function SellerDashboard() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Premium minimal header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Store className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Seller Central</p>
            <h1 className="text-xl font-black text-foreground leading-none tracking-tight">
              {user?.name ? `${user.name}'s Store` : "My Store"}
            </h1>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-xs font-semibold shadow-sm">
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
