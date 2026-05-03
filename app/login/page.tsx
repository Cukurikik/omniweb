"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring, useTime, useInView,
} from "motion/react"
import { OmniLogo } from "@/components/omni-nav"

/* ─────────────────────────────────────────────────────── constants */
const sp = { type: "spring", stiffness: 340, damping: 26 } as const

/* ─────────────────────────────────────────────────────── particle canvas */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    let W = canvas.width  = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    let mouse = { x: W / 2, y: H / 2 }
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    const onMove   = (e: MouseEvent) => { mouse = { x: e.clientX, y: e.clientY } }
    window.addEventListener("resize", onResize)
    window.addEventListener("mousemove", onMove, { passive: true })

    interface Particle {
      x: number; y: number; vx: number; vy: number
      r: number; color: string; alpha: number; life: number; maxLife: number
    }
    const COLORS = ["rgba(0,212,255,", "rgba(0,255,136,", "rgba(168,85,247,", "rgba(245,158,11,"]
    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: 0.8 + Math.random() * 2.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.15 + Math.random() * 0.55,
      life: Math.random() * 200, maxLife: 180 + Math.random() * 120,
    }))

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.life++
        if (p.life > p.maxLife) {
          p.x = Math.random() * W; p.y = Math.random() * H
          p.life = 0; p.maxLife = 180 + Math.random() * 120
        }
        const wrap = (v: number, max: number) => v < 0 ? max : v > max ? 0 : v
        p.x = wrap(p.x, W); p.y = wrap(p.y, H)
        const fade = Math.sin((p.life / p.maxLife) * Math.PI)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${(p.alpha * fade).toFixed(2)})`
        ctx.fill()
      }
      /* connection lines */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${(0.07 * (1 - dist / 80)).toFixed(3)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      /* mouse attract */
      for (const p of particles) {
        const dx = mouse.x - p.x; const dy = mouse.y - p.y
        const d = Math.hypot(dx, dy)
        if (d < 120) { p.vx += dx * 0.00012; p.vy += dy * 0.00012 }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMove) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}

/* ─────────────────────────────────────────────────────── floating lang chips */
const LANGS = [
  { label: "Rust",       color: "#ef4444", x: 7,  y: 12, dur: 6.5 },
  { label: "Go",         color: "#00d4ff", x: 80, y: 18, dur: 7.2 },
  { label: "Python",     color: "#f59e0b", x: 4,  y: 52, dur: 5.8 },
  { label: "TypeScript", color: "#3178c6", x: 76, y: 58, dur: 8.0 },
  { label: "Julia",      color: "#a855f7", x: 12, y: 80, dur: 6.2 },
  { label: "Zig",        color: "#00ff88", x: 70, y: 82, dur: 7.6 },
]

/* ─────────────────────────────────────────────────────── tilt hook */
function useTilt(str = 10) {
  const ref = useRef<HTMLDivElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)
  const rx  = useTransform(my, [-0.5, 0.5], [ str, -str])
  const ry  = useTransform(mx, [-0.5, 0.5], [-str,  str])
  const srx = useSpring(rx, { stiffness: 160, damping: 20 })
  const sry = useSpring(ry, { stiffness: 160, damping: 20 })
  const gz  = useTransform(
    [mx, my] as [typeof mx, typeof my],
    ([lx, ly]: [number, number]) => `radial-gradient(circle at ${(lx + 0.5) * 100}% ${(ly + 0.5) * 100}%, rgba(0,212,255,0.07) 0%, transparent 70%)`
  )
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width  - 0.5)
    my.set((e.clientY - r.top)  / r.height - 0.5)
  }
  const leave = () => { mx.set(0); my.set(0) }
  return { ref, srx, sry, gz, move, leave }
}

/* ─────────────────────────────────────────────────────── stagger variants */
const ctnr = { hidden: {}, visible: { transition: { staggerChildren: 0.065, delayChildren: 0.12 } } }
const itm  = {
  hidden:  { opacity: 0, y: 22, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)",
    transition: { type: "spring", stiffness: 280, damping: 24 } },
}

/* ─────────────────────────────────────────────────────── social button */
function SocialBtn({ icon, label, color }: { icon: React.ReactNode; label: string; color?: string }) {
  const mx = useMotionValue(0); const my = useMotionValue(0)
  const bg = useTransform([mx, my] as [typeof mx, typeof my],
    ([lx, ly]: [number, number]) =>
      `radial-gradient(circle at ${(lx + 0.5) * 100}% ${(ly + 0.5) * 100}%, rgba(255,255,255,0.05) 0%, transparent 80%)`)
  return (
    <motion.button
      type="button"
      className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-[#94a3b8] text-sm font-medium overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: bg as unknown as string }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      whileHover={{ borderColor: color ?? "rgba(255,255,255,0.2)", y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={sp}
      aria-label={label}
    >
      {/* shimmer sweep */}
      <motion.div
        className="absolute inset-0 -translate-x-full pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }}
        whileHover={{ translateX: "100%" }}
        transition={{ duration: 0.55 }}
        aria-hidden="true"
      />
      {icon}
      <span className="relative z-10">{label}</span>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────── animated input */
function InputField({
  id, label, type, value, onChange, placeholder, focused, onFocus, onBlur,
  accentColor = "#00d4ff", children, error,
}: {
  id: string; label: string; type: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string; focused: boolean; onFocus: () => void; onBlur: () => void
  accentColor?: string; children?: React.ReactNode; error?: boolean
}) {
  return (
    <motion.div variants={itm} className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: focused ? accentColor : "#475569" }}>
        {label}
      </label>
      <motion.div
        className="relative"
        animate={{ filter: focused ? `drop-shadow(0 0 12px ${accentColor}28)` : "none" }}
        transition={{ duration: 0.22 }}
      >
        <motion.input
          id={id} type={type} value={value} required
          onChange={onChange} onFocus={onFocus} onBlur={onBlur}
          placeholder={placeholder}
          className="w-full rounded-xl px-4 py-3.5 text-sm text-[#e2e8f0] placeholder-[#1e293b] outline-none pr-11"
          style={{ background: "rgba(8,11,18,0.9)", backdropFilter: "blur(8px)" }}
          animate={{
            borderColor: error ? "#ef4444" : focused ? accentColor : "rgba(255,255,255,0.07)",
            boxShadow: error
              ? "0 0 0 2px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.03)"
              : focused
              ? `0 0 0 3px ${accentColor}1a, inset 0 1px 0 rgba(255,255,255,0.05)`
              : "inset 0 1px 0 rgba(255,255,255,0.02)",
            border: "1px solid transparent",
          }}
          transition={{ duration: 0.18 }}
          aria-label={label}
        />
        {children && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">{children}</div>
        )}
        {/* focus line sweep */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] rounded-full origin-left pointer-events-none"
          style={{ background: error ? "#ef4444" : accentColor }}
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          aria-hidden="true"
        />
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────── orbit decorations */
function OrbitRing({ size, dur, delay, color, dashes = "6 5" }: {
  size: number; dur: number; delay: number; color: string; dashes?: string
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ width: size, height: size, top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", opacity: 0.18 }}
      animate={{ rotate: 360 }}
      transition={{ duration: dur, repeat: Infinity, ease: "linear", delay }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="none" stroke={color}
          strokeWidth="0.6" strokeDasharray={dashes} />
        <circle cx="50" cy="2" r="2.5" fill={color} />
      </svg>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────── main page */
export default function LoginPage() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [showPass, setShowPass] = useState(false)
  const [focused,  setFocused]  = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)
  const tilt = useTilt(9)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/login", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Sign in failed. Please try again.")
      } else {
        /* Persist session to localStorage as fallback for the dashboard layout */
        if (typeof window !== "undefined") {
          localStorage.setItem("omni_user", JSON.stringify(data.user))
        }
        setSuccess(true)
        await new Promise(r => setTimeout(r, 900))
        window.location.replace("/dashboard")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020407] flex overflow-hidden">

      {/* ══ LEFT — visual world ══════════════════════════════════════ */}
      <motion.div
        className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* deep radial bg */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 70% at 50% 45%, rgba(0,212,255,0.055) 0%, rgba(168,85,247,0.025) 40%, transparent 70%), #020407" }}
          aria-hidden="true"
        />

        {/* particle canvas */}
        <ParticleCanvas />

        {/* grid */}
        <div className="absolute inset-0 omni-grid opacity-[0.15] pointer-events-none" aria-hidden="true" />

        {/* orbit rings */}
        {[
          { size: 520, dur: 38, delay: 0,   color: "#00d4ff", dashes: "8 12" },
          { size: 390, dur: 25, delay: -8,  color: "#00ff88", dashes: "5 9" },
          { size: 270, dur: 18, delay: -4,  color: "#a855f7", dashes: "3 7" },
          { size: 160, dur: 12, delay: -2,  color: "#f59e0b", dashes: "2 5" },
        ].map((o, i) => <OrbitRing key={i} {...o} />)}

        {/* floating language chips */}
        {LANGS.map((l, i) => (
          <motion.div
            key={l.label}
            className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold border backdrop-blur-md"
            style={{ left: `${l.x}%`, top: `${l.y}%`, color: l.color,
              borderColor: `${l.color}28`, background: `${l.color}0a` }}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{
              opacity: [0.5, 0.85, 0.5],
              y: [0, -10, 0],
              scale: [0.97, 1.03, 0.97],
            }}
            transition={{ duration: l.dur, delay: 0.4 + i * 0.18, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: l.color }} aria-hidden="true" />
            {l.label}
          </motion.div>
        ))}

        {/* ambient orbs */}
        {[
          { color: "rgba(0,212,255,0.07)",  sz: 480, x: "38%", y: "42%", dur: 9 },
          { color: "rgba(168,85,247,0.05)", sz: 360, x: "62%", y: "58%", dur: 13 },
          { color: "rgba(0,255,136,0.04)",  sz: 280, x: "28%", y: "72%", dur: 10 },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{ width: o.sz, height: o.sz, left: o.x, top: o.y,
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.18, 1], x: [0, 18, 0], y: [0, -14, 0] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
            aria-hidden="true"
          />
        ))}

        {/* center hero content */}
        <div className="relative z-10 text-center px-14 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 18 }}
            className="mb-10"
          >
            <OmniLogo size={96} />
          </motion.div>

          {/* animated headline */}
          <motion.h1
            className="text-[2.8rem] font-black text-[#e2e8f0] mb-4 leading-[1.08] tracking-tight"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 240, damping: 22 }}
          >
            15 Languages.{" "}
            <motion.span
              className="block"
              style={{
                background: "linear-gradient(135deg, #00d4ff 0%, #00ff88 40%, #a855f7 80%, #00d4ff 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              1 Universal AST.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-[#475569] text-[0.9rem] leading-relaxed mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 220, damping: 22 }}
          >
            The world&apos;s first truly polylingual framework. Rust, Go, Python,
            TypeScript — all in a single{" "}
            <code className="text-[#00d4ff] bg-[#00d4ff]/[0.09] px-1.5 py-0.5 rounded font-mono text-xs">.omni</code>{" "}
            file. Zero FFI overhead.
          </motion.p>

          {/* feature pills */}
          <motion.div
            className="flex flex-wrap gap-2 justify-center mb-10"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.055, delayChildren: 0.75 } } }}
          >
            {["Zero FFI", "LLVM-Omni", "UAST bridge", "Unikernel", "<10ms cold"].map(f => (
              <motion.span
                key={f}
                className="px-3 py-1.5 rounded-full text-[11px] font-mono border border-white/[0.07] text-[#475569] hover:text-[#00d4ff] hover:border-[#00d4ff]/30 transition-colors cursor-default"
                variants={{
                  hidden:  { opacity: 0, scale: 0.65, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 22 } },
                }}
              >
                {f}
              </motion.span>
            ))}
          </motion.div>

          {/* stats row */}
          <motion.div
            className="flex items-center gap-8 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            {[{ val: "15", lbl: "Languages" }, { val: "540+", lbl: "Packages" }, { val: "<10ms", lbl: "Cold start" }].map((s, i) => (
              <motion.div
                key={s.lbl}
                className="text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15 + i * 0.08, type: "spring", stiffness: 280, damping: 22 }}
              >
                <div className="text-[#00d4ff] font-black text-xl"
                  style={{ textShadow: "0 0 20px rgba(0,212,255,0.5)" }}>{s.val}</div>
                <div className="text-[#334155] text-[10px] font-mono mt-0.5">{s.lbl}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* bottom attestation */}
        <motion.div
          className="absolute bottom-7 left-0 right-0 flex items-center justify-center gap-1.5 text-[11px] text-[#1e293b] font-mono"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            aria-hidden="true"
          />
          Open source · MIT License · v2.0.0
        </motion.div>
      </motion.div>

      {/* vertical divider */}
      <motion.div
        className="hidden lg:block w-px flex-shrink-0"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 30%, rgba(0,212,255,0.08) 50%, rgba(255,255,255,0.06) 70%, transparent)" }}
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        aria-hidden="true"
      />

      {/* ══ RIGHT — form ══════════════════════════════════════════════ */}
      <motion.div
        className="flex-1 lg:max-w-[500px] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* right panel bg */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 65% 55% at 55% 35%, rgba(0,212,255,0.035) 0%, transparent 65%), #020407" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 omni-grid opacity-20 pointer-events-none" aria-hidden="true" />

        {/* scan lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i} className="absolute h-px w-full pointer-events-none"
            style={{ top: `${18 + i * 17}%`, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.04), transparent)" }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 8 + i * 0.7, repeat: Infinity, ease: "linear", delay: i * 1.1 }}
            aria-hidden="true"
          />
        ))}

        <div className="w-full max-w-[380px] relative z-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success"
                className="flex flex-col items-center justify-center text-center py-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
              >
                {/* success rings */}
                {[120, 80, 48].map((sz, i) => (
                  <motion.div
                    key={sz} className="absolute rounded-full border"
                    style={{ width: sz, height: sz, borderColor: `rgba(0,255,136,${0.3 - i * 0.08})` }}
                    animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.2, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                    aria-hidden="true"
                  />
                ))}
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative z-10"
                  style={{ background: "rgba(0,255,136,0.1)", border: "2px solid rgba(0,255,136,0.4)" }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  <motion.svg className="w-9 h-9 text-[#00ff88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                    <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }} />
                  </motion.svg>
                </motion.div>
                <motion.h2 className="text-2xl font-black text-[#e2e8f0] mb-2"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 22 }}>
                  Welcome back!
                </motion.h2>
                <motion.p className="text-[#64748b] text-sm mb-1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                  Redirecting to your workspace…
                </motion.p>
                <motion.div className="flex gap-1 mt-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                  aria-hidden="true">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="form" variants={ctnr} initial="hidden" animate="visible">

                {/* back link */}
                <motion.div variants={itm} className="mb-8">
                  <Link href="/" className="inline-flex items-center gap-2 group" aria-label="Back to home">
                    <motion.div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.07]"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                      whileHover={{ borderColor: "rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.06)", x: -2 }}
                      transition={sp}
                    >
                      <svg className="w-3.5 h-3.5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                    </motion.div>
                    <motion.span
                      className="text-[#334155] text-xs font-mono"
                      whileHover={{ color: "#94a3b8" }}
                      transition={{ duration: 0.14 }}
                    >
                      Back to OMNI
                    </motion.span>
                  </Link>
                </motion.div>

                {/* header */}
                <motion.div variants={itm} className="mb-7">
                  <h1 className="text-[1.75rem] font-black text-[#e2e8f0] mb-1.5 tracking-tight">
                    Sign in
                  </h1>
                  <p className="text-[#475569] text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/register"
                      className="text-[#00d4ff] font-semibold hover:text-[#22e0ff] transition-colors">
                      Create one free
                    </Link>
                  </p>
                </motion.div>

                {/* social buttons */}
                <motion.div variants={itm} className="flex flex-col gap-2.5 mb-6">
                  <SocialBtn color="rgba(66,133,244,0.35)"
                    label="Continue with Google"
                    icon={
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    }
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <SocialBtn color="rgba(255,255,255,0.2)"
                      label="GitHub"
                      icon={
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      }
                    />
                    <SocialBtn color="rgba(0,122,255,0.3)"
                      label="Apple"
                      icon={
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                      }
                    />
                  </div>
                </motion.div>

                {/* divider */}
                <motion.div variants={itm} className="flex items-center gap-3 mb-6" aria-hidden="true">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[#1e293b] text-xs font-mono">or continue with email</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </motion.div>

                {/* 3D tilt glassmorphism card */}
                <motion.div
                  ref={tilt.ref}
                  variants={itm}
                  onMouseMove={tilt.move}
                  onMouseLeave={tilt.leave}
                  style={{
                    rotateX: tilt.srx,
                    rotateY: tilt.sry,
                    transformStyle: "preserve-3d",
                  }}
                  className="relative rounded-2xl overflow-hidden"
                  animate={{
                    boxShadow: [
                      "0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.5)",
                      "0 0 0 1px rgba(0,212,255,0.1), 0 28px 72px rgba(0,0,0,0.6)",
                      "0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.5)",
                    ],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* glass bg */}
                  <div className="absolute inset-0 rounded-2xl"
                    style={{ background: "rgba(13,17,23,0.85)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
                    aria-hidden="true"
                  />

                  {/* glare overlay from tilt */}
                  <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: tilt.gz as unknown as string, opacity: 0.7 }}
                    aria-hidden="true"
                  />

                  {/* rotating conic border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: "conic-gradient(from 0deg, transparent 65%, rgba(0,212,255,0.7) 78%, rgba(168,85,247,0.55) 88%, rgba(0,255,136,0.5) 94%, transparent 100%)",
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    aria-hidden="true"
                  />

                  {/* form contents */}
                  <div className="relative z-10 p-7">
                    <form onSubmit={handleSubmit}>
                      <div className="flex flex-col gap-4 mb-5">
                        <InputField
                          id="email" label="Email address" type="email"
                          value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@omni.dev"
                          focused={focused === "email"}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                        />

                        <InputField
                          id="password" label="Password" type={showPass ? "text" : "password"}
                          value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••••"
                          focused={focused === "password"}
                          onFocus={() => setFocused("password")}
                          onBlur={() => setFocused(null)}
                          error={!!error}
                        >
                          <motion.button
                            type="button"
                            onClick={() => setShowPass(s => !s)}
                            className="text-[#334155] hover:text-[#64748b]"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            transition={sp}
                            aria-label={showPass ? "Hide password" : "Show password"}
                          >
                            <AnimatePresence mode="wait">
                              {showPass ? (
                                <motion.svg key="hide" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                                  initial={{ opacity: 0, rotate: -10, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 10, scale: 0.8 }}
                                  transition={{ duration: 0.18 }} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </motion.svg>
                              ) : (
                                <motion.svg key="show" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                                  initial={{ opacity: 0, rotate: 10, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: -10, scale: 0.8 }}
                                  transition={{ duration: 0.18 }} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </InputField>
                      </div>

                      {/* remember + forgot */}
                      <div className="flex items-center justify-between mb-5">
                        <label className="flex items-center gap-2.5 cursor-pointer group" htmlFor="remember">
                          <div className="relative">
                            <input id="remember" type="checkbox" className="sr-only" />
                            <motion.div
                              className="w-4 h-4 rounded border flex items-center justify-center"
                              style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}
                              whileHover={{ borderColor: "rgba(0,212,255,0.5)", background: "rgba(0,212,255,0.06)" }}
                              transition={sp}
                            />
                          </div>
                          <span className="text-xs text-[#475569] group-hover:text-[#64748b] transition-colors">Remember me</span>
                        </label>
                        <motion.a href="#" className="text-xs text-[#334155] hover:text-[#00d4ff] font-mono transition-colors"
                          whileHover={{ x: 1 }} transition={sp}>
                          Forgot password?
                        </motion.a>
                      </div>

                      {/* error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 text-xs text-[#ef4444]"
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 320, damping: 26 }}
                            role="alert"
                          >
                            <motion.svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                              animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </motion.svg>
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* submit */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="relative w-full py-3.5 rounded-xl font-bold text-sm overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)", color: "#020407" }}
                        whileHover={loading ? {} : {
                          scale: 1.02,
                          boxShadow: "0 0 40px rgba(0,212,255,0.45), 0 8px 20px rgba(0,0,0,0.3)",
                        }}
                        whileTap={loading ? {} : { scale: 0.97 }}
                        transition={sp}
                        aria-label="Sign in"
                      >
                        {/* shimmer */}
                        <motion.div
                          className="absolute inset-0 -translate-x-full pointer-events-none"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }}
                          whileHover={loading ? {} : { translateX: "100%" }}
                          transition={{ duration: 0.5 }}
                          aria-hidden="true"
                        />
                        <AnimatePresence mode="wait">
                          {loading ? (
                            <motion.span key="loading" className="relative z-10 flex items-center justify-center gap-2.5"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                              <motion.div className="w-4 h-4 rounded-full border-2 border-[#020407]/30 border-t-[#020407]"
                                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                aria-hidden="true" />
                              Authenticating…
                            </motion.span>
                          ) : (
                            <motion.span key="idle" className="relative z-10 flex items-center justify-center gap-2"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                              Sign in
                              <motion.svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                                animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                              </motion.svg>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </form>
                  </div>
                </motion.div>



              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
