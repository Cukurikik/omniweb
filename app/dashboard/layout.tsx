"use client"
import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform, useScroll,
} from "motion/react"
import { OmniLogo } from "@/components/omni-nav"

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
interface DashUser { id: string; name: string; email: string; plan: string; avatar?: string | null }
interface DashCtx  {
  user: DashUser | null; loading: boolean
  logout: () => void
  sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void
}
const Ctx = createContext<DashCtx>({
  user: null, loading: true, logout: () => {}, sidebarOpen: true, setSidebarOpen: () => {},
})
export const useDash = () => useContext(Ctx)

/* ─────────────────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────────────────── */
const NAV = [
  { href: "/dashboard",               label: "Overview",       icon: "overview",      group: "main"   },
  { href: "/dashboard/projects",      label: "Projects",       icon: "projects",      group: "main"   },
  { href: "/dashboard/analytics",     label: "Analytics",      icon: "analytics",     group: "main"   },
  { href: "/dashboard/packages",      label: "Packages",       icon: "packages",      group: "main"   },
  { href: "/dashboard/playground",    label: "Playground",     icon: "playground",    group: "tools"  },
  { href: "/dashboard/docs",          label: "Docs",           icon: "docs",          group: "tools"  },
  { href: "/dashboard/notifications", label: "Notifications",  icon: "notifications", group: "system" },
  { href: "/dashboard/settings",      label: "Settings",       icon: "settings",      group: "system" },
]
const NAV_GROUPS = [
  { key: "main",   label: "Main"   },
  { key: "tools",  label: "Tools"  },
  { key: "system", label: "System" },
]

/* ─────────────────────────────────────────────────────────
   ICONS  (single source, keyed by name)
───────────────────────────────────────────────────────── */
function NavIcon({ name, active }: { name: string; active: boolean }) {
  const w = active ? 1.8 : 1.5
  const paths: Record<string, React.ReactNode> = {
    overview: (
      <>
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={w} />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={w} />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={w} />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={w} />
      </>
    ),
    projects: <path d="M3 6a1 1 0 011-1h4l2 2h6a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" stroke="currentColor" strokeWidth={w} />,
    analytics: (
      <>
        <path d="M3 14l4-5 3 3 4-6 3 2" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        <line x1="3" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    packages: (
      <>
        <path d="M10 2l7 4v8l-7 4-7-4V6l7-4z" stroke="currentColor" strokeWidth={w} />
        <path d="M10 2v16M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </>
    ),
    playground: <path d="M5 4l10 6-10 6V4z" stroke="currentColor" strokeWidth={w} strokeLinejoin="round" />,
    docs: (
      <>
        <path d="M6 2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth={w} />
        <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="7" y1="13" x2="10" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
    notifications: (
      <>
        <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth={w} />
        <path d="M8 15.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
    settings: (
      <>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth={w} />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
  }
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────
   PLAN BADGE
───────────────────────────────────────────────────────── */
function PlanBadge({ plan }: { plan: string }) {
  const cfg = {
    community:  { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: "Free"       },
    pro:        { color: "#00d4ff", bg: "rgba(0,212,255,0.12)",  label: "Pro"        },
    enterprise: { color: "#a855f7", bg: "rgba(168,85,247,0.12)", label: "Enterprise" },
  }[plan?.toLowerCase()] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: plan }

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────── */
function Avatar({ name, size = 32 }: { name?: string | null; size?: number }) {
  const initials = (name ?? "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center font-black select-none"
      style={{
        width: size, height: size,
        fontSize: size * 0.35,
        background: "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,255,136,0.18))",
        color: "#00d4ff",
        border: "1.5px solid rgba(0,212,255,0.22)",
        boxShadow: "0 0 12px rgba(0,212,255,0.18)",
      }}
    >
      {initials}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   LOGOUT CONFIRM MODAL
───────────────────────────────────────────────────────── */
function LogoutModal({ onConfirm, onCancel, busy }: { onConfirm: () => void; onCancel: () => void; busy: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [onCancel])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* card */}
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.08] overflow-hidden"
        style={{ background: "rgba(13,17,23,0.98)", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.06)" }}
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        role="dialog"
        aria-modal="true"
        aria-label="Sign out confirmation"
      >
        {/* top accent line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)" }} />

        <div className="p-7">
          {/* icon */}
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
            animate={{ boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 24px rgba(239,68,68,0.25)", "0 0 0px rgba(239,68,68,0)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          <h2 className="text-center text-lg font-bold text-[#e2e8f0] mb-1.5">Sign Out</h2>
          <p className="text-center text-sm text-[#64748b] leading-relaxed mb-7">
            You will be signed out of your OMNI account and redirected to the login page.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#94a3b8] border border-white/[0.08] hover:bg-white/[0.04] hover:text-[#e2e8f0] transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <motion.button
              onClick={onConfirm}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(239,68,68,0.4)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
            >
              {busy ? (
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sign Out
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────── */
function Sidebar({
  open, setOpen, user, unread, onLogoutRequest,
}: {
  open: boolean; setOpen: (v: boolean) => void
  user: DashUser | null; unread: number
  onLogoutRequest: () => void
}) {
  const pathname = usePathname()
  const navRef   = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: navRef as React.RefObject<HTMLElement> })
  const topGlowOpacity = useTransform(scrollY, [0, 40], [0, 1])

  return (
    <>
      {/* mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-0 left-0 h-full z-[300] flex flex-col border-r border-white/[0.05] overflow-hidden"
        style={{
          background: "rgba(6,9,15,0.97)",
          backdropFilter: "blur(24px)",
          willChange: "width",
        }}
        animate={{ width: open ? 248 : 68 }}
        initial={{ width: 248 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        {/* scroll-linked top border glow */}
        <motion.div
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.45), rgba(0,255,136,0.3), transparent)",
            opacity: topGlowOpacity,
          }}
          aria-hidden="true"
        />

        {/* subtle vertical line on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, transparent, rgba(0,212,255,0.12) 40%, rgba(0,212,255,0.12) 60%, transparent)" }} aria-hidden="true" />

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 h-[60px] shrink-0 border-b border-white/[0.05]">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <OmniLogo size={30} />
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.div
                className="flex items-baseline gap-1 overflow-hidden"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <span className="text-[#e2e8f0] font-black text-sm tracking-tight whitespace-nowrap">OMNI</span>
                <span className="text-[#00d4ff] font-black text-sm">.</span>
                <span className="text-[#334155] font-mono text-[9px] ml-0.5 whitespace-nowrap">v2.0</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {open && (
              <motion.button
                className="ml-auto shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[#334155] hover:text-[#94a3b8] hover:bg-white/[0.05] transition-all"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                aria-label="Collapse sidebar"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav ── */}
        <nav
          ref={navRef}
          className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col"
          style={{ scrollbarWidth: "none" }}
        >
          {NAV_GROUPS.map(grp => {
            const items = NAV.filter(n => n.group === grp.key)
            return (
              <div key={grp.key} className="mb-1">
                <AnimatePresence>
                  {open && (
                    <motion.p
                      className="px-4 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1e293b]"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {grp.label}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="px-2 flex flex-col gap-0.5">
                  {items.map(({ href, label, icon }) => {
                    const isActive  = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                    const isNotif   = href === "/dashboard/notifications"
                    return (
                      <Link key={href} href={href} aria-label={label} aria-current={isActive ? "page" : undefined}>
                        <motion.div
                          className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl overflow-hidden cursor-pointer group"
                          animate={{
                            background: isActive ? "rgba(0,212,255,0.07)" : "transparent",
                            color: isActive ? "#00d4ff" : "#475569",
                          }}
                          whileHover={{
                            background: isActive ? "rgba(0,212,255,0.10)" : "rgba(255,255,255,0.035)",
                            color: isActive ? "#00d4ff" : "#94a3b8",
                          }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 360, damping: 28 }}
                        >
                          {/* active left pill */}
                          {isActive && (
                            <motion.div
                              layoutId="nav-pill"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                              style={{ height: 20, background: "#00d4ff", boxShadow: "0 0 8px rgba(0,212,255,0.6)" }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              aria-hidden="true"
                            />
                          )}

                          {/* active bg glow */}
                          {isActive && (
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)" }}
                              aria-hidden="true"
                            />
                          )}

                          <NavIcon name={icon} active={isActive} />

                          <AnimatePresence>
                            {open && (
                              <motion.span
                                className="text-[13px] font-medium whitespace-nowrap leading-none"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                              >
                                {label}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          {/* notification badge */}
                          {isNotif && unread > 0 && (
                            <AnimatePresence>
                              {open ? (
                                <motion.span
                                  key="badge-open"
                                  className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center bg-red-500 text-white"
                                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                >
                                  {unread > 99 ? "99+" : unread}
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="badge-dot"
                                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"
                                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                  aria-hidden="true"
                                />
                              )}
                            </AnimatePresence>
                          )}
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* ── User footer ── */}
        <div className="shrink-0 border-t border-white/[0.05] p-2">
          <motion.div
            className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer group"
            whileHover={{ background: "rgba(255,255,255,0.04)" }}
            transition={{ duration: 0.15 }}
          >
            <Avatar name={user?.name} size={32} />

            <AnimatePresence>
              {open && (
                <motion.div
                  className="flex-1 overflow-hidden min-w-0"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[12px] font-semibold text-[#e2e8f0] truncate leading-none">{user?.name ?? "—"}</p>
                    {user?.plan && <PlanBadge plan={user.plan} />}
                  </div>
                  <p className="text-[10px] text-[#334155] font-mono truncate leading-none">{user?.email ?? ""}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* logout button — always visible, icon-only when collapsed */}
            <motion.button
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#334155] hover:text-red-400 hover:bg-red-500/10 transition-all"
              onClick={onLogoutRequest}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Sign out"
              title="Sign out"
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  )
}

/* ─────────────────────────────────────────────────────────
   USER DROPDOWN (topbar)
───────────────────────────────────────────────────────── */
function UserDropdown({ user, onLogoutRequest }: { user: DashUser | null; onLogoutRequest: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  return (
    <div ref={ref} className="relative">
      <motion.button
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-white/[0.07] hover:border-white/[0.14] transition-all"
        style={{ background: "rgba(255,255,255,0.03)" }}
        onClick={() => setOpen(v => !v)}
        whileHover={{ background: "rgba(255,255,255,0.06)" }}
        whileTap={{ scale: 0.97 }}
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar name={user?.name} size={26} />
        <AnimatePresence>
          {user && (
            <motion.div
              className="hidden sm:block text-left leading-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <p className="text-[12px] font-semibold text-[#e2e8f0] whitespace-nowrap">{user.name}</p>
              {user.plan && <PlanBadge plan={user.plan} />}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.svg
          className="w-3.5 h-3.5 text-[#334155] ml-1"
          viewBox="0 0 12 12" fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/[0.08] overflow-hidden z-[500]"
            style={{ background: "rgba(10,14,20,0.98)", backdropFilter: "blur(24px)", boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)" }}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
          >
            {/* user info header */}
            <div className="px-4 py-3.5 border-b border-white/[0.06]">
              <p className="text-[13px] font-semibold text-[#e2e8f0] truncate">{user?.name ?? "—"}</p>
              <p className="text-[11px] text-[#475569] font-mono truncate mt-0.5">{user?.email ?? ""}</p>
            </div>

            {/* menu items */}
            <div className="p-1.5">
              {[
                { label: "Profile & Settings", href: "/dashboard/settings", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM2 20c0-4 4-7 10-7s10 3 10 7" },
                { label: "Notifications",       href: "/dashboard/notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
                { label: "Documentation",       href: "/dashboard/docs",          icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  <motion.div
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-[#64748b] hover:text-[#e2e8f0] hover:bg-white/[0.05] transition-colors cursor-pointer"
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </motion.div>
                </Link>
              ))}

              <div className="my-1 border-t border-white/[0.06]" />

              <motion.button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                onClick={() => { setOpen(false); onLogoutRequest() }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   TOPBAR
───────────────────────────────────────────────────────── */
function TopBar({
  sidebarOpen, user, unread, onLogoutRequest, onMenuToggle,
}: {
  sidebarOpen: boolean; user: DashUser | null; unread: number
  onLogoutRequest: () => void; onMenuToggle: () => void
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const label    = NAV.find(n => n.href === pathname || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label ?? "Dashboard"
  const isRoot   = pathname === "/dashboard"
  const segments = ["Dashboard", label].filter((s, i, a) => i === 0 || s !== a[i - 1])

  return (
    <motion.header
      className="fixed right-0 top-0 z-[100] h-[60px] flex items-center px-4 gap-3"
      style={{
        background: "rgba(6,9,15,0.92)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
      animate={{ left: sidebarOpen ? 248 : 68 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
    >
      {/* mobile hamburger */}
      <button
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#e2e8f0] hover:bg-white/[0.05] transition-all"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="3" y1="6"  x2="17" y2="6"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* back button — visible on sub-pages */}
      <AnimatePresence>
        {!isRoot && (
          <motion.button
            initial={{ opacity: 0, x: -8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{    opacity: 0, x: -8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-white/[0.07] text-[#475569] hover:text-[#e2e8f0] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all text-xs font-medium"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {segments.map((seg, i) => (
          <span key={seg} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[#1e293b]" aria-hidden="true">/</span>}
            <motion.span
              key={seg}
              className={i === segments.length - 1 ? "font-semibold text-[#e2e8f0]" : "text-[#334155]"}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.06 }}
            >
              {seg}
            </motion.span>
          </span>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* system status pill */}
        <motion.div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium"
          style={{ background: "rgba(0,255,136,0.07)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.15)" }}
          animate={{ opacity: [1, 0.75, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            aria-hidden="true"
          />
          Operational
        </motion.div>

        {/* search */}
        <motion.button
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-xl text-[12px] text-[#334155] border border-white/[0.07] hover:border-white/[0.12] hover:text-[#64748b] transition-all"
          style={{ background: "rgba(255,255,255,0.02)" }}
          whileHover={{ background: "rgba(255,255,255,0.05)" }}
          whileTap={{ scale: 0.97 }}
          aria-label="Search"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>Search</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-mono">⌘K</span>
        </motion.button>

        {/* notifications */}
        <Link href="/dashboard/notifications" aria-label={`${unread} notifications`}>
          <motion.div
            className="relative w-8 h-8 rounded-xl flex items-center justify-center text-[#475569] hover:text-[#e2e8f0] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.93 }}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 15.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {unread > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-black flex items-center justify-center bg-red-500 text-white"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 20 }}
              >
                {unread > 99 ? "99+" : unread}
              </motion.span>
            )}
          </motion.div>
        </Link>

        {/* logout button */}
        <motion.button
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium text-red-400/70 border border-red-500/[0.12] hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-all"
          onClick={onLogoutRequest}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Sign out"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign Out
        </motion.button>

        {/* user dropdown */}
        <UserDropdown user={user} onLogoutRequest={onLogoutRequest} />
      </div>
    </motion.header>
  )
}

/* ─────────────────────────────────────────────────────────
   CURSOR GLOW
───────────────────────────────────────────────────────── */
function CursorGlow() {
  const mx = useMotionValue(-400)
  const my = useMotionValue(-400)
  const sx  = useSpring(mx, { stiffness: 70, damping: 20 })
  const sy  = useSpring(my, { stiffness: 70, damping: 20 })

  useEffect(() => {
    const fn = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY) }
    window.addEventListener("mousemove", fn, { passive: true })
    return () => window.removeEventListener("mousemove", fn)
  }, [mx, my])

  return (
    <motion.div
      className="fixed pointer-events-none z-[9998]"
      style={{
        x: sx, y: sy,
        width: 400, height: 400,
        translateX: "-50%", translateY: "-50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.035) 0%, transparent 70%)",
        borderRadius: "50%",
      }}
      aria-hidden="true"
    />
  )
}

/* ─────────────────────────────────────────────────────────
   SCROLL PROGRESS
───────────────────────────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9997] origin-left"
      style={{ scaleX, background: "linear-gradient(90deg, #00d4ff 0%, #00ff88 50%, #a855f7 100%)" }}
      aria-hidden="true"
    />
  )
}

/* ─────────────────────────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter()
  const pathname = usePathname()

  const [user,         setUser]         = useState<DashUser | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [sidebarOpen,  setSidebarOpen]  = useState(true)
  const [unread,       setUnread]       = useState(0)
  const [showLogout,   setShowLogout]   = useState(false)
  const [logoutBusy,   setLogoutBusy]   = useState(false)

  /* Auth bootstrap from /api/auth/me */
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => {
        if (!r.ok) throw new Error("Not authenticated")
        return r.json()
      })
      .then(data => {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          plan: data.user.plan,
          avatar: data.user.avatar_url ?? data.user.avatar ?? null,
        })
        setLoading(false)
      })
      .catch(() => {
        router.replace("/login")
      })

    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUnread(d.unread ?? 0) })
      .catch(() => {})
  }, [router])

  const openLogoutModal  = useCallback(() => setShowLogout(true),  [])
  const closeLogoutModal = useCallback(() => { if (!logoutBusy) setShowLogout(false) }, [logoutBusy])

  async function handleLogout() {
    setLogoutBusy(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    } finally {
      setLogoutBusy(false)
      setShowLogout(false)
      router.replace("/login")
    }
  }

  /* Loading screen */
  if (loading) return (
    <div className="min-h-screen bg-[#060910] flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        >
          <OmniLogo size={48} />
        </motion.div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-[11px] font-mono text-[#1e293b] tracking-widest uppercase">Loading dashboard</p>
      </motion.div>
    </div>
  )

  return (
    <Ctx.Provider value={{ user, loading, logout: openLogoutModal, sidebarOpen, setSidebarOpen }}>
      <div className="min-h-screen bg-[#060910] text-[#e2e8f0]">
        <CursorGlow />
        <ScrollProgress />

        {/* ambient orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {[
            { c: "rgba(0,212,255,0.028)",  s: 600, x: "78%",  y: "12%",  d: 20 },
            { c: "rgba(0,255,136,0.022)",  s: 480, x: "12%",  y: "72%",  d: 24 },
            { c: "rgba(168,85,247,0.018)", s: 380, x: "52%",  y: "88%",  d: 17 },
          ].map((o, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: o.s, height: o.s, left: o.x, top: o.y,
                transform: "translate(-50%,-50%)",
                background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.12, 1], x: [0, 18, 0], y: [0, -12, 0] }}
              transition={{ duration: o.d, repeat: Infinity, ease: "easeInOut", delay: i * 4 }}
            />
          ))}
        </div>

        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          user={user}
          unread={unread}
          onLogoutRequest={openLogoutModal}
        />

        <TopBar
          sidebarOpen={sidebarOpen}
          user={user}
          unread={unread}
          onLogoutRequest={openLogoutModal}
          onMenuToggle={() => setSidebarOpen(v => !v)}
        />

        {/* page content */}
        <motion.main
          className="relative z-10 pt-[60px] min-h-screen"
          animate={{ marginLeft: sidebarOpen ? 248 : 68 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0,   filter: "blur(0px)" }}
              exit={{    opacity: 0, y: -8,  filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="p-6 lg:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.main>

        {/* logout confirmation modal */}
        <AnimatePresence>
          {showLogout && (
            <LogoutModal
              onConfirm={handleLogout}
              onCancel={closeLogoutModal}
              busy={logoutBusy}
            />
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
