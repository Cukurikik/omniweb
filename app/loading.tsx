"use client"
import { motion } from "motion/react"

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Spinner */}
        <motion.div
          className="relative w-12 h-12"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00d4ff]" />
          <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#00ff88]/60" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#a855f7]/40" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <p className="text-[#e2e8f0] font-medium mb-1">Loading OMNI</p>
          <p className="text-[#475569] text-sm font-mono">Preparing the environment...</p>
        </motion.div>

        {/* Skeleton lines */}
        <motion.div
          className="w-64 space-y-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="h-3 rounded-full bg-white/[0.06]" />
          <div className="h-3 rounded-full bg-white/[0.04] w-3/4" />
          <div className="h-3 rounded-full bg-white/[0.04] w-1/2" />
        </motion.div>
      </motion.div>
    </div>
  )
}