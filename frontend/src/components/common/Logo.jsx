import { Store } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Store className="h-5 w-5" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Market<span className="text-primary">Hub</span>
      </span>
    </div>
  )
}
