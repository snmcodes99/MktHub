import { cn } from "@/lib/utils"

/**
 * mkthub logo — Two solid dark triangles (▲ ▽) split by a vivid green line.
 * Clean white card background makes the mark pop on any navbar color.
 */
export function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-3 select-none group", className)}>
      {/* Mark: white pill with dark triangles + green split line */}
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] ring-1 ring-black/8 transition-all duration-300 group-hover:shadow-[0_4px_20px_rgba(15,118,110,0.25)] group-hover:ring-primary/40"
      >
        <svg
          width="22"
          height="28"
          viewBox="0 0 22 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ▲ Top triangle — solid dark slate */}
          <polygon
            points="11,2 21,13 1,13"
            fill="#0f172a"
          />
          {/* ─ Green separator line */}
          <line
            x1="0" y1="14"
            x2="22" y2="14"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* ▽ Bottom triangle — solid dark slate */}
          <polygon
            points="1,15 21,15 11,26"
            fill="#0f172a"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="text-[1.4rem] font-black tracking-tighter text-slate-900 leading-tight transition-colors duration-300 group-hover:text-slate-800">
          mkt<span className="text-emerald-500">hub</span>
        </span>
        <span className="text-[0.55rem] uppercase tracking-[0.2em] text-slate-400 font-semibold mt-0.5">
          marketplace
        </span>
      </div>
    </div>
  )
}
