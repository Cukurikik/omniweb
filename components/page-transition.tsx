// @ts-nocheck
"use client"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react"
import { useRef, useEffect, useState } from "react"

/* ── Global scroll progress bar ──────────────────────────── */
function GlobalScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left pointer-events-none"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #00d4ff 0%, #00ff88 50%, #a855f7 100%)",
      }}
      aria-hidden="true"
    />
  )
}

/* ── Flash / wipe overlay on every route change ─────────── */
function RouteFlash({ pathname }: { pathname: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname + "-flash"}
        className="fixed inset-0 z-[9990] pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,212,255,0.07), transparent 70%)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        aria-hidden="true"
      />
    </AnimatePresence>
  )
}

/* ── Page content fade / slide ───────────────────────────── */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <GlobalScrollBar />
      <RouteFlash pathname={pathname} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
          exit={{   opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
