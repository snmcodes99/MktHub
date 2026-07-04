import { Link } from "react-router-dom"
import { Logo } from "@/components/common/Logo"

export function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo className="mb-4" />
            <p className="mb-6 max-w-sm text-sm text-muted-foreground text-balance">
              Your premium destination for quality products. Experience shopping redefined with seamless service and curated collections.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Shop</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Categories</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Special Offers</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>About Us</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Contact</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Careers</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Privacy Policy</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Terms of Service</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Shipping Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} MarketHub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Privacy</Link>
            <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0,0)}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
