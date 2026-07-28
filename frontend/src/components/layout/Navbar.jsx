import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Search, ShoppingCart, User, LogOut, Moon, Sun } from "lucide-react"
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
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get("search") || ""

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user,
  })

  const cartItemCount = cartData?.data?.data?.items?.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Products
            </Link>

            {user?.role === 'SELLER' && (
              <Link to="/seller" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Seller Dashboard
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          <div className="hidden max-w-sm flex-1 md:flex">
            <form 
              className="relative w-full"
              onSubmit={(e) => {
                e.preventDefault()
                const searchVal = e.target.search.value
                if (searchVal.trim()) {
                  navigate(`/products?search=${encodeURIComponent(searchVal)}`)
                } else {
                  navigate(`/products`)
                }
              }}
            >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                name="search"
                type="search"
                placeholder="Search products..."
                defaultValue={initialSearch}
                className="flex h-9 w-full rounded-full border border-input bg-muted/50 px-9 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </form>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === "dark"
              ? <Sun className="h-5 w-5 text-amber-400" />
              : <Moon className="h-5 w-5" />}
          </button>

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Account icon always goes to the user dashboard */}
              <Link to="/dashboard">
                <Button variant="ghost" className="rounded-full hidden sm:inline-flex gap-2">
                  <User className="h-4 w-4" />
                  My Account
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full sm:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-muted-foreground hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:inline-flex rounded-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
