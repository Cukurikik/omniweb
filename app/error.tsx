"use client"
import { useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { OmniLogo } from "@/components/omni-nav"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#020407] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="mb-8 flex justify-center"
        >
          <OmniLogo size={64} />
        </motion.div>

        <motion.h1
          className="text-4xl font-black text-[#e2e8f0] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Something went wrong
        </motion.h1>

        <motion.p
          className="text-[#475569] text-base mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          An unexpected error occurred. Please try again.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl text-sm font-bold text-[#020407]"
            style={{ background: "linear-gradient(135deg, #00d4ff, #0099cc)" }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-[#94a3b8] border border-white/[0.1] hover:border-white/[0.2] hover:text-[#e2e8f0] transition-all"
          >
            Go Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
