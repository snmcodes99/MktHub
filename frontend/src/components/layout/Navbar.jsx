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
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
        <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6 max-w-[1536px] mx-auto gap-2">

          {/* ── Left: Logo ── */}
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          {/* ── Center: Desktop search ── */}
          <form
            className="hidden md:flex flex-1 max-w-md mx-4"
            onSubmit={handleSearch}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                name="search"
                type="search"
                placeholder="Search products..."
                defaultValue={initialSearch}
                className="flex h-9 w-full rounded-full border border-input bg-muted/50 pl-9 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </form>

          {/* ── Desktop Nav links ── */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            {user?.role === "SELLER" && <Link to="/seller" className="hover:text-primary transition-colors">Seller</Link>}
            {user?.role === "ADMIN"  && <Link to="/admin"  className="hover:text-primary transition-colors">Admin</Link>}
          </nav>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">

            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen(v => !v)}
              aria-label="Search"
              className="md:hidden h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {theme === "dark"
                ? <Sun  className="h-[18px] w-[18px] text-amber-400" />
                : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {/* Cart */}
            <Link to="/cart">
              <button className="relative h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <ShoppingCart className="h-[18px] w-[18px] md:h-5 md:w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute right-0 top-0 md:right-1 md:top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Auth buttons — desktop only */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" className="rounded-full gap-2 text-sm" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-muted-foreground hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" className="rounded-full text-sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button className="rounded-full text-sm" asChild>
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
