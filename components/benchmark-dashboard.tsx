"use client"
import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "motion/react"

/* ── Data ────────────────────────────────────────────────── */
interface Bench {
  label:    string
  short:    string
  color:    string
  coldMs:   number
  memMb:    number
  rpsK:     number
  cpuPct:   number
  imageMb:  number
}

const BENCHES: Bench[] = [
  { label: "OMNI Unikernel",  short: "OMNI",   color: "#00f2ff", coldMs: 7,   memMb: 18,  rpsK: 420, cpuPct: 12, imageMb: 6.4  },
  { label: "Docker / Go",     short: "Docker",  color: "#00ff88", coldMs: 210, memMb: 128, rpsK: 210, cpuPct: 38, imageMb: 27.0 },
  { label: "Node.js 22",      short: "Node",    color: "#f59e0b", coldMs: 380, memMb: 182, rpsK: 140, cpuPct: 56, imageMb: 72.0 },
]

interface Metric {
  key:         keyof Bench
  label:       string
  unit:        string
  lowerBetter: boolean
  max:         number
  fmt:         (v: number) => string
}

const METRICS: Metric[] = [
  { key: "coldMs",  label: "Cold Start",   unit: "ms",  lowerBetter: true,  max: 420,  fmt: v => `${v}ms`                    },
  { key: "memMb",   label: "Memory",       unit: "MB",  lowerBetter: true,  max: 200,  fmt: v => `${v} MB`                   },
  { key: "rpsK",    label: "Throughput",   unit: "K/s", lowerBetter: false, max: 500,  fmt: v => `${v}K rps`                 },
  { key: "cpuPct",  label: "CPU Usage",    unit: "%",   lowerBetter: true,  max: 70,   fmt: v => `${v}%`                     },
  { key: "imageMb", label: "Image Size",   unit: "MB",  lowerBetter: true,  max: 80,   fmt: v => `${v.toFixed(1)} MB`        },
]

/* ── Improvement sparkline data (v0.1 → v2.0) ── */
const TREND_DATA = [400, 320, 260, 190, 130, 80, 45, 22, 12, 7]

const METHODOLOGY = [
  "Hardware:  Apple M3 Pro (ARM64)",
  "Memory:    512 MB RAM, NVMe SSD",
  "OS:        Linux 6.8 unikernel / Docker 25.0 / Node 22.3",
  "Load tool: k6 v0.51, 3-run average",
  "Requests:  100,000 total, 50 concurrent",
  "Cold start: process-to-first-byte (PTFB)",
  "OMNI flags: -O3 + LTO + SIMD + PGO",
  "Reproducible: github.com/Cukurikik/Omni/bench",
]

/* ── Sub-components ──────────────────────────────────────── */
function Tooltip({ children, lines }: { children: React.ReactNode; lines: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 w-72 z-50 rounded-2xl border border-white/[0.1] p-4 shadow-2xl"
            style={{ background: "rgba(6,9,15,0.98)" }}
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 6 }}
            transition={{ duration: 0.16 }}
            role="tooltip"
          >
            <div className="text-[9px] font-mono text-[#00f2ff] uppercase tracking-widest mb-3">
              Test Methodology
            </div>
            {lines.map((l, i) => (
              <div key={i} className="flex gap-2 mb-1.5 last:mb-0">
                <span className="text-[#1e293b] text-[10px] font-mono flex-shrink-0">·</span>
                <span className="text-[10px] font-mono text-[#64748b] leading-relaxed">{l}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

function AnimatedBar({
  value, max, color, lowerBetter, allValues, delay,
}: {
  value: number; max: number; color: string; lowerBetter: boolean
  allValues: number[]; delay: number
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const pct    = Math.min((value / max) * 100, 100)
  const isBest = lowerBetter
    ? value === Math.min(...allValues)
    : value === Math.max(...allValues)

  return (
    <div ref={ref} className="flex items-center gap-2">
      <div className="relative flex-1 h-9 rounded-xl overflow-hidden border border-white/[0.04]"
        style={{ background: "rgba(255,255,255,0.02)" }}>

        {/* Fill bar */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-xl"
          style={{ background: `linear-gradient(90deg, ${color}22, ${color}55)` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Right border accent */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 rounded-full"
          style={{ background: color }}
          initial={{ left: "0%" }}
          animate={inView ? { left: `${pct}%` } : { left: "0%" }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Pulse on best */}
        {isBest && inView && (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-xl pointer-events-none"
            style={{ background: `${color}18`, width: `${pct}%` }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            aria-hidden="true"
          />
        )}
      </div>

      {isBest && (
        <motion.span
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: delay + 1 }}
        >
          BEST
        </motion.span>
      )}
    </div>
  )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 100, H = 36
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / (max - min || 1)) * (H - 4) - 2
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="overflow-visible">
      {/* Area fill */}
      <polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill={`${color}12`}
      />
      {/* Line */}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle cx={W} cy={H - ((data[data.length - 1] - min) / (max - min || 1)) * (H - 4) - 2}
        r={2.5} fill={color} />
    </svg>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function BenchmarkDashboard() {
  const wrapRef       = useRef<HTMLDivElement>(null)
  const inView        = useInView(wrapRef, { once: true, margin: "-80px 0px" })
  const [metric, setMetric] = useState<Metric>(METRICS[0])

  const allVals = BENCHES.map(b => b[metric.key] as number)

  return (
    <div ref={wrapRef} className="w-full">
      <motion.div
        className="rounded-2xl border border-white/[0.07] overflow-hidden"
        style={{ background: "rgba(5,8,14,0.98)" }}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Window chrome ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05]"
          style={{ background: "rgba(0,242,255,0.02)" }}>
          <div className="flex gap-1.5" aria-hidden="true">
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#334155]">benchmark-dashboard.omni</span>
          <div className="ml-auto flex items-center gap-3">
            <Tooltip lines={METHODOLOGY}>
              <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#334155] border border-white/[0.07] px-2.5 py-1 rounded-lg hover:border-[#00f2ff]/30 hover:text-[#00f2ff] transition-all">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
                </svg>
                Methodology
              </button>
            </Tooltip>
            <span className="text-[9px] font-mono text-[#1e293b] border border-white/[0.05] px-2 py-0.5 rounded">
              ARM64 · 512 MB
            </span>
          </div>
        </div>

        {/* ── Hero numbers ── */}
        <div className="grid grid-cols-3 border-b border-white/[0.05]">
          {BENCHES.map((b, i) => (
            <motion.div
              key={b.label}
              className="px-4 py-6 text-center border-r border-white/[0.05] last:border-r-0 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* bg glow on first */}
              {i === 0 && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(0,242,255,0.06) 0%, transparent 70%)" }}
                  aria-hidden="true" />
              )}
              <motion.div
                className="text-3xl md:text-4xl font-black font-mono tabular-nums mb-1 relative"
                style={{ color: b.color, textShadow: `0 0 32px ${b.color}50` }}
                animate={inView ? { opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 2.8 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
              >
                {b.coldMs}ms
              </motion.div>
              <div className="text-[9px] font-mono text-[#334155] uppercase tracking-wider mb-1">Cold Start</div>
              <div className="text-[11px] font-mono font-semibold" style={{ color: b.color }}>
                {b.short}
              </div>
              {i === 0 && (
                <motion.div
                  className="mt-1.5 text-[9px] font-mono text-[#00ff88]"
                  animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                >
                  {Math.round((BENCHES[2].coldMs / b.coldMs))}× faster
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Metric selector tabs ── */}
        <div className="flex overflow-x-auto border-b border-white/[0.05]" style={{ scrollbarWidth: "none" }}>
          {METRICS.map(m => (
            <button
              key={m.key as string}
              className="flex-shrink-0 px-4 py-2.5 text-[11px] font-mono relative transition-colors"
              style={{ color: metric.key === m.key ? "#00f2ff" : "#334155" }}
              onClick={() => setMetric(m)}
              aria-pressed={metric.key === m.key}
            >
              {metric.key === m.key && (
                <motion.div
                  layoutId="metric-indicator"
                  className="absolute inset-0 rounded"
                  style={{ background: "rgba(0,242,255,0.05)" }}
                />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          ))}
        </div>

        {/* ── Bar chart ── */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-[#475569]">
              {metric.label} &nbsp;·&nbsp; {metric.unit} &nbsp;·&nbsp;
              <span className="text-[#334155]">{metric.lowerBetter ? "lower is better" : "higher is better"}</span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={metric.key as string}
              className="flex flex-col gap-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {BENCHES.map((b, i) => {
                const val = b[metric.key] as number
                return (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: b.color }} aria-hidden="true" />
                        <span className="text-[12px] font-mono text-[#e2e8f0]">{b.label}</span>
                      </div>
                      <motion.span
                        className="text-[12px] font-mono font-bold"
                        style={{ color: b.color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                      >
                        {metric.fmt(val)}
                      </motion.span>
                    </div>
                    <AnimatedBar
                      value={val}
                      max={metric.max}
                      color={b.color}
                      lowerBetter={metric.lowerBetter}
                      allValues={allVals}
                      delay={i * 0.14}
                    />
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sparkline trend + reduction stat ── */}
        <div className="border-t border-white/[0.05] px-5 py-4 flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono text-[#334155] uppercase tracking-wider mb-0.5">
              OMNI Cold Start Trend — v0.1 to v2.0
            </div>
            <div className="text-[9px] font-mono text-[#1e293b]">400ms → 7ms over 10 major versions</div>
          </div>
          <Sparkline data={TREND_DATA} color="#00f2ff" />
          <div className="text-right flex-shrink-0">
            <motion.div
              className="text-2xl font-black font-mono tabular-nums"
              style={{ color: "#00f2ff", textShadow: "0 0 20px rgba(0,242,255,0.5)" }}
              animate={inView ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              −97%
            </motion.div>
            <div className="text-[9px] font-mono text-[#334155]">cold start reduction</div>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="border-t border-white/[0.04] px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {BENCHES.map(b => (
            <span key={b.label} className="flex items-center gap-1.5 text-[10px] font-mono text-[#334155]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} aria-hidden="true" />
              {b.label}
            </span>
          ))}
          <span className="ml-auto text-[9px] font-mono text-[#1e293b]">
            Reproducible: github.com/Cukurikik/Omni/benchmarks
          </span>
        </div>
      </motion.div>
    </div>
  )
}
