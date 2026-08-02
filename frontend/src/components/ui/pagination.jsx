import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

export function Pagination({ currentPage, totalPages, onPageChange, limit, onLimitChange, limitOptions = [10, 20, 50] }) {
  if (totalPages <= 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-3 text-sm text-slate-500 w-full sm:w-auto">
        {limit && onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Show:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 px-3.5 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1.5 hidden sm:flex mx-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`h-9 w-9 p-0 rounded-lg font-semibold ${
                    currentPage === page 
                      ? "shadow-sm" 
                      : "border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400"
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="text-slate-400 px-1 font-medium tracking-widest">
                  ...
                </span>
              )
            }
            return null
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 px-3.5 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 font-medium"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  )
}
