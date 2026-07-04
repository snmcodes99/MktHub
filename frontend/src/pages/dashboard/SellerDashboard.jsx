import { Outlet } from "react-router-dom"
import { Store, TrendingUp, PackageSearch } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function SellerDashboard() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-10 -mb-12 w-40 h-40 rounded-full bg-indigo-300 opacity-20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner">
              <Store className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {user?.name ? `${user.name.split(' ')[0]}'s Store` : "Seller Workspace"}
              </h1>
              <p className="text-indigo-100 mt-1 max-w-xl text-sm md:text-base">
                Manage your business, add new products, track orders, and monitor your revenue all in one place.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 hidden md:flex">
             <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/10">
                <div className="bg-indigo-500/50 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-indigo-50" />
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Status</p>
                  <p className="text-sm font-semibold text-white">Active Seller</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border shadow-sm p-4 md:p-6 min-h-[500px]">
        <Outlet />
      </div>
    </div>
  )
}
