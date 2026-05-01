"use client"
import { useEffect } from "react"
import { motion } from "motion/react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg"
      >
        {/* Error icon */}
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <svg className="w-10 h-10 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </motion.div>

        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-mono mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          System Error
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl font-black text-[#e2e8f0] mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Something went wrong
        </motion.h1>

        <motion.p
          className="text-[#475569] mb-8 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          An unexpected error occurred in the OMNI runtime. 
          This might be a temporary issue. Try refreshing or return to home.
        </motion.p>

        {error.digest && (
          <motion.div
            className="mb-6 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-[#334155] text-[10px] font-mono">Error digest</p>
            <p className="text-[#64748b] text-xs font-mono truncate">{error.digest}</p>
          </motion.div>
        )}

        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-[#00d4ff] text-[#080b12] font-semibold text-sm hover:bg-[#00e5ff] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-[#e2e8f0] font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>

      {/* OMNI signature */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-[#334155] text-xs font-mono">OMNI Runtime v2.0.0 — Error Boundary</p>
      </motion.div>
    </div>
  )
}