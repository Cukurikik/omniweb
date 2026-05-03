// @ts-nocheck
"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from "motion/react"
import Link from "next/link"
import { useDash } from "./layout"
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

/* ─── types ─────────────────────────────────────────────── */
interface Stats { summary: Record<string,string|number>; buildHistory: Record<string,unknown>[]; recentBuilds: Record<string,unknown>[]; recentDeploys: Record<string,unknown>[] }

/* ─── spring config ──────────────────────────────────────── */
const sp = { type: "spring", stiffness: 300, damping: 26 } as const

/* ─── animated counter ───────────────────────────────────── */
function AnimCounter({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv     = useMotionValue(0)
  const sp2    = useSpring(mv, { stiffness: 60, damping: 20 })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!inView || typeof value !== "number") { setDisplay(String(value)); return }
    mv.set(0)
    const t = setTimeout(() => mv.set(value), 120)
    return () => clearTimeout(t)
  }, [inView, value, mv])

  useEffect(() => {
    if (typeof value !== "number") return
    return sp2.on("change", v => setDisplay(Math.round(v).toString()))
  }, [sp2, value])

  return <span ref={ref}>{display}{suffix}</span>
}

/* ─── stat card ──────────────────────────────────────────── */
function StatCard({ label, value, suffix, color, icon, trend, delay }: {
  label: string; value: number | string; suffix?: string
  color: string; icon: React.ReactNode; trend?: number; delay: number
}) {
  const mx  = useMotionValue(0); const my = useMotionValue(0)
  const rx  = useTransform(my, [-0.5, 0.5], [4, -4])
  const ry  = useTransform(mx, [-0.5, 0.5], [-4, 4])
  const srx = useSpring(rx, { stiffness: 180, damping: 20 })
  const sry = useSpring(ry, { stiffness: 180, damping: 20 })
  const gz  = useTransform([mx, my] as [typeof mx, typeof my],
    ([lx, ly]: [number, number]) =>
      `radial-gradient(circle at ${(lx+0.5)*100}% ${(ly+0.5)*100}%, ${color}08 0%, transparent 70%)`)

  return (
    <motion.div
      className="relative rounded-2xl border border-white/[0.07] p-5 overflow-hidden cursor-default select-none"
      style={{ background: "rgba(13,17,23,0.8)", rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ ...sp, delay }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      whileHover={{ boxShadow: `0 0 40px ${color}20, 0 8px 32px rgba(0,0,0,0.3)`, borderColor: `${color}25` }}
    >
      {/* bg glow */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background: gz as unknown as string }} aria-hidden="true" />

      {/* top corner glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}12 0%, transparent 70%)` }} aria-hidden="true" />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, color }}
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={sp}
        >
          {icon}
        </motion.div>
        {trend !== undefined && (
          <motion.span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{
              color:      trend >= 0 ? "#00ff88" : "#ef4444",
              background: trend >= 0 ? "rgba(0,255,136,0.1)" : "rgba(239,68,68,0.1)",
            }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: delay + 0.2 }}
          >
            {trend >= 0 ? "+" : ""}{trend}%
          </motion.span>
        )}
      </div>

      <motion.div
        className="text-3xl font-black mb-1"
        style={{ color }}
        animate={{ textShadow: [`0 0 8px ${color}40`, `0 0 20px ${color}70`, `0 0 8px ${color}40`] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <AnimCounter value={value} suffix={suffix} />
      </motion.div>
      <p className="text-[#475569] text-xs font-mono">{label}</p>
    </motion.div>
  )
}

/* ─── build status badge ─────────────────────────────────── */
function BuildStatus({ status }: { status: string }) {
  const cfg = {
    success: { color: "#00ff88", bg: "rgba(0,255,136,0.1)",  dot: true,  label: "Success" },
    failed:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  dot: false, label: "Failed"  },
    running: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", dot: true,  label: "Running" },
    live:    { color: "#00d4ff", bg: "rgba(0,212,255,0.1)",  dot: true,  label: "Live"    },
    stopped: { color: "#475569", bg: "rgba(71,85,105,0.1)",  dot: false, label: "Stopped" },
  }[status] ?? { color: "#475569", bg: "rgba(71,85,105,0.1)", dot: false, label: status }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.dot && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: cfg.color }}
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          aria-hidden="true"
        />
      )}
      {cfg.label}
    </span>
  )
}

/* ─── lang dot ───────────────────────────────────────────── */
function LangDot({ lang }: { lang: string }) {
  const colors: Record<string, string> = {
    Rust: "#ef4444", Go: "#00d4ff", Python: "#f59e0b",
    TypeScript: "#3178c6", Julia: "#a855f7", "C++": "#00ff88",
  }
  const c = colors[lang] ?? "#64748b"
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono"
      style={{ color: c, background: `${c}12`, border: `1px solid ${c}20` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} aria-hidden="true" />
      {lang}
    </span>
  )
}

/* ─── custom tooltip ─────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !Array.isArray(payload) || !payload.length) return null
  return (
    <motion.div
      className="rounded-xl border border-white/[0.08] p-3 text-xs font-mono"
      style={{ background: "rgba(8,11,18,0.95)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      <p className="text-[#475569] mb-1.5">{String(label)}</p>
      {payload.map((item: Record<string, unknown>, i: number) => (
        <p key={i} style={{ color: item.color as string }}>{String(item.name)}: <strong>{String(item.value)}</strong></p>
      ))}
    </motion.div>
  )
}

/* ─── section header ─────────────────────────────────────── */
function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-[15px] font-bold text-[#e2e8f0]">{title}</h2>
        {sub && <p className="text-[11px] text-[#334155] font-mono mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─── time ago ───────────────────────────────────────────── */
function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400)return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

/* ─── quick action card ──────────────────────────────────── */
function QuickAction({ label, desc, color, href, icon }: { label: string; desc: string; color: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.div
        className="relative flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] overflow-hidden cursor-pointer"
        style={{ background: "rgba(13,17,23,0.6)" }}
        whileHover={{ borderColor: `${color}30`, background: `${color}06`, y: -2, boxShadow: `0 8px 24px rgba(0,0,0,0.25), 0 0 20px ${color}15` }}
        whileTap={{ scale: 0.98 }}
        transition={sp}
      >
        <motion.div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, color }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={sp}
        >
          {icon}
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-[#e2e8f0]">{label}</p>
          <p className="text-[11px] text-[#475569] mt-0.5">{desc}</p>
        </div>
        <motion.div
          className="absolute inset-0 -translate-x-full pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.025), transparent)" }}
          whileHover={{ translateX: "100%" }}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        />
      </motion.div>
    </Link>
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useDash()
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<"builds" | "deploys">("builds")

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { label: "Total Builds",       value: stats?.summary?.totalBuilds   ?? 0,       suffix: "",    color: "#00d4ff", trend: 12,  delay: 0.08, icon: <IconBuild /> },
    { label: "Deployments",        value: stats?.summary?.totalDeploys  ?? 0,       suffix: "",    color: "#00ff88", trend: 8,   delay: 0.13, icon: <IconDeploy /> },
    { label: "Packages Installed", value: stats?.summary?.installedPkgs ?? 0,       suffix: "",    color: "#a855f7", trend: 5,   delay: 0.18, icon: <IconPackage /> },
    { label: "Avg Cold Start",     value: stats?.summary?.coldStartAvg  ?? "—",     suffix: "",    color: "#f59e0b", trend: -3,  delay: 0.23, icon: <IconSpeed /> },
    { label: "Uptime SLA",         value: stats?.summary?.uptimeSLA     ?? "—",     suffix: "",    color: "#00ff88", trend: 0,   delay: 0.28, icon: <IconUptime /> },
  ]

  const chartData = (stats?.buildHistory ?? []).map((d: Record<string, unknown>) => ({
    date:     String(d.date ?? "").slice(5),
    builds:   Number(d.builds  ?? 0),
    deploys:  Number(d.deploys ?? 0),
    duration: Number(d.duration ?? 0),
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── welcome header ── */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={sp}
      >
        <div>
          <motion.h1
            className="text-2xl font-black text-[#e2e8f0] mb-1"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...sp, delay: 0.05 }}
          >
            Welcome back,{" "}
            <motion.span
              style={{
                background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {user?.name?.split(" ")[0] ?? "Developer"}
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-[#475569] text-sm font-mono"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.14 }}
          >
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {" · "}OMNI Runtime v2.0.0
          </motion.p>
        </div>

        <motion.div
          className="hidden sm:flex items-center gap-3"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...sp, delay: 0.08 }}
        >
          <Link href="/dashboard/projects">
            <motion.button
              className="relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,212,255,0.25)", borderColor: "rgba(0,212,255,0.4)" }}
              whileTap={{ scale: 0.97 }}
              transition={sp}
            >
              <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
                style={{ background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.08),transparent)" }}
                whileHover={{ translateX: "100%" }} transition={{ duration: 0.5 }} aria-hidden="true" />
              <svg className="w-4 h-4 relative z-10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="relative z-10">New Project</span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── stat cards grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={i} className="rounded-2xl border border-white/[0.06] p-5 h-[126px]"
                style={{ background: "rgba(13,17,23,0.8)" }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }}
                aria-hidden="true"
              />
            ))
          : STAT_CARDS.map(c => <StatCard key={c.label} {...c} />)
        }
      </div>

      {/* ── two-col: chart + quick actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* build/deploy chart */}
        <motion.div
          className="xl:col-span-2 rounded-2xl border border-white/[0.07] p-5"
          style={{ background: "rgba(13,17,23,0.8)" }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-bold text-[#e2e8f0]">Build &amp; Deploy Activity</h2>
              <p className="text-[11px] text-[#334155] font-mono mt-0.5">Last 14 days</p>
            </div>
            {/* tab switcher */}
            <div className="flex items-center gap-1 bg-[#080b12] border border-white/[0.07] rounded-lg p-1">
              {(["builds", "deploys"] as const).map(t => (
                <motion.button
                  key={t}
                  className={`relative px-3 py-1.5 rounded-md text-xs font-medium capitalize ${tab === t ? "text-[#00d4ff]" : "text-[#475569]"}`}
                  onClick={() => setTab(t)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  {tab === t && (
                    <motion.div layoutId="chart-tab-bg"
                      className="absolute inset-0 rounded-md bg-[#00d4ff]/10 border border-[#00d4ff]/25"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{t}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-56 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBuilds" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDeploys" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey={tab}
                      stroke={tab === "builds" ? "#00d4ff" : "#00ff88"}
                      strokeWidth={2}
                      fill={tab === "builds" ? "url(#colorBuilds)" : "url(#colorDeploys)"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.35 }}
          className="flex flex-col gap-3"
        >
          <h2 className="text-[15px] font-bold text-[#e2e8f0]">Quick Actions</h2>
          <QuickAction label="New Project"    desc="Create a polyglot project" color="#00d4ff" href="/dashboard/projects"   icon={<svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>} />
          <QuickAction label="Open Playground" desc="Run code in the browser"   color="#00ff88" href="/dashboard/playground" icon={<svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 4.5l8 5.5-8 5.5V4.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>} />
          <QuickAction label="Browse Packages" desc="540+ OMNI packages"        color="#a855f7" href="/dashboard/packages"   icon={<svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2l7 4v8l-7 4-7-4V6l7-4z" stroke="currentColor" strokeWidth="1.8" /></svg>} />
          <QuickAction label="View Analytics"  desc="Build + deploy insights"   color="#f59e0b" href="/dashboard/analytics"  icon={<svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 14l4-5 3 3 4-6 3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          <QuickAction label="Settings"        desc="Profile &amp; preferences" color="#64748b" href="/dashboard/settings"   icon={<svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>} />
        </motion.div>
      </div>

      {/* ── recent builds + deploys ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* recent builds */}
        <motion.div
          className="rounded-2xl border border-white/[0.07] p-5"
          style={{ background: "rgba(13,17,23,0.8)" }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.38 }}
        >
          <SectionHeader
            title="Recent Builds"
            sub="Latest compilation runs"
            action={
              <Link href="/dashboard/projects">
                <motion.span className="text-[11px] text-[#475569] hover:text-[#00d4ff] font-mono transition-colors" whileHover={{ x: 2 }}>
                  View all →
                </motion.span>
              </Link>
            }
          />
          <div className="flex flex-col gap-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" />
                ))
              : (stats?.recentBuilds ?? []).map((b: Record<string,unknown>, i) => (
                  <motion.div
                    key={String(b.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                    style={{ background: "rgba(8,11,18,0.6)" }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...sp, delay: 0.42 + i * 0.06 }}
                    whileHover={{ x: 3 }}
                  >
                    <BuildStatus status={String(b.status)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#94a3b8] truncate">{String(b.lang)}</p>
                      <p className="text-[10px] text-[#334155] font-mono">branch: <span className="text-[#475569]">{String(b.branch)}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-mono text-[#475569]">{b.duration ? `${Number(b.duration) / 1000}s` : "—"}</p>
                      <p className="text-[10px] text-[#334155] font-mono">{timeAgo(Number(b.ts))}</p>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </motion.div>

        {/* recent deploys */}
        <motion.div
          className="rounded-2xl border border-white/[0.07] p-5"
          style={{ background: "rgba(13,17,23,0.8)" }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.42 }}
        >
          <SectionHeader
            title="Recent Deployments"
            sub="Live edge deployments"
            action={
              <Link href="/dashboard/projects">
                <motion.span className="text-[11px] text-[#475569] hover:text-[#00ff88] font-mono transition-colors" whileHover={{ x: 2 }}>
                  View all →
                </motion.span>
              </Link>
            }
          />
          <div className="flex flex-col gap-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" />
                ))
              : (stats?.recentDeploys ?? []).map((d: Record<string,unknown>, i) => (
                  <motion.div
                    key={String(d.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                    style={{ background: "rgba(8,11,18,0.6)" }}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...sp, delay: 0.44 + i * 0.06 }}
                    whileHover={{ x: -3 }}
                  >
                    <BuildStatus status={String(d.status)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#94a3b8] truncate">{String(d.target)}</p>
                      <p className="text-[10px] text-[#334155] font-mono">size: <span className="text-[#475569]">{String(d.size)}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-mono text-[#00d4ff]">{String(d.coldStart)}</p>
                      <p className="text-[10px] text-[#334155] font-mono">{timeAgo(Number(d.ts))}</p>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ─── small icons ─────────────────────────────────────────── */
function IconBuild()   { return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M14 6l-8 8M6 6h8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function IconDeploy()  { return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v10M5 8l5-5 5 5M4 16h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function IconPackage() { return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2l7 4v8l-7 4-7-4V6l7-4zM10 2v14M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.5" /></svg> }
function IconSpeed()   { return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 10l4-4M3 10a7 7 0 1014 0 7 7 0 00-14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg> }
function IconUptime()  { return <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg> }
