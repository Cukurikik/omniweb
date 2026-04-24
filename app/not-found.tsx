"use client"

import { motion } from "motion/react"
import Link from "next/link"
import OmniLogo from "@/components/omni-logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060a13] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="flex flex-col items-center gap-6"
      >
        <OmniLogo size={64} />
        <h1 className="text-6xl font-black text-white tracking-tight">404</h1>
        <p className="text-[#94a3b8] text-lg max-w-md text-center">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-2.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 hover:bg-[#00d4ff]/20 transition-colors text-sm font-semibold"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
