import { cn } from "@/lib/utils"

export function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none group", className)}>
      {/* Mark: white pill in light mode, slate pill in dark mode */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-black/8 dark:ring-white/10 transition-all duration-300 group-hover:ring-primary/40">
        <svg
          width="20"
          height="26"
          viewBox="0 0 22 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ▲ Top triangle */}
          <polygon points="11,2 21,13 1,13" className="fill-slate-900 dark:fill-slate-100" />
          {/* ─ Green separator */}
          <line x1="0" y1="14" x2="22" y2="14" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          {/* ▽ Bottom triangle */}
          <polygon points="1,15 21,15 11,26" className="fill-slate-900 dark:fill-slate-100" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="text-[1.25rem] font-black tracking-tighter text-slate-900 dark:text-white leading-tight transition-colors duration-300">
          mkt<span className="text-emerald-500">hub</span>
        </span>
        <span className="text-[0.52rem] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
          marketplace
        </span>
      </div>
    </div>
  )
}
