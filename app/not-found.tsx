"use client"
import Link from "next/link"
import { motion } from "motion/react"
import { OmniLogo } from "@/components/omni-logo"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Big 404 number */}
        <motion.div
          className="text-[200px] font-black leading-none select-none text-[#00d4ff]/[0.08]"
          style={{ letterSpacing: "-0.06em" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          404
        </motion.div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-16">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-mono mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            Page Not Found
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-black text-[#e2e8f0] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Lost in the <span className="text-[#00d4ff]">OmniVerse</span>
          </motion.h1>

          <motion.p
            className="text-[#475569] max-w-md mb-8 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The page you're looking for doesn't exist or has been moved to another domain.
            Perhaps it's exploring a different layer of the Universal AST?
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-[#00d4ff] text-[#080b12] font-semibold text-sm hover:bg-[#00e5ff] transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-[#e2e8f0] font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Read Docs
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative particles */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <OmniLogo size={40} />
        <span className="text-[#334155] text-xs font-mono">OMNI v2.0.0</span>
      </motion.div>
    </div>
  )
}