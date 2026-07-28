import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import { ReactLenis } from 'lenis/react'
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PageTransition } from "@/components/layout/PageTransition"
import { EmailVerificationBanner } from "@/components/layout/EmailVerificationBanner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}

import { Sidebar } from "@/components/layout/Sidebar"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      
      {/* Mobile Menu Toggle Bar */}
      <div className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-muted/30 sticky top-16 z-30">
        <span className="font-medium text-sm tracking-wide">Dashboard Menu</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-1.5 border rounded-md bg-background text-foreground hover:bg-muted transition-colors"
        >
           {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="container mx-auto flex flex-1 gap-8 px-4 py-4 md:py-8 md:px-6 relative">
        
        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`${
          isMobileMenuOpen 
            ? "block fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background border-r shadow-2xl transition-transform transform translate-x-0 overflow-y-auto pt-20 px-4" 
            : "hidden"
          } shrink-0 md:block md:static md:w-auto md:bg-transparent md:border-0 md:shadow-none md:p-0 md:pt-0`}
          data-lenis-prevent="true"
        >
          {isMobileMenuOpen && (
            <div className="flex justify-between items-center md:hidden mb-4 pb-2 border-b">
              <span className="font-semibold text-lg">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <Sidebar />
        </aside>

        <main className="flex-1 min-w-0 min-h-0">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}

import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage"
import VerifyEmailChangePage from "@/pages/auth/VerifyEmailChangePage"
import ProductListingPage from "@/pages/product/ProductListingPage"
import ProductDetailPage from "@/pages/product/ProductDetailPage"
import CartPage from "@/pages/cart/CartPage"
import CheckoutPage from "@/pages/cart/CheckoutPage"

import CustomerDashboard from "@/pages/dashboard/CustomerDashboard"
import CustomerOverview from "@/pages/dashboard/customer/CustomerOverview"
import CustomerProfile from "@/pages/dashboard/customer/CustomerProfile"
import CustomerOrders from "@/pages/dashboard/customer/CustomerOrders"
import CustomerOrderDetails from "@/pages/dashboard/customer/CustomerOrderDetails"
import CustomerAddresses from "@/pages/dashboard/customer/CustomerAddresses"
import SellerApplication from "@/pages/dashboard/customer/SellerApplication"

import SellerDashboard from "@/pages/dashboard/SellerDashboard"
import SellerOverview from "@/pages/dashboard/seller/SellerOverview"
import SellerProducts from "@/pages/dashboard/seller/SellerProducts"
import SellerOrders from "@/pages/dashboard/seller/SellerOrders"

import AdminDashboard from "@/pages/dashboard/AdminDashboard"
import AdminOverview from "@/pages/dashboard/admin/AdminOverview"
import AdminUsers from "@/pages/dashboard/admin/AdminUsers"
import AdminProducts from "@/pages/dashboard/admin/AdminProducts"
import AdminCategories from "@/pages/dashboard/admin/AdminCategories"
import AdminSellerRequests from "@/pages/dashboard/admin/AdminSellerRequests"
import AdminOrders from "@/pages/dashboard/admin/AdminOrders"

export default function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothTouch: false }}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/verify-email-change/:token" element={<VerifyEmailChangePage />} />
            <Route path="/products" element={<ProductListingPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
          </Route>

          {/* Dashboard Routes (Protected) */}
          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]} />}>
              <Route path="/dashboard" element={<CustomerDashboard />}>
                <Route index element={<CustomerOverview />} />
                <Route path="profile" element={<CustomerProfile />} />
                <Route path="orders" element={<CustomerOrders />} />
                <Route path="orders/:id" element={<CustomerOrderDetails />} />
                <Route path="addresses" element={<CustomerAddresses />} />
                <Route path="apply-seller" element={<SellerApplication />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["SELLER", "ADMIN"]} />}>
              <Route path="/seller" element={<SellerDashboard />}>
                <Route index element={<SellerOverview />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="orders" element={<SellerOrders />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="requests" element={<AdminSellerRequests />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ReactLenis>
  )
}
