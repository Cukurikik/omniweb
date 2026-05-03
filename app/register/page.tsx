"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring,
} from "motion/react"
import { OmniLogo } from "@/components/omni-nav"

/* ─── constants ─────────────────────────────────────────── */
const sp = { type: "spring", stiffness: 340, damping: 26 } as const

function strengthOf(p: string): { score: number; label: string; color: string } {
  if (!p)            return { score: 0, label: "",        color: "transparent" }
  if (p.length < 5)  return { score: 1, label: "Weak",   color: "#ef4444" }
  if (p.length < 8)  return { score: 2, label: "Fair",   color: "#f59e0b" }
  if (p.length < 12 || !/[^a-zA-Z0-9]/.test(p)) return { score: 3, label: "Good", color: "#00d4ff" }
  return { score: 4, label: "Strong", color: "#00ff88" }
}

/* ─── particle canvas ───────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    let W = canvas.width = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    window.addEventListener("resize", onResize)

    interface P { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number; life: number; maxLife: number }
    const COLORS = ["rgba(0,255,136,", "rgba(0,212,255,", "rgba(168,85,247,"]
    const pts: P[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      r: 0.7 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.15 + Math.random() * 0.5,
      life: Math.random() * 200, maxLife: 200 + Math.random() * 100,
    }))

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.life++
        if (p.life > p.maxLife) { p.x = Math.random() * W; p.y = Math.random() * H; p.life = 0 }
        p.x = p.x < 0 ? W : p.x > W ? 0 : p.x
        p.y = p.y < 0 ? H : p.y > H ? 0 : p.y
        const fade = Math.sin((p.life / p.maxLife) * Math.PI)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${(p.alpha * fade).toFixed(2)})`;  ctx.fill()
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < 75) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(0,255,136,${(0.06 * (1 - d / 75)).toFixed(3)})`
            ctx.lineWidth = 0.4; ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}

/* ─── tilt hook ─────────────────────────────────────────── */
function useTilt(str = 9) {
  const ref = useRef<HTMLDivElement>(null)
  const mx  = useMotionValue(0); const my = useMotionValue(0)
  const rx  = useTransform(my, [-0.5, 0.5], [ str, -str])
  const ry  = useTransform(mx, [-0.5, 0.5], [-str,  str])
  const srx = useSpring(rx, { stiffness: 160, damping: 20 })
  const sry = useSpring(ry, { stiffness: 160, damping: 20 })
  const gz  = useTransform([mx, my] as any,
    ([lx, ly]: [number, number]) =>
      `radial-gradient(circle at ${(lx + 0.5) * 100}% ${(ly + 0.5) * 100}%, rgba(0,255,136,0.06) 0%, transparent 70%)`)
  const move  = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => { mx.set(0); my.set(0) }
  return { ref, srx, sry, gz, move, leave }
}

/* ─── stagger variants ──────────────────────────────────── */
const ctnr = { hidden: {}, visible: { transition: { staggerChildren: 0.065, delayChildren: 0.1 } } }
const itm  = {
  hidden:  { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { type: "spring", stiffness: 280, damping: 24 } },
}

/* ─── step indicator ────────────────────────────────────── */
function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0 mb-7">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <motion.div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black"
              animate={{
                borderColor: i < current ? "#00ff88" : i === current ? "#00d4ff" : "rgba(255,255,255,0.1)",
                background:  i < current ? "rgba(0,255,136,0.12)" : i === current ? "rgba(0,212,255,0.1)" : "transparent",
                scale: i === current ? 1.12 : 1,
                boxShadow: i === current ? "0 0 14px rgba(0,212,255,0.35)" : "none",
              }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
            >
              <AnimatePresence mode="wait">
                {i < current ? (
                  <motion.svg key="check" className="w-3 h-3 text-[#00ff88]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"
                    initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <motion.span key="num"
                    className="text-[9px] font-black"
                    style={{ color: i === current ? "#00d4ff" : "#334155" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {i + 1}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            <span className="text-[9px] font-mono mt-1 transition-colors"
              style={{ color: i === current ? "#00d4ff" : i < current ? "#00ff88" : "#1e293b" }}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <motion.div
              className="flex-1 h-px mx-2 mb-4 origin-left"
              animate={{
                scaleX: i < current ? 1 : 0.2,
                background: i < current ? "#00ff88" : "rgba(255,255,255,0.06)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── form input ─────────────────────────────────────────── */
function FormInput({
  id, label, type, value, onChange, placeholder, focused, onFocus, onBlur,
  hint, error, children,
}: {
  id: string; label: string; type: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string; focused: boolean; onFocus: () => void; onBlur: () => void
  hint?: string; error?: boolean; children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold tracking-wider uppercase"
          style={{ color: focused ? "#00ff88" : "#475569" }}>
          {label}
        </label>
        {hint && <span className="text-[10px] text-[#1e293b] font-mono">{hint}</span>}
      </div>
      <motion.div
        className="relative"
        animate={{ filter: focused ? "drop-shadow(0 0 12px rgba(0,255,136,0.22))" : "none" }}
        transition={{ duration: 0.2 }}
      >
        <motion.input
          id={id} type={type} value={value} required
          onChange={onChange} onFocus={onFocus} onBlur={onBlur}
          placeholder={placeholder}
          className="w-full rounded-xl px-4 py-3.5 text-sm text-[#e2e8f0] placeholder-[#1e293b] outline-none pr-11"
          style={{ background: "rgba(8,11,18,0.9)", backdropFilter: "blur(8px)" }}
          animate={{
            border: "1px solid transparent",
            borderColor: error ? "#ef4444" : focused ? "#00ff88" : "rgba(255,255,255,0.07)",
            boxShadow: error
              ? "0 0 0 2px rgba(239,68,68,0.15), inset 0 1px 0 rgba(255,255,255,0.03)"
              : focused
              ? "0 0 0 3px rgba(0,255,136,0.12), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "inset 0 1px 0 rgba(255,255,255,0.02)",
          }}
          transition={{ duration: 0.18 }}
          aria-label={label}
        />
        {children && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">{children}</div>}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] rounded-full origin-left pointer-events-none"
          style={{ background: error ? "#ef4444" : "#00ff88" }}
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  )
}

/* ─── success screen ─────────────────────────────────────── */
function SuccessScreen({ name }: { name: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-12 px-4 relative"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      {/* concentric rings */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ width: 130 - i * 25, height: 130 - i * 25,
            borderColor: `rgba(0,255,136,${0.35 - i * 0.1})` }}
          animate={{ scale: [1, 1.5 + i * 0.2], opacity: [0.7, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.35, ease: "easeOut" }}
          aria-hidden="true"
        />
      ))}

      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-7 relative z-10"
        style={{ background: "rgba(0,255,136,0.1)", border: "2px solid rgba(0,255,136,0.4)" }}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <motion.svg className="w-9 h-9 text-[#00ff88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
          <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }} />
        </motion.svg>
      </motion.div>

      <motion.h2 className="text-2xl font-black text-[#e2e8f0] mb-2"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 22 }}>
        Welcome, <span className="text-[#00ff88]">{name}</span>!
      </motion.h2>

      <motion.p className="text-[#64748b] text-sm leading-relaxed mb-8 max-w-xs"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, type: "spring", stiffness: 240, damping: 22 }}>
        Account created. Check your inbox to verify your email address.
      </motion.p>

      <motion.a href="/dashboard"
        className="relative overflow-hidden inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-[#020407]"
        style={{ background: "linear-gradient(135deg, #00ff88, #00d4ff)" }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, type: "spring", stiffness: 240, damping: 22 }}
        whileHover={{ scale: 1.04, boxShadow: "0 0 36px rgba(0,255,136,0.45)" }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
          whileHover={{ translateX: "100%" }} transition={{ duration: 0.48 }} aria-hidden="true" />
        <span className="relative z-10">Go to Dashboard</span>
        <motion.svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </motion.svg>
      </motion.a>
    </motion.div>
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function RegisterPage() {
  const [form,     setForm]    = useState({ name: "", email: "", password: "", confirm: "" })
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState("")
  const [success,  setSuccess] = useState(false)
  const [showPass, setShowPass]= useState(false)
  const [showConf, setShowConf]= useState(false)
  const [focused,  setFocused] = useState<string | null>(null)
  const tilt = useTilt(8)

  const update = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("")
    if (!form.name.trim()) { setError("Please enter your full name."); return }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return }
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/register", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.")
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("omni_user", JSON.stringify(data.user))
        }
        setSuccess(true)
        await new Promise(r => setTimeout(r, 1200))
        window.location.replace("/dashboard")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const pw   = strengthOf(form.password)
  const step = form.name && form.email
    ? (form.password.length >= 8 ? (form.confirm === form.password ? 3 : 2) : 1)
    : 0

  const eyeBtn = (show: boolean, toggle: () => void, label: string) => (
    <motion.button type="button" onClick={toggle}
      className="text-[#334155] hover:text-[#64748b]"
      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} transition={sp}
      aria-label={label}>
      <AnimatePresence mode="wait">
        {show ? (
          <motion.svg key="hide" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            initial={{ opacity: 0, rotate: -10, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </motion.svg>
        ) : (
          <motion.svg key="show" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            initial={{ opacity: 0, rotate: 10, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  )

  return (
    <div className="min-h-screen bg-[#020407] flex overflow-hidden">

      {/* ══ LEFT — visual world ══ */}
      <motion.div
        className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 70% at 50% 45%, rgba(0,255,136,0.055) 0%, rgba(0,212,255,0.025) 40%, transparent 70%), #020407" }}
          aria-hidden="true" />
        <ParticleCanvas />
        <div className="absolute inset-0 omni-grid opacity-[0.14] pointer-events-none" aria-hidden="true" />

        {/* rotating rings */}
        {[
          { sz: 520, dur: 42, delay: 0,   color: "#00ff88", d: "8 14" },
          { sz: 390, dur: 28, delay: -10, color: "#00d4ff", d: "5 10" },
          { sz: 270, dur: 20, delay: -5,  color: "#a855f7", d: "3 7" },
          { sz: 160, dur: 14, delay: -2,  color: "#f59e0b", d: "2 5" },
        ].map((o, i) => (
          <motion.div key={i} className="absolute pointer-events-none"
            style={{ width: o.sz, height: o.sz, top: "50%", left: "50%",
              transform: "translate(-50%,-50%)", opacity: 0.14 }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: o.dur, repeat: Infinity, ease: "linear", delay: o.delay }}
            aria-hidden="true">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="none" stroke={o.color} strokeWidth="0.6" strokeDasharray={o.d} />
              <circle cx="50" cy="2" r="2.8" fill={o.color} />
            </svg>
          </motion.div>
        ))}

        {/* ambient orbs */}
        {[
          { color: "rgba(0,255,136,0.065)", sz: 480, x: "40%", y: "42%", dur: 10 },
          { color: "rgba(0,212,255,0.045)", sz: 340, x: "62%", y: "60%", dur: 14 },
          { color: "rgba(168,85,247,0.04)", sz: 260, x: "25%", y: "70%", dur: 8 },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{ width: o.sz, height: o.sz, left: o.x, top: o.y,
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.2, 1], x: [0, -16, 0], y: [0, 18, 0] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
            aria-hidden="true" />
        ))}

        {/* center content */}
        <div className="relative z-10 text-center px-14 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 18 }}
            className="mb-10"
          >
            <OmniLogo size={96} />
          </motion.div>

          <motion.h1 className="text-[2.8rem] font-black text-[#e2e8f0] mb-4 leading-[1.08] tracking-tight"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 240, damping: 22 }}>
            Join the{" "}
            <motion.span
              className="block"
              style={{
                background: "linear-gradient(135deg, #00ff88 0%, #00d4ff 40%, #a855f7 80%, #00ff88 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              revolution.
            </motion.span>
          </motion.h1>

          <motion.p className="text-[#475569] text-[0.9rem] leading-relaxed mb-10"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 220, damping: 22 }}>
            The world&apos;s first polylingual framework — Rust, Go, Python, TypeScript in a single file.
            No glue code. Native performance.
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 text-left"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.65 } } }}
          >
            {[
              { icon: "◈", color: "#00d4ff", text: "Universal AST — zero FFI across all 15 languages" },
              { icon: "⬡", color: "#00ff88", text: "LLVM-Omni backend — whole-program optimization" },
              { icon: "◉", color: "#a855f7", text: "OMNI-NEXUS — 540+ packages from npm, Cargo, PyPI" },
              { icon: "⬢", color: "#f59e0b", text: "Unikernel deploy — 3–8 MB images, <10ms cold start" },
            ].map(f => (
              <motion.div key={f.text}
                className="flex items-start gap-3 text-sm"
                variants={{ hidden: { opacity: 0, x: -18 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } }}>
                <motion.span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: `${f.color}14`, color: f.color, border: `1px solid ${f.color}22` }}
                  whileHover={{ scale: 1.18, rotate: 8 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  {f.icon}
                </motion.span>
                <span className="text-[#64748b] leading-snug">{f.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* divider */}
      <motion.div className="hidden lg:block w-px flex-shrink-0"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(0,255,136,0.07) 30%, rgba(0,255,136,0.1) 50%, rgba(0,255,136,0.07) 70%, transparent)" }}
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.3 }} aria-hidden="true" />

      {/* ══ RIGHT — form ══ */}
      <motion.div
        className="flex-1 lg:max-w-[500px] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 65% 55% at 55% 30%, rgba(0,255,136,0.032) 0%, transparent 65%), #020407" }}
          aria-hidden="true" />
        <div className="absolute inset-0 omni-grid opacity-20 pointer-events-none" aria-hidden="true" />
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i} className="absolute h-px w-full pointer-events-none"
            style={{ top: `${20 + i * 18}%`, background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.04), transparent)" }}
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 9 + i * 0.8, repeat: Infinity, ease: "linear", delay: i * 1.3 }}
            aria-hidden="true" />
        ))}

        <div className="w-full max-w-[380px] relative z-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SuccessScreen name={form.name.split(" ")[0] || "Developer"} />
              </motion.div>
            ) : (
              <motion.div key="form" variants={ctnr as any} initial="hidden" animate="visible">

                {/* back */}
                <motion.div variants={itm as any} className="mb-8">
                  <Link href="/" className="inline-flex items-center gap-2 group" aria-label="Back to home">
                    <motion.div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.07]"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                      whileHover={{ borderColor: "rgba(0,255,136,0.35)", background: "rgba(0,255,136,0.06)", x: -2 }}
                      transition={sp}>
                      <svg className="w-3.5 h-3.5 text-[#475569]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                    </motion.div>
                    <motion.span className="text-[#334155] text-xs font-mono"
                      whileHover={{ color: "#94a3b8" }} transition={{ duration: 0.14 }}>
                      Back to OMNI
                    </motion.span>
                  </Link>
                </motion.div>

                {/* header */}
                <motion.div variants={itm as any} className="mb-7">
                  <h1 className="text-[1.75rem] font-black text-[#e2e8f0] mb-1.5 tracking-tight">
                    Create account
                  </h1>
                  <p className="text-[#475569] text-sm">
                    Already have one?{" "}
                    <Link href="/login" className="text-[#00ff88] font-semibold hover:text-[#22ffaa] transition-colors">
                      Sign in
                    </Link>
                  </p>
                </motion.div>

                {/* step bar */}
                <motion.div variants={itm as any}>
                  <StepBar steps={["Info", "Password", "Confirm"]} current={step} />
                </motion.div>

                {/* 3D tilt glass card */}
                <motion.div
                  ref={tilt.ref}
                  variants={itm as any}
                  onMouseMove={tilt.move}
                  onMouseLeave={tilt.leave}
                  style={{ rotateX: tilt.srx, rotateY: tilt.sry, transformStyle: "preserve-3d" }}
                  className="relative rounded-2xl overflow-hidden"
                  animate={{
                    boxShadow: [
                      "0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.5)",
                      "0 0 0 1px rgba(0,255,136,0.1), 0 28px 72px rgba(0,0,0,0.6)",
                      "0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.5)",
                    ],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* glass bg */}
                  <div className="absolute inset-0 rounded-2xl"
                    style={{ background: "rgba(13,17,23,0.85)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
                    aria-hidden="true" />

                  {/* glare */}
                  <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: tilt.gz as unknown as string, opacity: 0.7 }}
                    aria-hidden="true" />

                  {/* rotating border */}
                  <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: "conic-gradient(from 0deg, transparent 65%, rgba(0,255,136,0.7) 78%, rgba(0,212,255,0.55) 88%, rgba(168,85,247,0.45) 94%, transparent 100%)",
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude", WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    aria-hidden="true" />

                  {/* form */}
                  <div className="relative z-10 p-7">
                    <form onSubmit={handleSubmit}>
                      <div className="flex flex-col gap-4 mb-4">

                        {/* name */}
                        <FormInput id="name" label="Full name" type="text"
                          value={form.name} onChange={update("name")} placeholder="Your name"
                          focused={focused === "name"} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />

                        {/* email */}
                        <FormInput id="email" label="Email address" type="email"
                          value={form.email} onChange={update("email")} placeholder="you@omni.dev"
                          focused={focused === "email"} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />

                        {/* password */}
                        <FormInput id="password" label="Password" type={showPass ? "text" : "password"}
                          value={form.password} onChange={update("password")} placeholder="••••••••••"
                          focused={focused === "password"} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                          hint="min. 8 chars">
                          {eyeBtn(showPass, () => setShowPass(s => !s), showPass ? "Hide password" : "Show password")}
                        </FormInput>

                        {/* strength bar */}
                        {form.password && (
                          <motion.div
                            className="flex flex-col gap-1.5"
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 24 }}
                          >
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: pw.color }}
                                animate={{ width: `${(pw.score / 4) * 100}%` }}
                                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                                aria-hidden="true"
                              />
                            </div>
                            {pw.label && (
                              <span className="text-[10px] font-mono" style={{ color: pw.color }}>
                                Strength: {pw.label}
                              </span>
                            )}
                          </motion.div>
                        )}

                        {/* confirm password */}
                        <FormInput id="confirm" label="Confirm password" type={showConf ? "text" : "password"}
                          value={form.confirm} onChange={update("confirm")} placeholder="••••••••••"
                          focused={focused === "confirm"} onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
                          error={!!form.confirm && form.confirm !== form.password}>
                          {eyeBtn(showConf, () => setShowConf(s => !s), showConf ? "Hide confirmation" : "Show confirmation")}
                        </FormInput>

                        {/* match indicator */}
                        <AnimatePresence>
                          {form.confirm && (
                            <motion.div
                              className="flex items-center gap-2 text-xs font-mono"
                              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 24 }}
                            >
                              <motion.div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: form.confirm === form.password ? "#00ff88" : "#ef4444" }}
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ duration: 0.5 }}
                                aria-hidden="true"
                              />
                              <span style={{ color: form.confirm === form.password ? "#00ff88" : "#ef4444" }}>
                                {form.confirm === form.password ? "Passwords match" : "Passwords do not match"}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 text-xs text-[#ef4444]"
                            style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
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

                      {/* terms */}
                      <p className="text-[10px] text-[#334155] font-mono mb-5 leading-relaxed">
                        By creating an account you agree to our{" "}
                        <a href="#" className="text-[#00ff88] hover:underline">Terms</a>
                        {" "}and{" "}
                        <a href="#" className="text-[#00ff88] hover:underline">Privacy Policy</a>.
                      </p>

                      {/* submit */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="relative w-full py-3.5 rounded-xl font-bold text-sm overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #00ff88 0%, #00c870 100%)", color: "#020407" }}
                        whileHover={loading ? {} : {
                          scale: 1.02,
                          boxShadow: "0 0 40px rgba(0,255,136,0.45), 0 8px 20px rgba(0,0,0,0.3)",
                        }}
                        whileTap={loading ? {} : { scale: 0.97 }}
                        transition={sp}
                        aria-label="Create account"
                      >
                        <motion.div
                          className="absolute inset-0 -translate-x-full pointer-events-none"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }}
                          whileHover={loading ? {} : { translateX: "100%" }}
                          transition={{ duration: 0.5 }} aria-hidden="true" />

                        <AnimatePresence mode="wait">
                          {loading ? (
                            <motion.span key="loading" className="relative z-10 flex items-center justify-center gap-2.5"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                              <motion.div className="w-4 h-4 rounded-full border-2 border-[#020407]/30 border-t-[#020407]"
                                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                aria-hidden="true" />
                              Creating account…
                            </motion.span>
                          ) : (
                            <motion.span key="idle" className="relative z-10 flex items-center justify-center gap-2"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                              Create account
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
