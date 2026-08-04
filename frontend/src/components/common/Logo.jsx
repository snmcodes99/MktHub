import { cn } from "@/lib/utils"

export function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none group", className)}>
      {/* Icon mark */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f1520] shadow-md ring-1 ring-black/10 dark:ring-white/10 transition-all duration-300 group-hover:ring-emerald-500/50 overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ▲ Top triangle */}
          <polygon points="11,1 21,10 1,10" fill="white" opacity="0.95" />
          {/* ─ Green separator */}
          <line x1="0" y1="11" x2="22" y2="11" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          {/* ▽ Bottom triangle */}
          <polygon points="1,12 21,12 11,21" fill="white" opacity="0.95" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="text-[1.25rem] font-black tracking-tighter text-slate-900 dark:text-white leading-tight transition-colors duration-300">
          mkt<span className="text-emerald-500">hub</span>
        </span>
        <span className="hidden sm:block text-[0.52rem] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
          marketplace
        </span>
      </div>
    </div>
  )
}
