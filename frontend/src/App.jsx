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
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-[52px] md:pb-0">
      <Navbar />

      <div className="container mx-auto flex flex-1 gap-6 px-3 py-4 md:py-8 md:px-6 relative">

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar drawer */}
        <aside
          className={`${
            isMobileMenuOpen
              ? "block fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-background border-r shadow-2xl overflow-y-auto pt-4 px-3"
              : "hidden"
          } shrink-0 md:block md:static md:w-auto md:bg-transparent md:border-0 md:shadow-none md:p-0`}
          data-lenis-prevent="true"
        >
          {isMobileMenuOpen && (
            <div className="flex justify-between items-center mb-4 pb-3 border-b px-1">
              <span className="font-bold text-base">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <Sidebar />
        </aside>

        <main className="flex-1 min-w-0">
          {/* Mobile dashboard header with hamburger */}
          <div className="md:hidden flex items-center justify-between mb-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                <Menu className="h-[18px] w-[18px]" />
              </button>
              <span className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">Dashboard Menu</span>
            </div>
          </div>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}

import React, { Suspense } from "react"
import { PageLoader } from "@/components/layout/PageLoader"

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

const CheckoutPage = React.lazy(() => import("@/pages/cart/CheckoutPage"))

const CustomerDashboard = React.lazy(() => import("@/pages/dashboard/CustomerDashboard"))
const CustomerOverview = React.lazy(() => import("@/pages/dashboard/customer/CustomerOverview"))
const CustomerProfile = React.lazy(() => import("@/pages/dashboard/customer/CustomerProfile"))
const CustomerOrders = React.lazy(() => import("@/pages/dashboard/customer/CustomerOrders"))
const CustomerOrderDetails = React.lazy(() => import("@/pages/dashboard/customer/CustomerOrderDetails"))
const CustomerAddresses = React.lazy(() => import("@/pages/dashboard/customer/CustomerAddresses"))
const SellerApplication = React.lazy(() => import("@/pages/dashboard/customer/SellerApplication"))

const SellerDashboard = React.lazy(() => import("@/pages/dashboard/SellerDashboard"))
const SellerOverview = React.lazy(() => import("@/pages/dashboard/seller/SellerOverview"))
const SellerProducts = React.lazy(() => import("@/pages/dashboard/seller/SellerProducts"))
const SellerOrders = React.lazy(() => import("@/pages/dashboard/seller/SellerOrders"))

const AdminDashboard = React.lazy(() => import("@/pages/dashboard/AdminDashboard"))
const AdminOverview = React.lazy(() => import("@/pages/dashboard/admin/AdminOverview"))
const AdminUsers = React.lazy(() => import("@/pages/dashboard/admin/AdminUsers"))
const AdminProducts = React.lazy(() => import("@/pages/dashboard/admin/AdminProducts"))
const AdminCategories = React.lazy(() => import("@/pages/dashboard/admin/AdminCategories"))
const AdminSellerRequests = React.lazy(() => import("@/pages/dashboard/admin/AdminSellerRequests"))
const AdminOrders = React.lazy(() => import("@/pages/dashboard/admin/AdminOrders"))

export default function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothTouch: false }}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>
    </ReactLenis>
  )
}
