import { NavLink } from "react-router-dom"
import { Package, User as UserIcon, MapPin, Settings, LayoutDashboard, ShoppingBag, Store, Users, BarChart3, ListOrdered, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const customerLinks = [
  { name: "Dashboard", to: "/dashboard", icon: <UserIcon className="h-5 w-5" /> },
  { name: "Edit Profile", to: "/dashboard/profile", icon: <Settings className="h-5 w-5" /> },
  { name: "My Orders", to: "/dashboard/orders", icon: <Package className="h-5 w-5" /> },
  { name: "Addresses", to: "/dashboard/addresses", icon: <MapPin className="h-5 w-5" /> },
  { name: "Become a Seller", to: "/dashboard/apply-seller", icon: <Store className="h-5 w-5" /> },
]

const sellerLinks = [
  { name: "Dashboard", to: "/seller", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Products", to: "/seller/products", icon: <ShoppingBag className="h-5 w-5" /> },
  { name: "Orders", to: "/seller/orders", icon: <ListOrdered className="h-5 w-5" /> },
]

const adminLinks = [
  { name: "Dashboard", to: "/admin", icon: <BarChart3 className="h-5 w-5" /> },
  { name: "Users", to: "/admin/users", icon: <Users className="h-5 w-5" /> },
  { name: "Orders", to: "/admin/orders", icon: <ListOrdered className="h-5 w-5" /> },
  { name: "Products", to: "/admin/products", icon: <ShoppingBag className="h-5 w-5" /> },
  { name: "Categories", to: "/admin/categories", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Seller Requests", to: "/admin/requests", icon: <Store className="h-5 w-5" /> },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  
  if (!user) return null

  const linkGroups = []
  
  const filteredCustomerLinks = user.role === "SELLER" || user.role === "ADMIN"
    ? customerLinks.filter(link => link.name !== "Become a Seller")
    : customerLinks
  
  if (user.role === "ADMIN") {
    linkGroups.push({ title: "Admin Panel", links: adminLinks, activeColor: "bg-primary text-primary-foreground" })
    linkGroups.push({ title: "Seller Central", links: sellerLinks, activeColor: "bg-indigo-500 text-white" })
    linkGroups.push({ title: "My Account", links: filteredCustomerLinks, activeColor: "bg-primary text-primary-foreground" })
  } else if (user.role === "SELLER") {
    linkGroups.push({ title: "Seller Central", links: sellerLinks, activeColor: "bg-indigo-500 text-white" })
    linkGroups.push({ title: "My Account", links: filteredCustomerLinks, activeColor: "bg-primary text-primary-foreground" })
  } else {
    linkGroups.push({ title: "My Account", links: filteredCustomerLinks, activeColor: "bg-primary text-primary-foreground" })
  }

  return (
    <div
      className="sticky top-24 flex w-64 flex-col rounded-xl border bg-card py-4 shadow-sm h-[calc(100vh-8rem)] overflow-y-auto"
      data-lenis-prevent="true"
    >
      {linkGroups.map((group, index) => (
        <div key={group.title} className={index !== 0 ? "mt-6" : ""}>
          <div className="mb-2 px-6 pb-2 border-b">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h2>
          </div>
          <nav className="space-y-1 px-3">
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/dashboard" || link.to === "/seller" || link.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? group.activeColor
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
      <div className="mt-auto px-3 pb-4 pt-6">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  )
}
