import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have the right role, redirect to appropriate dashboard
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />
      case "SELLER":
        return <Navigate to="/seller" replace />
      default:
        return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
