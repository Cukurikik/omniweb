"use client"

import { motion } from "motion/react"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#060a13] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="flex flex-col items-center gap-6"
      >
        <h1 className="text-4xl font-black text-white tracking-tight">Something went wrong</h1>
        <p className="text-[#94a3b8] text-lg max-w-md text-center">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-4 px-6 py-2.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 hover:bg-[#00d4ff]/20 transition-colors text-sm font-semibold"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  )
}
