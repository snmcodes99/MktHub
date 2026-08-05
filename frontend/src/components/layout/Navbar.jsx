import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { Search, ShoppingCart, User, LogOut, Moon, Sun, X, Home, Package, LayoutDashboard } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Logo } from "@/components/common/Logo"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { getCart } from "@/api/cartApi"

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const mobileSearchRef = useRef(null)

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user,
  })

  const cartItemCount =
    cartData?.data?.data?.items?.reduce((total, item) => total + item.quantity, 0) || 0

  // Focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus()
  }, [mobileSearchOpen])

  // Close search on route change
  useEffect(() => {
    setMobileSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    const val = e.target.search?.value?.trim()
    navigate(val ? `/products?search=${encodeURIComponent(val)}` : "/products")
    setMobileSearchOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl shadow-sm transition-all duration-300">
        <div className="flex h-16 md:h-[72px] items-center justify-between px-4 md:px-8 max-w-[1536px] mx-auto gap-4">

          {/* ── Left: Logo ── */}
          <Link to="/" className="shrink-0 transition-transform duration-300 hover:scale-[1.02]">
            <Logo />
          </Link>

          {/* ── Center: Desktop search ── */}
          <form
            className="hidden md:flex flex-1 max-w-xl mx-8 relative group"
            onSubmit={handleSearch}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/70 group-hover:text-primary transition-colors" />
              <input
                name="search"
                type="search"
                placeholder="Search for anything..."
                defaultValue={initialSearch}
                className="flex h-11 w-full rounded-full border border-border/50 bg-muted/30 pl-11 pr-4 text-[15px] shadow-sm transition-all duration-300 placeholder:text-muted-foreground/70 hover:bg-muted/50 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:bg-background"
              />
            </div>
          </form>

          {/* ── Right Section: Nav links & Actions ── */}
          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            {/* Desktop Nav links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground/80">
              <Link to="/products" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all">Products</Link>
              {user?.role === "SELLER" && <Link to="/seller" className="hover:text-foreground transition-all">Seller</Link>}
              {user?.role === "ADMIN"  && <Link to="/admin"  className="hover:text-foreground transition-all">Admin</Link>}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileSearchOpen(v => !v)}
                aria-label="Search"
                className="md:hidden h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95"
              >
                {theme === "dark"
                  ? <Sun  className="h-5 w-5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                  : <Moon className="h-5 w-5" />}
              </button>

              {/* Cart */}
              <Link to="/cart">
                <button className="relative h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 group">
                  <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  {cartItemCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </button>
              </Link>

              <div className="hidden md:block w-[1px] h-6 bg-border/50 mx-2"></div>

              {/* Auth buttons — desktop only */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="outline" className="rounded-full h-10 px-5 gap-2 text-sm border-border/50 bg-background hover:bg-muted/50 hover:border-primary/30 transition-all shadow-sm" asChild>
                    <Link to="/dashboard">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Account</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={logout} className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-95">
                    <LogOut className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Button variant="ghost" className="rounded-full h-10 px-5 text-sm font-semibold hover:bg-muted/80" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button className="rounded-full h-10 px-6 text-sm font-semibold shadow-md hover:shadow-primary/25 transition-all" asChild>
                    <Link to="/register">Sign up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile: Sign up pill (only when not logged in) */}
              {!user && (
                <Button className="md:hidden ml-1 rounded-full h-[30px] px-3.5 text-[11px] font-bold" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile Expandable Search Bar ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileSearchOpen ? "max-h-16 border-t" : "max-h-0"
          }`}
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={mobileSearchRef}
                name="search"
                type="search"
                placeholder="Search products..."
                defaultValue={initialSearch}
                className="w-full h-9 rounded-full border border-input bg-muted/60 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      {/* ══ MOBILE BOTTOM NAVIGATION BAR ══════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t h-[52px] flex items-stretch">
        <BottomTab to="/"        icon={<Home        className="h-[18px] w-[18px]" />} label="Home"    exact />
        <BottomTab to="/products" icon={<Search      className="h-[18px] w-[18px]" />} label="Explore" />
        <BottomTab to="/cart"    icon={
          <span className="relative">
            <ShoppingCart className="h-[18px] w-[18px]" />
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </span>
        } label="Cart" />
        {user ? (
          <BottomTab to="/dashboard" icon={<User className="h-[18px] w-[18px]" />} label="Account" />
        ) : (
          <BottomTab to="/login" icon={<User className="h-[18px] w-[18px]" />} label="Sign In" />
        )}
      </nav>
    </>
  )
}

function BottomTab({ to, icon, label, exact }) {
  const location = useLocation()
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
