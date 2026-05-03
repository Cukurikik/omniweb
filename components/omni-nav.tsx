"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll, cubicBezier } from "motion/react"
import { OmniLogo } from "@/components/omni-logo"
export { OmniLogo }

const NAV_LINKS = [
  { href: "/intro",      label: "Intro" },
  { href: "/docs",       label: "Docs" },
  { href: "/playground", label: "Playground" },
  { href: "/workflow",   label: "Workflow" },
  { href: "/roadmap",    label: "Roadmap" },
  { href: "/community",  label: "Community" },
  { href: "/showcase",       label: "Showcase" },
  { href: "/animation-lab",  label: "Anim Lab" },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export default function OmniNav() {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)

  /* ── scroll-hide logic ─────────────────────────────── */
  const prevY   = useRef(0)
  const [hidden,   setHidden]   = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const cur = window.scrollY
      setScrolled(cur > 20)
      setHidden(cur > 80 && cur > prevY.current)
      prevY.current = cur
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ── spring active pill ────────────────────────────── */
  const tabRefs   = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const activeLink = NAV_LINKS.find(l => isActive(pathname, l.href))
    if (!activeLink) { setPill({ left: 0, width: 0 }); return }
    const el = tabRefs.current[activeLink.href]
    if (!el) return
    const parent = el.parentElement!.getBoundingClientRect()
    const rect   = el.getBoundingClientRect()
    setPill({ left: rect.left - parent.left, width: rect.width })
  }, [pathname])

  /* ── mobile menu animations ────────────────────────── */
  const menuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.28, ease: cubicBezier(0.4, 0, 0.2, 1) } },
    open:   { opacity: 1, height: "auto", transition: { duration: 0.32, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  }
  const itemVariants = {
    closed: { opacity: 0, x: -16 },
    open:   (i: number) => ({
      opacity: 1, x: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: cubicBezier(0.16, 1, 0.3, 1) },
    }),
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -80 : 0, opacity: 1 }}
      transition={{
        y:       { type: "spring", stiffness: 280, damping: 28 },
        opacity: { duration: 0.4 },
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,border,box-shadow] duration-300 ${
        scrolled
          ? "bg-[#080b12]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(0,212,255,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="OMNI Framework home">
          <OmniLogo size={36} interactive={true} />
          <div className="flex items-center gap-2">
            <motion.span
              className="text-[#e2e8f0] font-black text-lg tracking-tight"
              whileHover={{ color: "#00d4ff" }}
              transition={{ duration: 0.15 }}
            >
              OMNI
            </motion.span>
            <motion.span
              className="hidden sm:block text-[10px] text-[#00d4ff] border border-[#00d4ff]/30 bg-[#00d4ff]/[0.06] px-1.5 py-0.5 rounded font-mono"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              v2.0.0
            </motion.span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 relative" aria-label="Main navigation">
          {/* Spring active background pill */}
          {pill.width > 0 && (
            <motion.div
              className="absolute rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20"
              style={{ height: "calc(100% - 8px)", top: 4 }}
              animate={{ left: pill.left, width: pill.width }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              aria-hidden="true"
            />
          )}

          {NAV_LINKS.map(l => {
            const active = isActive(pathname, l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                ref={el => { tabRefs.current[l.href] = el }}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active ? "text-[#00d4ff]" : "text-[#64748b] hover:text-[#e2e8f0]"
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <motion.a
            href="https://github.com/Cukurikik/Omni"
            target="_blank" rel="noopener noreferrer"
            className="p-2 text-[#64748b] rounded-lg"
            whileHover={{ color: "#e2e8f0", backgroundColor: "rgba(255,255,255,0.05)", scale: 1.08 }}
            transition={{ duration: 0.15 }}
            aria-label="View on GitHub"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </motion.a>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/login"
              className="text-sm font-medium text-[#64748b] hover:text-[#e2e8f0] px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Log in
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/docs" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Mobile hamburger */}
        <motion.button
          className="md:hidden p-2 text-[#64748b] rounded-lg"
          onClick={() => setOpen(!open)}
          whileHover={{ color: "#e2e8f0", backgroundColor: "rgba(255,255,255,0.05)" }}
          whileTap={{ scale: 0.92 }}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <motion.svg
            className="w-5 h-5"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.path
                  key="close"
                  strokeLinecap="round" strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              ) : (
                <motion.path
                  key="open"
                  strokeLinecap="round" strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </AnimatePresence>
          </motion.svg>
        </motion.button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants as any}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-[#0d1117]/98 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((l, i) => (
                <motion.div key={l.href} custom={i} variants={itemVariants as any}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(pathname, l.href)
                        ? "text-[#00d4ff] bg-[#00d4ff]/10"
                        : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/[0.04]"
                    }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                custom={NAV_LINKS.length}
                variants={itemVariants as any}
                className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2"
              >
                <Link href="/login" onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#e2e8f0] text-center border border-white/[0.08]">
                  Log in
                </Link>
                <Link href="/docs" onClick={() => setOpen(false)}
                  className="btn-primary py-3 text-sm justify-center">
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
