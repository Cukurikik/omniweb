"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from "motion/react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts"

const sp = { type: "spring", stiffness: 300, damping: 26 } as const

/* ─── types ───────────────────────────────────────────────── */
interface AnalyticsData {
  summary:      { totalBuilds: number; successRate: number; avgBuildTime: number; coldStartP99: number }
  buildHistory: { date: string; builds: number; deploys: number; duration: number }[]
  langDist:     { lang: string; pct: number; color?: string }[]
  errorRate:    { date: string; errors: number; warnings: number }[]
  coldStarts:   { date: string; avg: number; p99: number }[]
  peakHours:    { hour: string; activity: number }[]
}

/* ─── custom tooltip ─────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !Array.isArray(payload) || !payload.length) return null
  return (
    <motion.div
      className="rounded-xl border border-white/[0.08] p-3 text-xs font-mono"
      style={{ background: "rgba(8,11,18,0.96)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      <p className="text-[#475569] mb-1.5">{String(label)}</p>
      {payload.map((item: Record<string, unknown>, i: number) => (
        <p key={i} style={{ color: item.color as string }}>
          {String(item.name)}: <strong>{String(item.value)}</strong>
        </p>
      ))}
    </motion.div>
  )
}

/* ─── animated counter ───────────────────────────────────── */
function AnimCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv     = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 60, damping: 20 })
  const [display, setDisplay] = useState("0")
  useEffect(() => {
    if (!inView) return
    mv.set(0)
    const t = setTimeout(() => mv.set(value), 100)
    return () => clearTimeout(t)
  }, [inView, value, mv])
  useEffect(() => spring.on("change", v => setDisplay(Math.round(v).toString())), [spring])
  return <span ref={ref}>{display}{suffix}</span>
}

/* ─── metric tile ────────────────────────────────────────── */
function MetricTile({
  label, value, suffix, color, sub, trend, delay,
}: { label: string; value: number; suffix?: string; color: string; sub?: string; trend?: number; delay: number }) {
  const mx  = useMotionValue(0); const my = useMotionValue(0)
  const rx  = useTransform(my, [-0.5, 0.5], [4, -4])
  const ry  = useTransform(mx, [-0.5, 0.5], [-4, 4])
  const srx = useSpring(rx, { stiffness: 180, damping: 20 })
  const sry = useSpring(ry, { stiffness: 180, damping: 20 })

  return (
    <motion.div
      className="relative rounded-2xl border border-white/[0.07] p-5 overflow-hidden cursor-default"
      style={{ background: "rgba(13,17,23,0.85)", rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...sp, delay }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      whileHover={{ boxShadow: `0 0 40px ${color}18, 0 8px 32px rgba(0,0,0,0.28)`, borderColor: `${color}22` }}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}10 0%, transparent 70%)` }} aria-hidden="true" />
      <p className="text-[11px] text-[#475569] font-mono mb-2">{label}</p>
      <motion.div
        className="text-3xl font-black mb-1"
        style={{ color }}
        animate={{ textShadow: [`0 0 6px ${color}30`, `0 0 18px ${color}60`, `0 0 6px ${color}30`] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        <AnimCounter value={value} suffix={suffix} />
      </motion.div>
      {sub && <p className="text-[10px] text-[#334155] font-mono">{sub}</p>}
      {trend !== undefined && (
        <motion.span
          className="absolute top-4 right-4 text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{ color: trend >= 0 ? "#00ff88" : "#ef4444", background: trend >= 0 ? "rgba(0,255,136,0.1)" : "rgba(239,68,68,0.1)" }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: delay + 0.2 }}
        >
          {trend >= 0 ? "+" : ""}{trend}%
        </motion.span>
      )}
    </motion.div>
  )
}

/* ─── chart card ─────────────────────────────────────────── */
function ChartCard({
  title, sub, children, delay, className = "",
}: { title: string; sub?: string; children: React.ReactNode; delay: number; className?: string }) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/[0.07] p-5 ${className}`}
      style={{ background: "rgba(13,17,23,0.85)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...sp, delay }}
    >
      <div className="mb-4">
        <h2 className="text-[14px] font-bold text-[#e2e8f0]">{title}</h2>
        {sub && <p className="text-[11px] text-[#334155] font-mono mt-0.5">{sub}</p>}
      </div>
      {children}
    </motion.div>
  )
}

const LANG_COLORS: Record<string, string> = {
  Rust: "#ef4444", Go: "#00d4ff", Python: "#f59e0b",
  TypeScript: "#3178c6", Julia: "#a855f7", "C++": "#00ff88",
  Swift: "#f97316", Kotlin: "#7c3aed",
}

/* ─── donut chart ────────────────────────────────────────── */
function DonutChart({ data }: { data: { lang: string; pct: number }[] }) {
  const [active, setActive] = useState<number | null>(null)
  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx={75} cy={75}
              innerRadius={48}
              outerRadius={72}
              dataKey="pct"
              strokeWidth={0}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.lang}
                  fill={LANG_COLORS[entry.lang] ?? "#64748b"}
                  opacity={active === null || active === i ? 1 : 0.4}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {active !== null ? (
              <motion.div key={data[active].lang} className="text-center"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <p className="text-sm font-black" style={{ color: LANG_COLORS[data[active].lang] ?? "#64748b" }}>
                  {data[active].pct}%
                </p>
                <p className="text-[9px] text-[#475569] font-mono">{data[active].lang}</p>
              </motion.div>
            ) : (
              <motion.div key="total" className="text-center"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-sm font-black text-[#e2e8f0]">{data.length}</p>
                <p className="text-[9px] text-[#475569] font-mono">langs</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* legend */}
      <div className="flex flex-col gap-2 flex-1">
        {data.map((d, i) => (
          <motion.div
            key={d.lang}
            className="flex items-center justify-between gap-2 cursor-default"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...sp, delay: 0.35 + i * 0.05 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="flex items-center gap-2">
              <motion.span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: LANG_COLORS[d.lang] ?? "#64748b" }}
                animate={active === i ? { scale: 1.4 } : { scale: 1 }}
                transition={sp}
              />
              <span className="text-[12px] font-mono" style={{ color: active === i ? "#e2e8f0" : "#475569" }}>
                {d.lang}
              </span>
            </div>
            <div className="h-1 rounded-full flex-1 max-w-[80px] overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ originX: 0, background: LANG_COLORS[d.lang] ?? "#64748b" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: d.pct / 100 }}
                transition={{ ...sp, delay: 0.4 + i * 0.05 }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#334155]">{d.pct}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─── heatmap: peak hours ─────────────────────────────────── */
function HeatmapBar({ data }: { data: { hour: string; activity: number }[] }) {
  const max = Math.max(...data.map(d => d.activity), 1)
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <motion.div
          key={d.hour}
          className="flex-1 rounded-t-sm relative group"
          style={{ originY: 1, background: `rgba(0,212,255,${0.06 + (d.activity / max) * 0.5})` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ ...sp, delay: 0.4 + i * 0.025 }}
          whileHover={{ background: `rgba(0,212,255,${0.15 + (d.activity / max) * 0.5})` }}
        >
          {/* tooltip */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <span className="text-[9px] font-mono text-[#00d4ff] bg-[#0d1117] border border-white/[0.08] px-1.5 py-0.5 rounded">
              {d.hour}: {d.activity}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── range buttons ──────────────────────────────────────── */
const RANGES = ["7d", "14d", "30d", "90d"] as const
type Range = typeof RANGES[number]

/* ─── main page ──────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [data,    setData]  = useState<AnalyticsData | null>(null)
  const [loading, setLoad]  = useState(true)
  const [range,   setRange] = useState<Range>("14d")

  useEffect(() => {
    setLoad(true)
    fetch("/api/analytics")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoad(false) })
      .catch(() => setLoad(false))
  }, [range])

  const buildHist  = (data?.buildHistory  ?? []).map(d => ({ ...d, date: String(d.date).slice(5) }))
  const errorRate  = (data?.errorRate     ?? []).map(d => ({ ...d, date: String(d.date).slice(5) }))
  const coldStarts = (data?.coldStarts    ?? []).map(d => ({ ...d, date: String(d.date).slice(5) }))
  const langDist   = data?.langDist ?? []
  const peakHours  = data?.peakHours ?? []

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* header */}
      <motion.div className="flex items-center justify-between"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={sp}>
        <div>
          <h1 className="text-2xl font-black text-[#e2e8f0]">Analytics</h1>
          <p className="text-[#475569] text-sm font-mono mt-0.5">Build, deploy &amp; runtime insights</p>
        </div>
        {/* range switcher */}
        <motion.div
          className="flex items-center gap-1 bg-[#0d1117]/80 border border-white/[0.07] rounded-xl p-1"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...sp, delay: 0.08 }}
        >
          {RANGES.map(r => (
            <motion.button
              key={r}
              onClick={() => setRange(r)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-mono ${range === r ? "text-[#00d4ff]" : "text-[#475569]"}`}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            >
              {range === r && (
                <motion.div layoutId="range-bg"
                  className="absolute inset-0 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/25"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }} aria-hidden="true" />
              )}
              <span className="relative z-10">{r}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* metric tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricTile label="Total Builds"   value={data?.summary?.totalBuilds  ?? 248} suffix=""   color="#00d4ff" trend={12}  delay={0.08} sub="last 30 days" />
        <MetricTile label="Success Rate"   value={data?.summary?.successRate  ?? 97}  suffix="%"  color="#00ff88" trend={2}   delay={0.12} sub="builds passed" />
        <MetricTile label="Avg Build Time" value={data?.summary?.avgBuildTime ?? 4}   suffix="s"  color="#f59e0b" trend={-8}  delay={0.16} sub="p50 latency" />
        <MetricTile label="P99 Cold Start" value={data?.summary?.coldStartP99 ?? 9}   suffix="ms" color="#a855f7" trend={-15} delay={0.20} sub="edge runtime" />
      </div>

      {/* two col: build chart + lang donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Build &amp; Deploy Activity" sub="Daily counts" delay={0.24} className="xl:col-span-2">
          {loading ? <div className="h-56 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={buildHist}>
                <defs>
                  <linearGradient id="gbuild" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gdeploy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="builds"  stroke="#00d4ff" strokeWidth={2} fill="url(#gbuild)"  name="Builds" />
                <Area type="monotone" dataKey="deploys" stroke="#00ff88" strokeWidth={2} fill="url(#gdeploy)" name="Deploys" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Language Distribution" sub="Usage share by language" delay={0.28}>
          {loading
            ? <div className="h-56 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" />
            : <DonutChart data={langDist} />
          }
        </ChartCard>
      </div>

      {/* two col: error rate + cold starts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Error &amp; Warning Rate" sub="Daily compilation issues" delay={0.3}>
          {loading ? <div className="h-52 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={errorRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="errors"   fill="#ef4444" fillOpacity={0.75} radius={[3,3,0,0]} name="Errors" />
                <Bar dataKey="warnings" fill="#f59e0b" fillOpacity={0.55} radius={[3,3,0,0]} name="Warnings" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Cold Start Latency" sub="Avg + P99 in milliseconds" delay={0.34}>
          {loading ? <div className="h-52 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={coldStarts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="avg" stroke="#00d4ff" strokeWidth={2} dot={false} name="Avg (ms)" />
                <Line type="monotone" dataKey="p99" stroke="#a855f7" strokeWidth={2} dot={false} name="P99 (ms)" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* peak hours heatmap */}
      <ChartCard title="Peak Activity Hours" sub="UTC time · activity intensity" delay={0.38} className="">
        {loading ? <div className="h-28 rounded-xl bg-white/[0.03] animate-pulse" aria-hidden="true" /> : (
          <div>
            <HeatmapBar data={peakHours} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] font-mono text-[#334155]">12 AM</span>
              <span className="text-[9px] font-mono text-[#334155]">6 AM</span>
              <span className="text-[9px] font-mono text-[#00d4ff]">12 PM</span>
              <span className="text-[9px] font-mono text-[#334155]">6 PM</span>
              <span className="text-[9px] font-mono text-[#334155]">11 PM</span>
            </div>
          </div>
        )}
      </ChartCard>

    </div>
  )
}
