"use client"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react"
import { useState, useEffect, useRef, useCallback } from "react"

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const DEPLOY_STEPS = [
  { id: 1, label: "Authorize GitHub",      desc: "Connect your GitHub org and select the repository to deploy from.",         icon: "github",   time: "~5s",   color: "#e2e8f0" },
  { id: 2, label: "Configure Variables",   desc: "Set OMNI_API_KEY, DATABASE_URL, REDIS_URL and any custom env variables.",    icon: "env",      time: "~15s",  color: "#a855f7" },
  { id: 3, label: "LLVM-Omni Compile",     desc: "All 15 language domains compiled in parallel — 4.1x SIMD vectorization.",   icon: "build",    time: "~30s",  color: "#00d4ff" },
  { id: 4, label: "Bundle & Optimize",     desc: "Dead-code elimination, LTO, and unikernel packaging at 3–8 MB.",            icon: "package",  time: "~12s",  color: "#f59e0b" },
  { id: 5, label: "Push to Edge Network",  desc: "Binary deployed to 43 global edge PoPs — P99 latency under 8ms anywhere.", icon: "globe",    time: "~10s",  color: "#00ff88" },
  { id: 6, label: "Health Check",          desc: "Automated smoke tests hit every route — 200 OK required before cut-over.", icon: "heart",    time: "~8s",   color: "#f59e0b" },
  { id: 7, label: "Go Live",               desc: "Traffic routed to new deployment. Instant rollback available anytime.",     icon: "check",    time: "Ready", color: "#00ff88" },
]

const FEATURES = [
  { label: "Automatic HTTPS + TLS 1.3",  icon: "shield",  color: "#00ff88",  desc: "Let's Encrypt auto-renewal, HSTS, OCSP stapling" },
  { label: "CI/CD from GitHub",           icon: "git",     color: "#a855f7",  desc: "Push to deploy on any branch, tag, or PR" },
  { label: "43-Region Edge Network",      icon: "globe",   color: "#00d4ff",  desc: "Sub-10ms latency worldwide, BGP Anycast routing" },
  { label: "Zero-Downtime Deploys",       icon: "swap",    color: "#f59e0b",  desc: "Blue-green with instant atomic traffic cut-over" },
  { label: "Preview Environments",        icon: "preview", color: "#00ff88",  desc: "Every PR gets its own unique preview URL" },
  { label: "Serverless Functions",        icon: "bolt",    color: "#a855f7",  desc: "Auto-scale to 0, pay-per-invocation pricing" },
  { label: "Analytics & Observability",   icon: "chart",   color: "#00d4ff",  desc: "Built-in latency histograms, error rates, traces" },
  { label: "Instant Rollback",            icon: "undo",    color: "#f59e0b",  desc: "One-click revert to any previous deployment" },
  { label: "DDoS Protection",             icon: "wall",    color: "#00ff88",  desc: "Layer-3/4/7 mitigation, 100+ Tbps capacity" },
  { label: "Custom Domains + DNS",        icon: "domain",  color: "#a855f7",  desc: "Wildcard certs, CNAME flattening, nameservers" },
  { label: "Build Cache",                 icon: "cache",   color: "#00d4ff",  desc: "Incremental compilation — 90% faster rebuilds" },
  { label: "Team Collaboration",          icon: "team",    color: "#f59e0b",  desc: "Roles, permissions, deployment approvals" },
]

const METRICS = [
  { value: "< 8ms",  label: "Cold Start",    sub: "Unikernel boot",    color: "#00d4ff" },
  { value: "43",     label: "Edge Regions",   sub: "Global PoPs",       color: "#a855f7" },
  { value: "99.99%", label: "Uptime SLA",     sub: "Guaranteed",        color: "#00ff88" },
  { value: "3 MB",   label: "Min Binary",     sub: "Unikernel size",    color: "#f59e0b" },
  { value: "4.1x",   label: "SIMD Speedup",   sub: "LLVM vectorize",    color: "#00d4ff" },
  { value: "0",      label: "Config Files",   sub: "Zero-config deploy",color: "#a855f7" },
]

const FRAMEWORKS = [
  { name: "Next.js",    logo: "N",  color: "#000000", bg: "#ffffff" },
  { name: "Remix",      logo: "R",  color: "#ffffff", bg: "#121212" },
  { name: "SvelteKit",  logo: "S",  color: "#ff3e00", bg: "#1a0500" },
  { name: "Astro",      logo: "A",  color: "#ff5d01", bg: "#17001a" },
  { name: "Nuxt",       logo: "N",  color: "#00dc82", bg: "#001a0d" },
  { name: "Go HTTP",    logo: "G",  color: "#00aed8", bg: "#001a20" },
  { name: "Python",     logo: "P",  color: "#ffd43b", bg: "#1a1600" },
  { name: "Rust Axum",  logo: "A",  color: "#e05d44", bg: "#1a0c0a" },
]

const BUILD_LINES = [
  { t: 0,    text: "$ omni build --target vercel-edge --release",       color: "#00d4ff" },
  { t: 300,  text: "[INFO]  Reading Omnifile.toml...",                   color: "#475569" },
  { t: 550,  text: "[SCAN]  Detecting 15 language domains...",           color: "#475569" },
  { t: 800,  text: "[LEXER] @rust   → 41 tokens in 1.2ms",              color: "#475569" },
  { t: 950,  text: "[LEXER] @go     → 38 tokens in 0.9ms",              color: "#475569" },
  { t: 1100, text: "[LEXER] @python → 29 tokens in 1.1ms",              color: "#475569" },
  { t: 1250, text: "[UAST]  Merging AST nodes: 1,247 total",             color: "#94a3b8" },
  { t: 1450, text: "[UAST]  Type-checking cross-lang bridges: 38 calls", color: "#94a3b8" },
  { t: 1650, text: "[LLVM]  Vectorize pass: 4.1x SIMD speedup achieved", color: "#00ff88" },
  { t: 1850, text: "[LLVM]  Inline expansion: 847 call sites collapsed",  color: "#475569" },
  { t: 2050, text: "[LLVM]  LTO: 12.4 KB dead code eliminated",           color: "#475569" },
  { t: 2250, text: "[LLVM]  Optimized IR → machine code (x86_64, ARM64)",color: "#475569" },
  { t: 2500, text: "[PACK]  Binary:    4.7 MB   (stripped + compressed)", color: "#94a3b8" },
  { t: 2700, text: "[PACK]  Unikernel: 6.1 MB   (OSv base + runtime)",   color: "#94a3b8" },
  { t: 2950, text: "[PUSH]  Uploading to Vercel edge network...",         color: "#a855f7" },
  { t: 3150, text: "[EDGE]  Replicating to 43 PoPs (JAX→NRT→LHR...)",  color: "#a855f7" },
  { t: 3400, text: "[CHECK] Health check: GET /health → 200 OK  (3ms)", color: "#00ff88" },
  { t: 3650, text: "[CHECK] Smoke tests: 12/12 routes passing",           color: "#00ff88" },
  { t: 3900, text: "[LIVE]  https://omni-app.vercel.app is live",         color: "#00ff88" },
  { t: 4100, text: "── Build complete in 3.61s ──────────────────────",  color: "#e2e8f0" },
]

const REGIONS = [
  "IAD","ORD","DFW","LAX","SEA","PDX","GRU","SCL",
  "LHR","CDG","AMS","FRA","ARN","WAW","MAD",
  "NRT","ICN","HKG","SIN","SYD","BOM","DXB",
  "JNB","CMH","SFO","ATL","MIA","YYZ","MEX",
]

const ENV_TEMPLATES = [
  { name: "OMNI_API_KEY",        placeholder: "omni_live_••••••••••••",   required: true  },
  { name: "DATABASE_URL",        placeholder: "postgresql://user:pass@…", required: true  },
  { name: "REDIS_URL",           placeholder: "redis://••••@host:6379",   required: false },
  { name: "OMNI_CLOUD_REGION",   placeholder: "us-east-1",                required: false },
  { name: "LOG_LEVEL",           placeholder: "info",                     required: false },
]

/* ─────────────────────────────────────────────────────────────
   ICON COMPONENT
───────────────────────────────────────────────────────────── */
function Icon({ name, size = 16, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const s = { width: size, height: size }
  const p = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  if (name === "github") return (
    <svg style={s} fill={color} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
  if (name === "env") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
  if (name === "build") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>
  if (name === "package") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
  if (name === "globe") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
  if (name === "heart") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
  if (name === "check") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  if (name === "shield") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  if (name === "git") return <svg style={s} {...p} viewBox="0 0 24 24"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9a9 9 0 01-9 9M6 9v3a3 3 0 003 3h3" /></svg>
  if (name === "bolt") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
  if (name === "chart") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
  if (name === "undo") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
  if (name === "wall") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  if (name === "domain") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
  if (name === "cache") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>
  if (name === "team") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
  if (name === "preview") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  if (name === "swap") return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
  return <svg style={s} {...p} viewBox="0 0 24 24"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
}

/* ─────────────────────────────────────────────────────────────
   BUILD LOG ANIMATION
───────────────────────────────────────────────────────────── */
function BuildLog({ running }: { running: boolean }) {
  const [shown, setShown] = useState<number[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!running) { setShown([]); return }
    const timers = BUILD_LINES.map((l, i) =>
      setTimeout(() => setShown(s => [...s, i]), l.t + 400)
    )
    return () => timers.forEach(clearTimeout)
  }, [running])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [shown])

  return (
    <div ref={logRef} className="h-full overflow-y-auto p-4 space-y-0.5 font-mono">
      {shown.map(i => (
        <motion.div
          key={i}
          className="text-[11px] leading-5 whitespace-nowrap"
          style={{ color: BUILD_LINES[i].color }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
        >
          {BUILD_LINES[i].text}
        </motion.div>
      ))}
      {running && shown.length < BUILD_LINES.length && (
        <span className="inline-block w-2 h-3.5 bg-[#00d4ff] animate-pulse align-middle ml-0.5" />
      )}
      {shown.length === BUILD_LINES.length && (
        <motion.div
          className="mt-2 text-[11px] font-bold text-[#00ff88]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          Deployment successful.
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   REGION MAP VISUAL
───────────────────────────────────────────────────────────── */
function RegionMap({ active }: { active: boolean }) {
  return (
    <div className="p-4">
      <p className="text-[10px] font-mono text-[#334155] mb-3 uppercase tracking-widest flex items-center gap-2">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
          animate={active ? { opacity: [1, 0.3, 1] } : { opacity: 0.3 }}
          transition={{ duration: 1.2, repeat: Infinity }}
          aria-hidden="true"
        />
        Edge Regions Propagating
      </p>
      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map((r, i) => (
          <motion.span
            key={r}
            className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
            style={{ borderColor: "rgba(0,112,243,0.3)", color: "rgba(0,112,243,0.7)", background: "rgba(0,112,243,0.07)" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={active ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.8 }}
            transition={{ delay: active ? 2.8 + i * 0.06 : 0, type: "spring", stiffness: 400, damping: 20 }}
          >
            {r}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PROGRESS STEPPER (LEFT PANEL)
───────────────────────────────────────────────────────────── */
function DeployProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex flex-col gap-0">
      {DEPLOY_STEPS.map((s, i) => {
        const done    = i < step
        const current = i === step
        return (
          <div key={s.id} className="flex gap-3 relative">
            {/* Vertical line */}
            {i < DEPLOY_STEPS.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px" style={{ background: done ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.05)" }} aria-hidden="true" />
            )}
            {/* Icon */}
            <div className="relative z-10 shrink-0">
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{
                  borderColor: done ? "#00ff88" : current ? s.color : "rgba(255,255,255,0.1)",
                  background:  done ? "rgba(0,255,136,0.12)" : current ? `${s.color}18` : "rgba(255,255,255,0.03)",
                }}
                animate={current ? { boxShadow: [`0 0 0px ${s.color}`, `0 0 14px ${s.color}80`, `0 0 0px ${s.color}`] } : {}}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                {done ? (
                  <Icon name="check" size={13} color="#00ff88" />
                ) : (
                  <Icon name={s.icon} size={13} color={current ? s.color : "#334155"} />
                )}
              </motion.div>
            </div>
            {/* Content */}
            <div className="pb-5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold leading-none ${done ? "text-[#00ff88]" : current ? "text-[#e2e8f0]" : "text-[#334155]"}`}>
                  {s.label}
                </p>
                <span className={`text-[10px] font-mono shrink-0 ${done ? "text-[#00ff88]" : current ? "text-[#94a3b8]" : "text-[#2d3748]"}`}>
                  {done ? "Done" : s.time}
                </span>
              </div>
              {(done || current) && (
                <motion.p
                  className="text-xs text-[#475569] mt-1 leading-relaxed"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  {s.desc}
                </motion.p>
              )}
              {current && (
                <motion.div
                  className="mt-2 h-0.5 rounded-full overflow-hidden bg-white/[0.05]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────────── */
type Tab = "deploy" | "settings" | "features" | "frameworks"

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function DeployButton() {
  const [open,       setOpen]       = useState(false)
  const [tab,        setTab]        = useState<Tab>("deploy")
  const [repoUrl,    setRepoUrl]    = useState("")
  const [target,     setTarget]     = useState<"production" | "preview" | "edge">("production")
  const [deploying,  setDeploying]  = useState(false)
  const [deployStep, setDeployStep] = useState(-1)
  const [envVars,    setEnvVars]    = useState<Record<string, string>>({})
  const [projectName,setProjectName]= useState("omni-app")
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* simulate deploy steps */
  const startSimulation = useCallback(() => {
    setDeploying(true)
    setDeployStep(0)
    let s = 0
    stepTimerRef.current = setInterval(() => {
      s += 1
      setDeployStep(s)
      if (s >= DEPLOY_STEPS.length) {
        clearInterval(stepTimerRef.current!)
        setDeploying(false)
      }
    }, 700)
  }, [])

  const handleDeploy = useCallback(() => {
    const base = repoUrl || "https://github.com/omni-lang/omni-starter"
    const url  = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(base)}&project-name=${encodeURIComponent(projectName)}&framework=nextjs`
    startSimulation()
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer")
    }, 2200)
  }, [repoUrl, projectName, startSimulation])

  /* lock scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  /* escape key */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setDeploying(false); setDeployStep(-1) } }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [])

  /* cleanup timers */
  useEffect(() => () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current) }, [])

  const handleClose = () => {
    setOpen(false)
    setDeploying(false)
    setDeployStep(-1)
    if (stepTimerRef.current) clearInterval(stepTimerRef.current)
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "deploy",     label: "Deploy" },
    { id: "settings",   label: "Settings" },
    { id: "features",   label: "Features" },
    { id: "frameworks", label: "Frameworks" },
  ]

  return (
    <>
      {/* ── TRIGGER BUTTON ─────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2.5 bg-[#050709] border border-[#0070f3]/50
          text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-xl overflow-hidden group"
        whileHover={{ scale: 1.04, borderColor: "rgba(0,112,243,0.85)", boxShadow: "0 0 44px rgba(0,112,243,0.32), 0 8px 32px rgba(0,0,0,0.5)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(135deg,rgba(0,112,243,0.14),rgba(0,40,120,0.07))" }} aria-hidden="true" />
        <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)", skewX: "-15deg" }}
          whileHover={{ translateX: "200%" }} transition={{ duration: 0.55 }} aria-hidden="true" />
        <motion.div className="relative z-10 w-5 h-5 flex items-center justify-center"
          whileHover={{ rotate: 8 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
          <svg viewBox="0 0 76 76" fill="none" className="w-4 h-4" aria-hidden="true">
            <path d="M38 0L76 76H0L38 0Z" fill="white" />
          </svg>
        </motion.div>
        <span className="relative z-10 tracking-wide">Deploy to Vercel</span>
        <motion.span className="relative z-10 w-1.5 h-1.5 rounded-full bg-[#00ff88] ml-0.5"
          animate={{ boxShadow: ["0 0 3px #00ff88","0 0 10px #00ff88","0 0 3px #00ff88"] }}
          transition={{ duration: 1.8, repeat: Infinity }} aria-hidden="true" />
      </motion.button>

      {/* ── FULL-SCREEN MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[9990] bg-black/90 backdrop-blur-2xl"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={handleClose} aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              className="fixed inset-0 z-[9995] flex items-stretch justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full h-full flex flex-col"
                style={{ background: "linear-gradient(160deg,#0a0f1a 0%,#080b12 60%,#0a0c14 100%)" }}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
                role="dialog" aria-modal="true" aria-label="Deploy OMNI to Vercel"
              >
                {/* Top glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0070f3]/70 to-transparent" aria-hidden="true" />
                <motion.div
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse,rgba(0,112,243,0.14) 0%,transparent 70%)" }}
                  animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 4, repeat: Infinity }}
                  aria-hidden="true"
                />

                {/* ── HEADER ─────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shrink-0"
                      initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.08 }}
                    >
                      <svg viewBox="0 0 76 76" fill="none" className="w-7 h-7" aria-hidden="true">
                        <path d="M38 0L76 76H0L38 0Z" fill="black" />
                      </svg>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                      <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="text-xl font-black text-[#e2e8f0] tracking-tight">Deploy OMNI to Vercel</h2>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#00ff88]/40 text-[#00ff88] bg-[#00ff88]/10 uppercase tracking-widest">
                          Live
                        </span>
                        {deploying && (
                          <motion.span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#f59e0b]/40 text-[#f59e0b] bg-[#f59e0b]/10 uppercase tracking-widest"
                            animate={{ opacity: [1,0.5,1] }} transition={{ duration: 0.9, repeat: Infinity }}
                          >
                            Deploying...
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-[#475569]">
                        One click. 43-region edge. Zero config. Live in under 60 seconds.
                      </p>
                    </motion.div>
                  </div>

                  {/* Tab bar + close */}
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
                      {TABS.map(t => (
                        <motion.button
                          key={t.id}
                          onClick={() => setTab(t.id)}
                          className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t.id ? "text-[#e2e8f0]" : "text-[#475569] hover:text-[#94a3b8]"}`}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        >
                          {tab === t.id && (
                            <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white/[0.09] rounded-lg border border-white/[0.1]"
                              transition={{ type: "spring", stiffness: 380, damping: 32 }} aria-hidden="true" />
                          )}
                          <span className="relative z-10">{t.label}</span>
                        </motion.button>
                      ))}
                    </div>
                    <motion.button
                      onClick={handleClose}
                      className="text-[#334155] hover:text-[#e2e8f0] p-2 rounded-lg hover:bg-white/[0.07] transition-colors"
                      whileHover={{ scale: 1.08, rotate: 90 }} whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* ── METRICS STRIP ──────────────────────────── */}
                <motion.div
                  className="grid grid-cols-3 md:grid-cols-6 divide-x divide-white/[0.05] border-b border-white/[0.07] shrink-0"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                >
                  {METRICS.map((m, i) => (
                    <motion.div
                      key={m.label}
                      className="flex flex-col items-center justify-center py-3.5 px-2 text-center"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 + i * 0.05 }}
                    >
                      <span className="text-lg font-black tabular-nums leading-none mb-0.5" style={{ color: m.color }}>
                        {m.value}
                      </span>
                      <span className="text-[9px] text-[#e2e8f0] font-semibold uppercase tracking-widest leading-none">{m.label}</span>
                      <span className="text-[8px] text-[#334155] mt-0.5">{m.sub}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* ── BODY ───────────────────────────────────── */}
                <AnimatePresence mode="wait">
                  {tab === "deploy" && (
                    <motion.div
                      key="deploy"
                      className="flex flex-1 min-h-0 overflow-hidden"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {/* LEFT — Steps + form */}
                      <div className="flex-1 min-w-0 overflow-y-auto p-6 flex flex-col gap-6">

                        {/* Repo input */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                          <label htmlFor="repo-url" className="block text-xs font-semibold text-[#94a3b8] mb-2 uppercase tracking-widest">
                            GitHub Repository
                          </label>
                          <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#334155]">
                              <Icon name="git" size={15} color="#475569" />
                            </div>
                            <motion.input
                              id="repo-url" type="url"
                              placeholder="https://github.com/your-org/your-omni-app"
                              value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                              className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-10 pr-4 py-3 text-sm
                                text-[#e2e8f0] placeholder:text-[#2d3748] outline-none transition-all
                                focus:border-[#0070f3]/60 focus:ring-2 focus:ring-[#0070f3]/15"
                              whileFocus={{ scale: 1.004 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            />
                          </div>
                          <p className="text-[10px] text-[#334155] mt-1.5">
                            Leave empty to deploy the official OMNI starter template
                          </p>
                        </motion.div>

                        {/* Project name */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                          <label htmlFor="project-name" className="block text-xs font-semibold text-[#94a3b8] mb-2 uppercase tracking-widest">
                            Project Name
                          </label>
                          <motion.input
                            id="project-name" type="text"
                            value={projectName} onChange={e => setProjectName(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-sm
                              text-[#e2e8f0] placeholder:text-[#2d3748] outline-none transition-all
                              focus:border-[#0070f3]/60 focus:ring-2 focus:ring-[#0070f3]/15"
                            whileFocus={{ scale: 1.004 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          />
                        </motion.div>

                        {/* Deployment target */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                          <p className="text-xs font-semibold text-[#94a3b8] mb-3 uppercase tracking-widest">Deployment Target</p>
                          <div className="grid grid-cols-3 gap-3">
                            {(["production","preview","edge"] as const).map(t => (
                              <motion.button
                                key={t}
                                onClick={() => setTarget(t)}
                                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-semibold transition-all ${
                                  target === t
                                    ? "border-[#0070f3]/60 text-[#e2e8f0]"
                                    : "border-white/[0.07] bg-white/[0.02] text-[#475569] hover:border-white/[0.12] hover:text-[#94a3b8]"
                                }`}
                                style={target === t ? { background: "rgba(0,112,243,0.1)" } : {}}
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                              >
                                {target === t && (
                                  <motion.div layoutId="target-bg"
                                    className="absolute inset-0 rounded-xl pointer-events-none"
                                    style={{ background: "linear-gradient(135deg,rgba(0,112,243,0.1),rgba(0,40,120,0.06))" }}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }} aria-hidden="true" />
                                )}
                                <span className="relative z-10 text-base">
                                  <Icon name={t === "production" ? "check" : t === "preview" ? "preview" : "bolt"} size={18}
                                    color={target === t ? "#0070f3" : "#334155"} />
                                </span>
                                <span className="relative z-10 capitalize">{t}</span>
                                <span className="relative z-10 text-[9px] font-normal opacity-60">
                                  {t === "production" ? "main branch" : t === "preview" ? "PR branches" : "43 edge PoPs"}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>

                        {/* Deploy steps */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
                          <p className="text-xs font-semibold text-[#94a3b8] mb-4 uppercase tracking-widest">Pipeline</p>
                          <DeployProgress step={deployStep} total={DEPLOY_STEPS.length} />
                        </motion.div>
                      </div>

                      {/* RIGHT — Build log + regions */}
                      <motion.div
                        className="hidden lg:flex w-96 xl:w-[440px] shrink-0 flex-col border-l border-white/[0.07]"
                        initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.28, type: "spring", stiffness: 280, damping: 26 }}
                      >
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-[#0d1117] shrink-0">
                          <div className="flex gap-1.5">
                            {["#ff5f57","#febc2e","#28c840"].map(c => (
                              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} aria-hidden="true" />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-[#334155] ml-1.5 flex-1">omni-deploy.log</span>
                          <motion.span
                            className="text-[9px] font-mono flex items-center gap-1"
                            style={{ color: deploying ? "#f59e0b" : deployStep >= DEPLOY_STEPS.length ? "#00ff88" : "#334155" }}
                            animate={deploying ? { opacity: [1,0.4,1] } : {}}
                            transition={{ duration: 0.9, repeat: Infinity }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full"
                              style={{ background: deploying ? "#f59e0b" : deployStep >= DEPLOY_STEPS.length ? "#00ff88" : "#2d3748" }}
                              aria-hidden="true" />
                            {deploying ? "BUILDING" : deployStep >= DEPLOY_STEPS.length ? "LIVE" : "READY"}
                          </motion.span>
                        </div>

                        {/* Log output */}
                        <div className="flex-1 min-h-0 bg-[#080b12] overflow-hidden">
                          <BuildLog running={deploying || deployStep >= 0} />
                        </div>

                        {/* Region map */}
                        <div className="border-t border-white/[0.07] bg-[#0d1117] shrink-0">
                          <RegionMap active={deployStep >= 4} />
                        </div>

                        {/* Perf preview */}
                        <div className="border-t border-white/[0.07] px-4 py-3 bg-[#0d1117] shrink-0">
                          <p className="text-[9px] font-mono text-[#334155] mb-2.5 uppercase tracking-widest">Live Performance</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: "TTFB",    value: "4ms",   bar: 0.04, color: "#00ff88" },
                              { label: "FCP",     value: "0.3s",  bar: 0.18, color: "#00d4ff" },
                              { label: "CLS",     value: "0.001", bar: 0.001,color: "#a855f7" },
                            ].map(m => (
                              <div key={m.label} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-[#334155] uppercase tracking-widest">{m.label}</span>
                                  <span className="text-[9px] font-mono" style={{ color: m.color }}>{m.value}</span>
                                </div>
                                <div className="h-0.5 rounded-full bg-white/[0.05]">
                                  <div className="h-full rounded-full" style={{ width: `${m.bar * 100}%`, background: m.color }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {tab === "settings" && (
                    <motion.div
                      key="settings"
                      className="flex-1 min-h-0 overflow-y-auto p-6"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <h3 className="text-base font-bold text-[#e2e8f0] mb-1">Environment Variables</h3>
                      <p className="text-xs text-[#475569] mb-6">
                        These are injected at build time and runtime on Vercel. Never commit secrets to your repository.
                      </p>
                      <div className="flex flex-col gap-3 max-w-2xl">
                        {ENV_TEMPLATES.map((env, i) => (
                          <motion.div
                            key={env.name}
                            className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 24 }}
                            whileHover={{ borderColor: "rgba(0,212,255,0.15)", backgroundColor: "rgba(0,212,255,0.03)" }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-mono font-bold text-[#00d4ff]">{env.name}</span>
                                {env.required && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/25 font-semibold">
                                    Required
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder={env.placeholder}
                                value={envVars[env.name] || ""}
                                onChange={e => setEnvVars(v => ({ ...v, [env.name]: e.target.value }))}
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs
                                  text-[#e2e8f0] placeholder:text-[#2d3748] font-mono outline-none transition-all
                                  focus:border-[#0070f3]/50 focus:ring-1 focus:ring-[#0070f3]/15"
                              />
                            </div>
                          </motion.div>
                        ))}
                        <motion.div
                          className="p-4 rounded-xl border border-dashed border-white/[0.1] text-center cursor-pointer"
                          whileHover={{ borderColor: "rgba(0,212,255,0.3)", backgroundColor: "rgba(0,212,255,0.03)" }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-[#334155] hover:text-[#475569] transition-colors font-semibold">
                            + Add custom variable
                          </p>
                        </motion.div>
                      </div>

                      {/* Build config */}
                      <div className="mt-8 max-w-2xl">
                        <h3 className="text-base font-bold text-[#e2e8f0] mb-1">Build Configuration</h3>
                        <p className="text-xs text-[#475569] mb-4">Customize the OMNI build pipeline for your project.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { label: "Build Command",   value: "omni build --release",      mono: true  },
                            { label: "Output Directory",value: ".omni/dist",                 mono: true  },
                            { label: "Install Command", value: "omni install",               mono: true  },
                            { label: "Node.js Version", value: "22.x (LTS)",                mono: false },
                          ].map((c, i) => (
                            <motion.div
                              key={c.label}
                              className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + i * 0.06 }}
                            >
                              <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest mb-2">{c.label}</p>
                              <p className={`text-sm text-[#e2e8f0] ${c.mono ? "font-mono" : ""}`}>{c.value}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "features" && (
                    <motion.div
                      key="features"
                      className="flex-1 min-h-0 overflow-y-auto p-6"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <h3 className="text-base font-bold text-[#e2e8f0] mb-1">Included with every OMNI Deploy</h3>
                      <p className="text-xs text-[#475569] mb-6">Zero configuration required — all features are active from the first deploy.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {FEATURES.map((f, i) => (
                          <motion.div
                            key={f.label}
                            className="flex gap-4 p-5 rounded-xl border border-white/[0.07] bg-white/[0.02] relative overflow-hidden"
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                            whileHover={{ y: -3, borderColor: `${f.color}30`, boxShadow: `0 8px 28px ${f.color}12` }}
                          >
                            <motion.div
                              className="absolute inset-0 pointer-events-none rounded-xl"
                              style={{ background: `radial-gradient(circle at 0% 0%, ${f.color}08, transparent 60%)` }}
                              initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }}
                              aria-hidden="true"
                            />
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                              style={{ borderColor: `${f.color}30`, background: `${f.color}12` }}>
                              <Icon name={f.icon} size={16} color={f.color} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#e2e8f0] leading-tight mb-1">{f.label}</p>
                              <p className="text-xs text-[#475569] leading-relaxed">{f.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {tab === "frameworks" && (
                    <motion.div
                      key="frameworks"
                      className="flex-1 min-h-0 overflow-y-auto p-6"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <h3 className="text-base font-bold text-[#e2e8f0] mb-1">Compatible Frameworks</h3>
                      <p className="text-xs text-[#475569] mb-6">OMNI auto-detects your frontend framework and configures the build pipeline automatically.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {FRAMEWORKS.map((fw, i) => (
                          <motion.div
                            key={fw.name}
                            className="flex flex-col items-center gap-3 p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]"
                            initial={{ opacity: 0, scale: 0.85, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 22 }}
                            whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.12)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}
                          >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl"
                              style={{ background: fw.bg, color: fw.color, border: `1px solid ${fw.color}30` }}>
                              {fw.logo}
                            </div>
                            <p className="text-xs font-bold text-[#94a3b8]">{fw.name}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Architecture overview */}
                      <div className="max-w-3xl">
                        <h4 className="text-sm font-bold text-[#e2e8f0] mb-4">OMNI + Vercel Architecture</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { title: "Build Layer",   items: ["LLVM-Omni compiler", "15-language UAST", "LTO + dead-code elim", "Unikernel packaging"],    color: "#00d4ff" },
                            { title: "Edge Layer",    items: ["43 global PoPs", "BGP Anycast routing", "< 8ms cold start", "TLS 1.3 + HSTS"],              color: "#a855f7" },
                            { title: "Runtime Layer", items: ["Rust arena allocator", "Go HTTP gateway", "Python ML inference", "WASM sandboxing"],         color: "#00ff88" },
                          ].map((layer, i) => (
                            <motion.div
                              key={layer.title}
                              className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]"
                              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full" style={{ background: layer.color }} aria-hidden="true" />
                                <p className="text-xs font-bold text-[#e2e8f0]">{layer.title}</p>
                              </div>
                              {layer.items.map(item => (
                                <div key={item} className="flex items-center gap-2 py-1">
                                  <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" aria-hidden="true" />
                                  <span className="text-xs text-[#64748b]">{item}</span>
                                </div>
                              ))}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── FOOTER ─────────────────────────────────── */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 border-t border-white/[0.07] bg-[#0d1117]/80 backdrop-blur-sm shrink-0"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                >
                  {/* Deploy CTA */}
                  <motion.button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="relative flex items-center gap-3 bg-white text-[#080b12] font-black
                      px-8 py-3.5 rounded-xl text-sm overflow-hidden shadow-2xl flex-none"
                    whileHover={!deploying ? { scale: 1.04, boxShadow: "0 0 50px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.5)" } : {}}
                    whileTap={!deploying ? { scale: 0.97 } : {}}
                    transition={{ type: "spring", stiffness: 360, damping: 22 }}
                    style={{ opacity: deploying ? 0.7 : 1, cursor: deploying ? "not-allowed" : "pointer" }}
                  >
                    <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
                      style={{ background: "linear-gradient(90deg,transparent,rgba(0,112,243,0.15),transparent)" }}
                      whileHover={{ translateX: "100%" }} transition={{ duration: 0.5 }} aria-hidden="true" />
                    <svg viewBox="0 0 76 76" fill="none" className="w-5 h-5 relative z-10 shrink-0" aria-hidden="true">
                      <path d="M38 0L76 76H0L38 0Z" fill="black" />
                    </svg>
                    <span className="relative z-10">{deploying ? "Deploying..." : "Deploy Now"}</span>
                    {!deploying && (
                      <motion.svg className="w-4 h-4 relative z-10"
                        fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                        animate={{ x: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity }} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </motion.svg>
                    )}
                    {deploying && (
                      <motion.div className="w-4 h-4 border-2 border-[#080b12]/30 border-t-[#080b12] rounded-full relative z-10"
                        animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} aria-hidden="true" />
                    )}
                  </motion.button>

                  {/* GitHub star */}
                  <motion.a
                    href="https://github.com/Cukurikik/Omni" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 border border-white/[0.1] bg-white/[0.03] text-[#94a3b8]
                      font-semibold px-5 py-3.5 rounded-xl text-sm hover:border-white/20 hover:text-[#e2e8f0] transition-colors flex-none"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }}
                    whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <Icon name="github" size={16} color="currentColor" />
                    Star on GitHub
                  </motion.a>

                  {/* Docs link */}
                  <motion.a
                    href="/docs/deploying"
                    className="flex items-center gap-2 text-[#475569] hover:text-[#94a3b8] text-sm font-medium transition-colors flex-none"
                    whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    Deploy docs
                  </motion.a>

                  <motion.button
                    onClick={handleClose}
                    className="text-[#2d3748] hover:text-[#64748b] transition-colors text-sm font-medium sm:ml-auto"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  >
                    Cancel
                  </motion.button>
                </motion.div>

                {/* Fine print */}
                <div className="px-6 pb-3 bg-[#0d1117]/80 text-[10px] text-[#1e293b] text-center shrink-0">
                  Redirects to Vercel to authorize GitHub and complete deployment.{" "}
                  <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer"
                    className="hover:text-[#334155] underline">Vercel docs</a>
                  {" "}·{" "}
                  <a href="/docs/deploying" className="hover:text-[#334155] underline">OMNI deploy guide</a>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
