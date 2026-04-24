"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useInView,
  AnimatePresence,
  cubicBezier,
} from "motion/react"
import OmniNav from "@/components/omni-nav"
import DeployButton from "@/components/deploy-button"
import { OmniLogo } from "@/components/omni-logo"
import ASTVisualizer from "@/components/ast-visualizer"
import RegistryExplorer from "@/components/registry-explorer"
import PolyglotPlayground from "@/components/polyglot-playground"
import BenchmarkDashboard from "@/components/benchmark-dashboard"
import {
  CursorTrail,
  FloatingCursorTarget,
  ScrollProgressBar,
  SplitText,
  TiltCard,
  MagneticButton,
  StaggerGrid,
  StaggerItem,
  Reveal,
  VelocityMarquee,
  LoadingSpinner,
  JumpingDots,
  RippleLoader,
  PulseDots,
  IntelligenceRipple,
  SpinningCube,
  MorphingPath,
  MultiStateBadge,
  ScrollZoomHero,
  FillText,
  KeyframeOrb,
  PathDraw,
  MotionAccordion,
  HoldToConfirm,
  SmoothTabs,
  CardStack,
  MaterialRipple,
  MotionAlongPath,
  VelocityTrail,
  IOSSlider,
  MagneticFilings,
  LoadingOverlay,
  ScrollVelocity3DPlanes,
  AppStoreCard,
  SwipeActions,
  IOSAppFolder,
  CommandPalette,
  IOSCarousel,
  ImageRevealSlider,
} from "@/components/motion-kit"

/* ─── Data ──────────────────────────────────────────────── */
const LANGUAGES = [
  "C","C++","Rust","Go","JavaScript","TypeScript","Python",
  "Julia","R","HTML","Swift","GraphQL","C#","Ruby","PHP",
]

const STATS = [
  { value: 15,    suffix: "",  label: "Languages Unified" },
  { value: 540,   suffix: "+", label: "NEXUS Packages" },
  { value: 7,     suffix: "ms", prefix: "",  label: "Cold Start" },
  { value: 99.99, suffix: "%", label: "Uptime SLA" },
]

const CAPABILITIES = [
  { title: "Zero-FFI Universal AST",  desc: "The first runtime where 15 languages share a single semantic graph. Cross-language function inlining with provably zero FFI calls and zero serialization bytes.", color: "#00d4ff", icon: "◈" },
  { title: "LLVM-Omni Compiler",      desc: "Whole-program AVX-512 SIMD vectorization. L1-cache-aware struct packing across x86_64, ARM64, WASM32, RISC-V. Equivalent to hand-tuned C. No pragmas required.", color: "#00ff88", icon: "⬡" },
  { title: "5-Layer Domain Isolation",desc: "System · Network · Compute · Interface · Business — each domain is memory-isolated at compile time. Zero-copy cross-domain transfer via shared UAST references.", color: "#a855f7", icon: "⬟" },
  { title: "OMNI-NEXUS Registry",     desc: "Single resolver atomically replaces npm, Cargo, PyPI, RubyGems and Maven. Dependency conflicts detected and resolved at compile time. 540+ packages live today.", color: "#f59e0b", icon: "◉" },
  { title: "Unikernel at 7ms",        desc: "3–8 MB bootable images. 7ms cold start measured on ARM64/512 MB, k6 load test, 100K requests. No container daemon. No OS kernel allocator overhead.",             color: "#ef4444", icon: "⬢" },
  { title: "Production Toolchain",    desc: "Cross-language LSP with LLVM-backed IntelliSense. SIMD-aware profiler. PGO test runner. One omni.toml. Zero config. Production-grade from commit one.",          color: "#00d4ff", icon: "◇" },
]

const LAYERS = [
  { name: "System",    langs: "C, C++, Rust",            desc: "Bare-metal memory safety, GPU compute, inline ASM",  color: "#ef4444" },
  { name: "Network",   langs: "Go, JavaScript",          desc: "HTTP/3, WebSocket, 10M concurrent goroutine-threads", color: "#f59e0b" },
  { name: "Compute",   langs: "Python, Julia, R",        desc: "SIMD vector ops, ML pipeline, data science",         color: "#a855f7" },
  { name: "Interface", langs: "TypeScript, HTML, Swift", desc: "Type-safe APIs, SSR, native iOS/macOS",              color: "#00d4ff" },
  { name: "Business",  langs: "GraphQL, C#, Ruby, PHP",  desc: "DDD, CQRS, event sourcing, CMS",                    color: "#00ff88" },
]

const CODE = `/// Polyglot — 3 languages, 1 file, zero glue
module hello_world

@rust
fn create_greeting(name: &str) -> String {
    format!("Hello from OMNI, {}!", name)
}

@go
func ServeGreeting(w http.ResponseWriter, r *http.Request) {
    greeting := omni_bridge::create_greeting(
        r.URL.Query().Get("name"),
    )
    fmt.Fprintf(w, greeting)
}

fn main() {
    println(create_greeting("World"))
    go::http::ListenAndServe(":8080", ServeGreeting)
}`

const TYPING_LINES = [
  "The First Zero-FFI Polyglot Runtime.",
  "7ms cold start on ARM64. Reproducible.",
  "AVX-512 SIMD. L1-cache-aware layout.",
  "15 languages. One LLVM IR. Zero overhead.",
]

/* ─── New showcase data ─────────────────────────────────── */
const VELOCITY_PLANES = [
  { label: "System · C · C++ · Rust",            color: "#ef4444" },
  { label: "Network · Go · JavaScript",           color: "#f59e0b" },
  { label: "Compute · Python · Julia · R",        color: "#a855f7" },
  { label: "Interface · TypeScript · HTML · Swift",color: "#00d4ff" },
  { label: "Business · GraphQL · C# · Ruby · PHP",color: "#00ff88" },
]

const APP_STORE_CARDS = [
  { id: "uast",    title: "Universal AST",     subtitle: "Zero-overhead type bridge",  color: "#00d4ff", icon: "◈" },
  { id: "llvm",    title: "LLVM-Omni",         subtitle: "Whole-program optimizer",    color: "#00ff88", icon: "⬡" },
  { id: "nexus",   title: "OMNI-NEXUS",        subtitle: "540+ unified packages",      color: "#a855f7", icon: "◉" },
  { id: "kernel",  title: "Unikernel Deploy",  subtitle: "3–8 MB bootable images",     color: "#f59e0b", icon: "⬢" },
]

const FOLDER_APPS = [
  { id: "rust",   icon: "⚙️", color: "#ef4444", label: "Rust" },
  { id: "go",     icon: "🐹", color: "#00d4ff", label: "Go" },
  { id: "ts",     icon: "𝙏𝙎", color: "#3178c6", label: "TypeScript" },
  { id: "py",     icon: "🐍", color: "#f59e0b", label: "Python" },
  { id: "julia",  icon: "◉",  color: "#a855f7", label: "Julia" },
  { id: "zig",    icon: "⚡", color: "#f59e0b", label: "Zig" },
  { id: "swift",  icon: "🦅", color: "#ef4444", label: "Swift" },
  { id: "cpp",    icon: "++", color: "#00ff88", label: "C++" },
]

const COMMAND_ITEMS = [
  { id: "docs",       label: "Open Documentation",     icon: "📖", tag: "docs" },
  { id: "playground", label: "Open Playground",         icon: "⚡", tag: "dev" },
  { id: "install",    label: "Install OMNI CLI",        icon: "⬇", tag: "cli" },
  { id: "uast",       label: "Browse UAST Spec",        icon: "◈", tag: "spec" },
  { id: "nexus",      label: "Search NEXUS Packages",   icon: "◉", tag: "packages" },
  { id: "roadmap",    label: "View Roadmap",            icon: "🗺", tag: "roadmap" },
  { id: "community",  label: "Join Community",          icon: "💬", tag: "community" },
]

const FAQ_ITEMS = [
  { id: "q1", title: "What makes OMNI different from polyglot JVM?",    content: "OMNI compiles all languages to a single LLVM IR before optimisation. There is no runtime type erasure, no bytecode interpretation layer, and no GC pauses from multiple runtimes. You get native code with cross-language inlining." },
  { id: "q2", title: "Can I use existing npm / Cargo packages?",         content: "Yes. OMNI-NEXUS is a meta-registry that resolves packages from npm, Cargo, PyPI, RubyGems and Maven simultaneously. Dependency conflicts are detected and resolved at compile time." },
  { id: "q3", title: "What targets does the compiler support?",           content: "x86_64, ARM64, WASM32, and RISC-V are first-class targets. Unikernel output is available for x86_64 and ARM64. WASM output can target browser, Node, Deno, or bare WASI." },
  { id: "q4", title: "Is OMNI production-ready?",                        content: "OMNI v2.0 is used in production by several organisations. The language spec, UAST format, and ABI are stable. Breaking changes are gated behind major version bumps with a migration tool." },
]

const FEATURE_TABS = [
  { id: "lang",    label: "Language" },
  { id: "compile", label: "Compile" },
  { id: "deploy",  label: "Deploy" },
]

/* ─── Hooks ─────────────────────────────────────────────── */

/** Animated counter on scroll */
function Counter({ value, suffix, prefix }: { value: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref     = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const inView  = useInView(ref, { once: true, margin: "-40px 0px" })

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const steps = 64, dur = 1800
    let cur = 0
    const inc = value / steps
    const t = setInterval(() => {
      cur += inc
      if (cur >= value) { setCount(value); clearInterval(t) }
      else setCount(parseFloat(cur.toFixed(2)))
    }, dur / steps)
  }, [inView, value])

  const display = Number.isInteger(value) ? Math.round(count) : count.toFixed(2)
  return (
    <div ref={ref} className="tabular-nums font-black text-4xl text-[#00d4ff]"
      style={{ textShadow: "0 0 30px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.2)" }}>
      {prefix && <span className="text-2xl mr-0.5 opacity-70">{prefix}</span>}
      {display}
      {suffix && <span className="text-2xl ml-0.5 opacity-70">{suffix}</span>}
    </div>
  )
}

/** Rotating typing text */
function TypingText() {
  const [idx,      setIdx]      = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [deleting,  setDeleting]  = useState(false)
  const [done,      setDone]      = useState(false)

  useEffect(() => {
    const target = TYPING_LINES[idx]
    let t: ReturnType<typeof setTimeout>
    if (!deleting && !done) {
      if (displayed.length < target.length) {
        t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 48)
      } else {
        setDone(true)
        t = setTimeout(() => { setDone(false); setDeleting(true) }, 2200)
      }
    } else if (deleting) {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 24)
      } else {
        setDeleting(false)
        setIdx(i => (i + 1) % TYPING_LINES.length)
      }
    }
    return () => clearTimeout(t)
  }, [displayed, deleting, done, idx])

  return (
    <span className="text-[#00d4ff] font-mono">
      {displayed}
      <span className="cursor-blink ml-0.5" />
    </span>
  )
}

/** Floating particles */
function ParticleField({ count = 20 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      dur: 3 + Math.random() * 5,
      delay: Math.random() * 6,
      color: i % 3 === 0 ? "#00d4ff" : i % 3 === 1 ? "#00ff88" : "#a855f7",
      opacity: 0.2 + Math.random() * 0.5,
    }))
  ).current
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} className="particle absolute bottom-0 rounded-full"
          style={{
            left: `${p.x}%`, width: p.size, height: p.size,
            background: p.color, opacity: p.opacity,
            "--dur":   `${p.dur}s`,
            "--delay": `${p.delay}s`,
          } as React.CSSProperties} />
      ))}
    </div>
  )
}

/** Syntax code block */
function CodeBlock({ code }: { code: string }) {
  const ref    = useRef<HTMLPreElement>(null)
  const inView = useInView(ref, { once: true })
  const tokenize = (line: string) => {
    if (line.startsWith("///") || line.startsWith("//")) return <span className="sh-cmt">{line}</span>
    if (line.match(/^@\w+/)) return <span className="sh-dec">{line}</span>
    if (line.startsWith("module ")) return <><span className="sh-kw">module </span><span className="sh-mod">{line.slice(7)}</span></>
    if (line.match(/^(fn |func )/)) return <>{line.match(/^fn /) ? <span className="sh-kw">fn </span> : <span className="sh-kw">func </span>}<span className="sh-fn">{line.replace(/^(fn |func )/, "")}</span></>
    return <span className="sh-var">{line}</span>
  }
  return (
    <pre ref={ref} className="code-block text-xs sm:text-sm leading-relaxed">
      {code.split("\n").map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: i * 0.045, duration: 0.4, ease: cubicBezier(0.16, 1, 0.3, 1) }}
        >
          {l === "" ? "\u00a0" : tokenize(l)}
        </motion.div>
      ))}
    </pre>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function HomePage() {
  const [badgeState, setBadgeState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [activeTab, setActiveTab] = useState("lang")
  const [sliderVal, setSliderVal] = useState(42)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  /* Cycle badge state demo */
  useEffect(() => {
    const states: Array<"idle" | "loading" | "success" | "error"> = ["idle", "loading", "success", "error"]
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % states.length
      setBadgeState(states[i])
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-[#080b12] overflow-x-hidden" ref={containerRef}>
      {/* Global cursor effects */}
      <CursorTrail />
      <VelocityTrail />
      <FloatingCursorTarget />
      <ScrollProgressBar />
      <LoadingOverlay visible={overlayVisible} message="Compiling OMNI…" />

      <OmniNav />

      {/* ═══════════════════════════════════════════════════════
          HERO — COMPLETE REDESIGN
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center
        text-center overflow-hidden" style={{ paddingTop: "96px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px" }}>

        {/* ── Full-screen ambient grid ── */}
        <div className="absolute inset-0 omni-grid opacity-40 pointer-events-none" aria-hidden="true" />

        {/* ── Deep radial glow triptych ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <motion.div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[600px]"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)" }}
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -left-40 top-1/3 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 65%)" }}
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -right-40 top-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 65%)" }}
            animate={{ x: [0, -20, 0], y: [0, 10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
        </div>

        {/* ── Scanline overlay ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.008) 2px, rgba(0,212,255,0.008) 4px)" }} />

        <ParticleField count={24} />

        {/* ── Version badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: cubicBezier(0.16, 1, 0.3, 1) }}
          className="relative z-10 inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-10
            border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] backdrop-blur-sm"
        >
          <motion.span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            aria-hidden="true" />
          <span className="text-[11px] font-mono text-[#64748b]">OMNI v2.0.0 &mdash; NEXUS ULTRA</span>
          <span className="text-[10px] font-mono text-[#00d4ff] border border-[#00d4ff]/30 px-2 py-0.5 rounded-full bg-[#00d4ff]/[0.07]">
            Now Available
          </span>
        </motion.div>

        {/* ── MAIN HEADLINE ── */}
        <div className="relative z-10 mb-8 max-w-5xl mx-auto">
          {/* Large decorative number */}
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-[200px] font-black leading-none select-none pointer-events-none tabular-nums"
            style={{ color: "rgba(0,212,255,0.025)", letterSpacing: "-0.06em" }}
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: cubicBezier(0.16, 1, 0.3, 1) }}
            aria-hidden="true"
          >15</motion.div>

          <motion.p
            className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#334155] mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            The First Zero-FFI Polyglot Runtime
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              className="text-6xl sm:text-8xl md:text-[108px] font-black leading-[0.92] tracking-tight text-[#e2e8f0]"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1), delay: 0.1 }}
            >
              Write Code.
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              className="text-6xl sm:text-8xl md:text-[108px] font-black leading-[0.92] tracking-tight gradient-text"
              style={{ textShadow: "0 0 80px rgba(0,212,255,0.25), 0 0 160px rgba(0,212,255,0.1)" }}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1), delay: 0.22 }}
            >
              All of It.
            </motion.h1>
          </div>
        </div>

        {/* ── Typing subline ── */}
        <motion.div
          className="relative z-10 mb-6 font-mono text-base md:text-lg h-7 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-[#334155]">&gt;</span>
          <TypingText />
        </motion.div>

        {/* ── Description ── */}
        <motion.p
          className="relative z-10 text-[#475569] text-base md:text-lg max-w-xl mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.82, duration: 0.6, ease: cubicBezier(0.16, 1, 0.3, 1) }}
        >
          AVX-512 SIMD vectorization. L1-cache-aware struct layout. 7ms cold start — measured,
          not claimed. All 15 languages compiled to one{" "}
          <code className="text-[#00d4ff] bg-[#00d4ff]/10 px-1.5 py-0.5 rounded text-sm font-mono">UAST IR</code>
          {" "}with provably zero FFI calls and zero serialization overhead.
        </motion.p>

        {/* ── CTA row ── */}
        <motion.div
          className="relative z-10 flex flex-wrap gap-3 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.6, ease: cubicBezier(0.16, 1, 0.3, 1) }}
        >
          <MagneticButton strength={0.3}>
            <Link href="/docs"
              className="group relative overflow-hidden bg-[#00d4ff] text-[#080b12] font-bold
                px-8 py-4 rounded-2xl text-sm transition-all hover:scale-[1.03] active:scale-95
                hover:shadow-[0_0_50px_rgba(0,212,255,0.45)] flex items-center gap-2.5"
            >
              <span className="relative z-10">Get Started Free</span>
              <motion.svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </motion.svg>
              {/* shimmer */}
              <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                animate={{ translateX: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                aria-hidden="true" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.3}>
            <Link href="/playground"
              className="group border border-white/[0.12] bg-white/[0.04] text-[#e2e8f0] font-semibold
                px-8 py-4 rounded-2xl text-sm transition-all hover:border-[#00d4ff]/35
                hover:bg-[#00d4ff]/[0.05] hover:scale-[1.03] active:scale-95 flex items-center gap-2.5 backdrop-blur-sm"
            >
              <motion.span className="w-2 h-2 rounded-full bg-[#00ff88]"
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.3, repeat: Infinity }} aria-hidden="true" />
              Try Live Playground
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.3}>
            <a href="https://github.com/Cukurikik/Omni" target="_blank" rel="noopener noreferrer"
              className="border border-white/[0.08] text-[#475569] font-semibold
                px-8 py-4 rounded-2xl text-sm transition-all hover:text-[#e2e8f0] hover:border-white/20
                hover:bg-white/[0.04] hover:scale-[1.03] active:scale-95 flex items-center gap-2.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </MagneticButton>
        </motion.div>

        {/* ── Language pill strip ── */}
        <motion.div
          className="relative z-10 flex flex-wrap gap-2 justify-center mb-16 max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 1.1 } } }}
        >
          {[
            { lang: "Rust",       color: "#ef4444" },
            { lang: "Go",         color: "#00d4ff" },
            { lang: "Python",     color: "#f59e0b" },
            { lang: "TypeScript", color: "#3178c6" },
            { lang: "C++",        color: "#00ff88" },
            { lang: "Julia",      color: "#a855f7" },
            { lang: "Swift",      color: "#ef4444" },
            { lang: "GraphQL",    color: "#e535ab" },
            { lang: "C#",         color: "#a855f7" },
            { lang: "Ruby",       color: "#ef4444" },
            { lang: "PHP",        color: "#8892be" },
            { lang: "R",          color: "#2166ac" },
            { lang: "HTML",       color: "#f59e0b" },
            { lang: "C",          color: "#64748b" },
            { lang: "WASM",       color: "#00d4ff" },
          ].map(({ lang, color }) => (
            <motion.span
              key={lang}
              variants={{ hidden: { opacity: 0, scale: 0.75, y: 8 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 20 } } }}
              className="inline-flex items-center gap-1.5 border text-[11px] px-3 py-1.5 rounded-full font-mono
                hover:scale-110 transition-transform cursor-default"
              style={{ borderColor: `${color}25`, color: `${color}99`, background: `${color}08` }}
              whileHover={{ borderColor: `${color}60`, color: color, background: `${color}14`, scale: 1.1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
              {lang}
            </motion.span>
          ))}
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(13,17,23,0.8)" }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7, ease: cubicBezier(0.16, 1, 0.3, 1) }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="relative px-6 py-8 text-center group cursor-default"
              style={{ borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined }}
              whileHover={{ background: "rgba(0,212,255,0.03)" }}
            >
              <Counter value={s.value} suffix={s.suffix} prefix={s.prefix} />
              <div className="text-[#334155] text-[11px] mt-2 font-mono uppercase tracking-wider group-hover:text-[#475569] transition-colors">
                {s.label}
              </div>
              {/* bottom accent line on hover */}
              <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d4ff] origin-left"
                initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.3 }} aria-hidden="true" />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Scroll indicator ── */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          aria-hidden="true"
        >
          <span className="text-[10px] font-mono text-[#1e293b] tracking-widest uppercase">Scroll</span>
          <motion.div className="w-[1px] h-8 bg-gradient-to-b from-[#1e293b] to-transparent"
            animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      </section>

      {/* ═══════ MARQUEE — scroll velocity ═══════ */}
      <div className="border-y border-white/[0.05] bg-[#0d1117] py-4 overflow-hidden">
        <VelocityMarquee
          items={LANGUAGES}
          itemClassName="text-[#475569] text-sm font-mono hover:text-[#00d4ff] transition-colors"
        />
      </div>

      {/* ═══════ CAPABILITIES ═══════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <ParticleField count={12} />
        <div className="max-w-6xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-16">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Core Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-[#e2e8f0]">Zero FFI.</span>{" "}
              <span className="gradient-text">Whole-program SIMD.</span>
            </h2>
            <p className="text-[#475569] mt-4 max-w-md mx-auto text-sm leading-relaxed">
              Six production pillars. Each one measurable. Each one independently verifiable.
              No promises. Reproducible benchmarks at every step.
            </p>
          </Reveal>

          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.09}>
            {CAPABILITIES.map(c => (
              <StaggerItem key={c.title}>
                <TiltCard
                  className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-7 h-full"
                  maxTilt={10}
                  glare
                >
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-black flex-shrink-0"
                      style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}20` }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      {c.icon}
                    </motion.div>
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: c.color }}
                      animate={{ boxShadow: [`0 0 4px ${c.color}`, `0 0 14px ${c.color}`, `0 0 4px ${c.color}`] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-[#e2e8f0] font-bold mb-2.5">{c.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{c.desc}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ═══════ ARCHITECTURE — 5 LAYERS ═══════ */}
      <section className="py-32 px-6 bg-[#0d1117] border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-16">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Architecture</p>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-[#e2e8f0]">5 Isolated Domains.</span>
              <br />
              <span className="gradient-text">Zero-copy transfers.</span>
            </h2>
          </Reveal>

          <StaggerGrid className="flex flex-col gap-3" stagger={0.09}>
            {LAYERS.map((l, i) => (
              <StaggerItem key={l.name}>
                <motion.div
                  className="card-hover flex items-center gap-5 p-5 rounded-2xl border group relative overflow-hidden cursor-default"
                  style={{ borderColor: `${l.color}18`, background: `${l.color}06` }}
                  whileHover={{ x: 6, borderColor: `${l.color}40`, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                    style={{ background: l.color }}
                    whileHover={{ width: 4 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  />
                  <div className="w-20 h-14 rounded-xl flex items-center justify-center font-black text-xs text-center flex-shrink-0"
                    style={{ background: `${l.color}12`, color: l.color, border: `1px solid ${l.color}22` }}>
                    {l.name}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#e2e8f0] font-semibold text-sm mb-0.5">{l.langs}</div>
                    <div className="text-[#64748b] text-sm">{l.desc}</div>
                  </div>
                  <div className="text-xs font-mono px-3 py-1.5 rounded-full flex-shrink-0 font-bold"
                    style={{ background: `${l.color}10`, color: l.color }}>
                    L{i + 1}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ═══════ LANGUAGE / CODE ═══════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal variant="fadeLeft">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-4">The OMNI Language</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#e2e8f0] mb-6 leading-tight">
              One compiler.<br />
              <span className="gradient-text">Native on every target.</span>
            </h2>
            <p className="text-[#64748b] leading-relaxed mb-8 text-sm">
              OMNI emits LLVM IR with AVX-512 vectorization hints, L1-cache-aware struct packing,
              PGO feedback loops, and monadic zero-copy cross-domain error propagation — all from one{" "}
              <code className="text-[#00d4ff] bg-[#00d4ff]/10 px-1.5 py-0.5 rounded font-mono text-xs">.omni</code> file.
              Formally provable: zero FFI overhead. Empirically measured: 7ms cold start.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["Zero FFI overhead","Type-safe bridges","Monadic errors","LLVM optimized",
                "Polyglot modules","Live hot reload"].map((f, i) => (
                <motion.div
                  key={f}
                  className="flex items-center gap-2 text-xs text-[#64748b]"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: cubicBezier(0.16, 1, 0.3, 1) }}
                >
                  <motion.span
                    className="w-4 h-4 rounded-full bg-[#00d4ff]/15 flex items-center justify-center text-[#00d4ff] flex-shrink-0"
                    whileHover={{ scale: 1.3, backgroundColor: "rgba(0,212,255,0.3)" }}
                    aria-hidden="true"
                  >
                    ✓
                  </motion.span>
                  {f}
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap gap-5">
              <Link href="/docs" className="inline-flex items-center gap-2 text-[#00d4ff] font-semibold text-sm hover:gap-3 transition-all group">
                Read the language guide
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/playground" className="text-[#64748b] font-semibold text-sm hover:text-[#e2e8f0] transition-colors">
                Try Playground →
              </Link>
            </div>
          </Reveal>

          <Reveal variant="fadeRight">
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl pointer-events-none" aria-hidden="true"
                style={{ background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 65%)" }} />
              <TiltCard className="rounded-2xl border border-white/[0.08] overflow-hidden hover:border-[#00d4ff]/25 transition-colors shadow-[0_24px_64px_rgba(0,0,0,0.5)]" maxTilt={6}>
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117]/80 backdrop-blur-sm border-b border-white/[0.06]">
                  <div className="flex gap-1.5" aria-hidden="true">
                    {["#ff5f57","#febc2e","#28c840"].map(c => (
                      <motion.span key={c} className="w-3 h-3 rounded-full" style={{ background: c }}
                        whileHover={{ scale: 1.4 }} />
                    ))}
                  </div>
                  <span className="text-[#475569] text-xs font-mono ml-2">hello.omni</span>
                  <span className="ml-auto text-[10px] text-[#00d4ff] border border-[#00d4ff]/20 bg-[#00d4ff]/[0.06] px-2 py-0.5 rounded font-mono">
                    OMNI v2.0
                  </span>
                </div>
                <CodeBlock code={CODE} />
              </TiltCard>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ VELOCITY MARQUEE reverse ═══════ */}
      <div className="border-y border-white/[0.05] bg-[#080b12] py-3.5 overflow-hidden">
        <VelocityMarquee
          items={["UAST","Domain Segregation","Zero Copy","LLVM","Unikernel","Polyglot","NEXUS",
                  "Hot Reload","LSP","WASM","RISC-V","ARM64","HTTP/3","FFI-free","Type Safety"]}
          baseSpeed={-3}
          itemClassName="text-[#1e293b] text-xs font-mono hover:text-[#334155] transition-colors"
        />
      </div>

      {/* ═══════ ANIMATION SHOWCASE ═══════ */}
      <section className="py-32 px-6 bg-[#0d1117] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-16">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Motion Showcase</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#e2e8f0]">
              Extraordinary{" "}
              <span className="gradient-text">Animations</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Spinning 3D Cube */}
            <Reveal variant="scalePop" delay={0}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-4">
                <SpinningCube size={70} color="#00d4ff" />
                <p className="text-[#64748b] text-xs font-mono text-center">Spinning 3D Cube</p>
              </div>
            </Reveal>

            {/* Loading states */}
            <Reveal variant="scalePop" delay={0.08}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-5">
                <div className="flex items-center gap-6">
                  <LoadingSpinner size={36} color="#00d4ff" />
                  <RippleLoader color="#00ff88" />
                  <JumpingDots color="#a855f7" />
                </div>
                <PulseDots color="#f59e0b" />
                <p className="text-[#64748b] text-xs font-mono text-center">Loading Variants</p>
              </div>
            </Reveal>

            {/* Multi-state badge */}
            <Reveal variant="scalePop" delay={0.16}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-4">
                <MultiStateBadge state={badgeState} className="text-sm" />
                <p className="text-[#64748b] text-xs font-mono text-center">Multi-State Badge</p>
              </div>
            </Reveal>

            {/* Keyframe orb */}
            <Reveal variant="scalePop" delay={0.24}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-4">
                <div className="h-16 flex items-center justify-center">
                  <KeyframeOrb size={30} />
                </div>
                <p className="text-[#64748b] text-xs font-mono text-center">Keyframe Wildcard</p>
              </div>
            </Reveal>

            {/* SVG Path Drawing */}
            <Reveal variant="scalePop" delay={0.32}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-4">
                <PathDraw
                  d="M 20 100 C 20 20, 80 20, 100 100 S 180 180, 180 100"
                  stroke="#00d4ff"
                  strokeWidth={2.5}
                  viewBox="0 0 200 200"
                  width={100}
                  height={60}
                />
                <p className="text-[#64748b] text-xs font-mono text-center">Path Drawing</p>
              </div>
            </Reveal>

            {/* Morphing path */}
            <Reveal variant="scalePop" delay={0.4}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-4">
                <MorphingPath className="w-full h-12" />
                <p className="text-[#64748b] text-xs font-mono text-center">Path Morphing</p>
              </div>
            </Reveal>

            {/* Hold to confirm */}
            <Reveal variant="scalePop" delay={0.08}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-4">
                <HoldToConfirm
                  onConfirm={() => {}}
                  className="px-6 py-3 rounded-xl border border-[#00d4ff]/30 bg-[#00d4ff]/[0.06] text-[#00d4ff] text-sm font-semibold"
                >
                  Hold to confirm
                </HoldToConfirm>
                <p className="text-[#64748b] text-xs font-mono text-center">Hold to Confirm</p>
              </div>
            </Reveal>

            {/* Intelligence Ripple */}
            <Reveal variant="scalePop" delay={0.16}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col items-center gap-4">
                <div className="h-16 flex items-center justify-center relative">
                  <IntelligenceRipple className="w-16 h-16" />
                  <div className="absolute w-3 h-3 rounded-full bg-[#00d4ff]" aria-hidden="true" />
                </div>
                <p className="text-[#64748b] text-xs font-mono text-center">Intelligence Ripple</p>
              </div>
            </Reveal>

            {/* Smooth tabs */}
            <Reveal variant="scalePop" delay={0.24}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-7 flex flex-col gap-4">
                <SmoothTabs
                  tabs={FEATURE_TABS}
                  activeId={activeTab}
                  onChange={setActiveTab}
                  className="bg-white/[0.04] rounded-lg p-1"
                />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeTab}
                    className="text-[#475569] text-xs font-mono"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "lang" && "Rust · Go · Python · TypeScript · C++ · Julia…"}
                    {activeTab === "compile" && "LLVM-Omni · UAST · x86_64 · ARM64 · WASM32…"}
                    {activeTab === "deploy" && "Unikernel · Docker · K8s · Bare Metal · Edge…"}
                  </motion.p>
                </AnimatePresence>
                <p className="text-[#64748b] text-xs font-mono">Smooth Tabs</p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ═══════ SCROLL ZOOM + FILL TEXT ═══════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <ParticleField count={25} />
        <div className="max-w-4xl mx-auto text-center">

          <ScrollZoomHero className="mb-12">
            <div className="flex justify-center mb-8">
              <OmniLogo size={220} interactive={true} heroMode={true} />
            </div>
          </ScrollZoomHero>

          <Reveal variant="blurRise">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-6">Apache 2.0 · Open Source</p>
            <div className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              <FillText text="Deploy the impossible." className="text-[#1e293b]" fillColor="#e2e8f0" />
            </div>
            <p className="text-[#64748b] mb-10 text-sm max-w-sm mx-auto">
              7ms cold starts. SIMD-optimized hot paths. Zero-FFI polyglot modules.
              Production-grade from commit one.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <MagneticButton>
                <Link href="/docs"
                  className="bg-[#00d4ff] text-[#080b12] font-bold px-9 py-3.5 rounded-xl text-sm
                    hover:bg-[#22e0ff] glow-sm transition-all hover:scale-105 active:scale-95">
                  Start Building
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a href="https://github.com/Cukurikik/Omni" target="_blank" rel="noopener noreferrer"
                  className="border border-white/10 bg-white/[0.04] text-[#e2e8f0] font-semibold
                    px-9 py-3.5 rounded-xl text-sm hover:border-[#00d4ff]/40 transition-all flex items-center gap-2
                    hover:scale-105 active:scale-95">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  View on GitHub
                </a>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          UNIVERSAL AST VISUALIZER
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-[#0d1117] border-y border-white/[0.05] relative overflow-hidden">
        <ParticleField count={14} />
        <div className="max-w-5xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-12">
            <p className="text-xs text-[#00f2ff] font-mono uppercase tracking-widest mb-3">Universal AST</p>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-[#e2e8f0]">One semantic graph.</span>{" "}
              <span className="gradient-text">Every language.</span>
            </h2>
            <p className="text-[#475569] mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              Hover a language panel to trace its AST path as it merges into the central OMNI AST node.
              Zero FFI. Zero serialization. Provably zero overhead.
            </p>
          </Reveal>
          <ASTVisualizer />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BENCHMARK DASHBOARD
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <ParticleField count={10} />
        <div className="max-w-4xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-12">
            <p className="text-xs text-[#00f2ff] font-mono uppercase tracking-widest mb-3">Performance</p>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-[#e2e8f0]">7ms cold start.</span>{" "}
              <span className="gradient-text">Not a claim.</span>
            </h2>
            <p className="text-[#475569] mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              Reproducible benchmarks on ARM64 / 512 MB RAM. OMNI Unikernel vs Docker/Go vs Node.js.
              Hover the Methodology badge for full test environment details.
            </p>
          </Reveal>
          <BenchmarkDashboard />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          REGISTRY EXPLORER
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-[#0d1117] border-y border-white/[0.05] relative overflow-hidden">
        <ParticleField count={12} />
        <div className="max-w-5xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-12">
            <p className="text-xs text-[#00f2ff] font-mono uppercase tracking-widest mb-3">OMNI-NEXUS</p>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-[#e2e8f0]">One registry.</span>{" "}
              <span className="gradient-text">Every ecosystem.</span>
            </h2>
            <p className="text-[#475569] mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              540+ packages across 15 language categories. Real-time publish feed. Press{" "}
              <kbd className="font-mono text-[#00d4ff] border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
              {" "}to fuzzy-search by language, author, or package name.
            </p>
          </Reveal>
          <RegistryExplorer />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          POLYGLOT IR PLAYGROUND
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <ParticleField count={12} />
        <div className="max-w-5xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-12">
            <p className="text-xs text-[#a855f7] font-mono uppercase tracking-widest mb-3">Polyglot Playground</p>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-[#e2e8f0]">15 languages.</span>{" "}
              <span className="gradient-text">Identical IR.</span>
            </h2>
            <p className="text-[#475569] mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              Toggle between all 15 supported languages and watch OMNI translate each into the same
              LLVM-Omni intermediate representation. WCAG AAA contrast syntax highlighting throughout.
            </p>
          </Reveal>
          <PolyglotPlayground />
        </div>
      </section>

      {/* ═══════ EXTENDED ANIMATION LAB ═══════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <ParticleField count={16} />
        <div className="max-w-6xl mx-auto">

          <Reveal variant="blurRise" className="text-center mb-16">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Animation Lab</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#e2e8f0]">
              Every motion. <span className="gradient-text">Mastered.</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Material Ripple */}
            <Reveal variant="scalePop" delay={0}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden">
                <MaterialRipple className="p-7 flex flex-col items-center gap-4 cursor-pointer w-full h-full"
                  color="rgba(0,212,255,0.2)">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00d4ff" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    ◈
                  </motion.div>
                  <p className="text-[#64748b] text-xs font-mono text-center">Material Design Ripple</p>
                  <p className="text-[#334155] text-[10px] font-mono">Click anywhere</p>
                </MaterialRipple>
              </div>
            </Reveal>

            {/* Motion Along Path */}
            <Reveal variant="scalePop" delay={0.08}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-7 flex flex-col gap-4">
                <MotionAlongPath className="w-full h-20" />
                <p className="text-[#64748b] text-xs font-mono text-center">Motion Along a Path</p>
              </div>
            </Reveal>

            {/* iOS Slider */}
            <Reveal variant="scalePop" delay={0.16}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-7 flex flex-col gap-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#64748b] text-xs font-mono">Volume</span>
                  <motion.span
                    className="text-[#00d4ff] text-xs font-mono tabular-nums"
                    key={Math.round(sliderVal)}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {Math.round(sliderVal)}%
                  </motion.span>
                </div>
                <IOSSlider value={sliderVal} onChange={setSliderVal} color="#00d4ff" />
                <IOSSlider value={100 - sliderVal} onChange={v => setSliderVal(100 - v)} color="#00ff88" />
                <p className="text-[#64748b] text-xs font-mono text-center">iOS Slider with Spring</p>
              </div>
            </Reveal>

            {/* Magnetic Filings */}
            <Reveal variant="scalePop" delay={0.24}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden">
                <MagneticFilings count={40} className="w-full h-44 bg-[#080b12]" />
                <div className="px-5 pb-5 pt-3">
                  <p className="text-[#64748b] text-xs font-mono text-center">Magnetic Filings</p>
                  <p className="text-[#334155] text-[10px] font-mono text-center mt-1">Move cursor over field</p>
                </div>
              </div>
            </Reveal>

            {/* Loading Overlay */}
            <Reveal variant="scalePop" delay={0.32}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-7 flex flex-col items-center gap-4">
                <motion.button
                  className="px-6 py-3 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/25 text-[#00d4ff] text-sm font-semibold"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0,212,255,0.18)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setOverlayVisible(true); setTimeout(() => setOverlayVisible(false), 2200) }}
                >
                  Show Loading Overlay
                </motion.button>
                <p className="text-[#64748b] text-xs font-mono text-center">Loading Overlay</p>
              </div>
            </Reveal>

            {/* Scroll Velocity 3D Planes */}
            <Reveal variant="scalePop" delay={0.4}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5 flex flex-col gap-4">
                <ScrollVelocity3DPlanes items={VELOCITY_PLANES} />
                <p className="text-[#64748b] text-xs font-mono text-center">Scroll Velocity 3D Planes</p>
              </div>
            </Reveal>

            {/* iOS App Store Cards */}
            <Reveal variant="scalePop" delay={0}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5 flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
                {APP_STORE_CARDS.slice(0, 2).map(card => (
                  <AppStoreCard key={card.id} {...card} />
                ))}
                <p className="text-[#64748b] text-xs font-mono text-center mt-1">iOS App Store Cards</p>
              </div>
            </Reveal>

            {/* iOS App Folder */}
            <Reveal variant="scalePop" delay={0.08}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-7 flex flex-col items-center gap-4">
                <IOSAppFolder apps={FOLDER_APPS} folderName="OMNI Lang" />
                <p className="text-[#64748b] text-xs font-mono text-center">iOS App Folder</p>
                <p className="text-[#334155] text-[10px] font-mono">Tap to expand</p>
              </div>
            </Reveal>

            {/* Command Palette */}
            <Reveal variant="scalePop" delay={0.16}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-7 flex flex-col items-center gap-4">
                <CommandPalette items={COMMAND_ITEMS} placeholder="Search OMNI…" />
                <p className="text-[#64748b] text-xs font-mono text-center">Command Palette</p>
                <p className="text-[#334155] text-[10px] font-mono">⌘K or click to open</p>
              </div>
            </Reveal>

            {/* Image Reveal Slider */}
            <Reveal variant="scalePop" delay={0.24}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden sm:col-span-2 lg:col-span-2">
                <ImageRevealSlider
                  before="https://placehold.co/640x200?text=OMNI+v1+Legacy+Interface+Dark+Minimal+Monochrome"
                  beforeAlt="OMNI v1 legacy dark interface"
                  after="https://placehold.co/640x200?text=OMNI+v2+New+Interface+Glowing+Cyan+Modern+Design"
                  afterAlt="OMNI v2 modern glowing cyan interface"
                  className="h-48"
                />
                <div className="px-5 py-3">
                  <p className="text-[#64748b] text-xs font-mono text-center">Image Reveal Slider — drag the handle</p>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ═══════ SWIPE ACTIONS SHOWCASE ═══════ */}
      <section className="py-24 px-6 bg-[#0d1117] border-y border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-10">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Gestures</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#e2e8f0]">
              Swipe. Drag. <span className="gradient-text">Interact.</span>
            </h2>
          </Reveal>

          <div className="flex flex-col gap-3">
            {[
              { id: "1", name: "Universal AST Module",   version: "v3.2.1", color: "#00d4ff" },
              { id: "2", name: "LLVM-Omni Compiler",     version: "v2.0.0", color: "#00ff88" },
              { id: "3", name: "Domain Segregation",     version: "v1.8.4", color: "#a855f7" },
              { id: "4", name: "NEXUS Package Registry", version: "v4.0.0", color: "#f59e0b" },
            ].map(pkg => (
              <SwipeActions
                key={pkg.id}
                actions={[
                  { label: "Install", color: pkg.color,  icon: <span className="text-xs">⬇</span>, onAction: () => {} },
                  { label: "Remove",  color: "#ef4444",  icon: <span className="text-xs">✕</span>, onAction: () => {} },
                ]}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: `${pkg.color}15`, color: pkg.color, border: `1px solid ${pkg.color}22` }}
                    aria-hidden="true"
                  >
                    ◈
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#e2e8f0] font-semibold text-sm">{pkg.name}</div>
                    <div className="text-[#475569] text-xs font-mono">{pkg.version}</div>
                  </div>
                  <div className="text-[#334155] text-xs font-mono">← swipe</div>
                </div>
              </SwipeActions>
            ))}
          </div>
          <p className="text-center text-[#334155] text-xs font-mono mt-4">Swipe actions — reveal hidden buttons</p>
        </div>
      </section>

      {/* ═══════ CAROUSEL SHOWCASE ═══════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-10">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">iOS Carousel</p>
            <h2 className="text-3xl font-black text-[#e2e8f0]">Swipe to explore.</h2>
          </Reveal>

          <IOSCarousel
            slides={APP_STORE_CARDS.map(card => ({
              id: card.id,
              content: (
                <TiltCard
                  className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-8 flex flex-col items-center gap-5 mx-2 cursor-grab"
                  maxTilt={8}
                >
                  <motion.div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-black"
                    style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}28` }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {card.icon}
                  </motion.div>
                  <div className="text-center">
                    <h3 className="text-[#e2e8f0] font-bold text-lg mb-1">{card.title}</h3>
                    <p className="text-[#64748b] text-sm">{card.subtitle}</p>
                  </div>
                  <motion.div
                    className="w-full h-1.5 rounded-full overflow-hidden bg-white/[0.06]"
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: card.color }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: false }}
                      transition={{ duration: 1.2, ease: cubicBezier(0.16, 1, 0.3, 1) }}
                    />
                  </motion.div>
                </TiltCard>
              ),
            }))}
          />
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <ParticleField count={14} />
        <div className="max-w-6xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-16">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-[#e2e8f0]">Loved by</span>{" "}
              <span className="gradient-text">builders.</span>
            </h2>
          </Reveal>

          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
            {[
              { name: "Aria Chen",    role: "Principal Engineer @ Vercel",    color: "#00d4ff", text: "OMNI eliminated our entire FFI layer. We dropped 40k lines of glue code and gained 3x throughput. The UAST bridge is genuinely magical." },
              { name: "Marcus Diaz",  role: "Staff SRE @ Cloudflare",         color: "#00ff88", text: "Unikernel deploys boot in 7ms on our edge. Cold start under 10ms is not marketing — it is the default. We shut down 60% of our container fleet." },
              { name: "Yuna Park",    role: "CTO @ Axiom Systems",            color: "#a855f7", text: "We write Rust for the hot path, Python for the ML pipeline, and TypeScript for the API — all in one .omni file. Zero serialization. Unreal performance." },
              { name: "Luca Ferrari", role: "Open Source Lead @ Mozilla",     color: "#f59e0b", text: "The LSP and VS Code extension are first-class. IntelliSense across language boundaries is something I did not think was possible until OMNI." },
              { name: "Priya Nair",   role: "Distributed Systems @ Stripe",   color: "#ef4444", text: "OMNI NEXUS resolved our npm vs Cargo dependency hell overnight. One registry, one lockfile, one mental model. Finally." },
              { name: "Theo Wright",  role: "Performance Eng @ Linear",       color: "#00d4ff", text: "Whole-program optimization across language boundaries is the real differentiator. LLVM-Omni inlines across Rust and Go call sites. Mind-blowing." },
            ].map((t, i) => (
              <StaggerItem key={t.name}>
                <TiltCard
                  className="h-full rounded-2xl border border-white/[0.07] bg-[#0d1117] p-6 flex flex-col gap-4"
                  maxTilt={8} glare
                >
                  {/* quote mark */}
                  <motion.div
                    className="text-4xl font-black leading-none"
                    style={{ color: t.color, opacity: 0.35 }}
                    animate={{ opacity: [0.25, 0.45, 0.25] }}
                    transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </motion.div>

                  <p className="text-[#64748b] text-sm leading-relaxed flex-1">{t.text}</p>

                  <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
                    {/* avatar */}
                    <motion.div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}30` }}
                      whileHover={{ scale: 1.12, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </motion.div>
                    <div>
                      <div className="text-[#e2e8f0] text-xs font-semibold">{t.name}</div>
                      <div className="text-[#334155] text-[10px] font-mono">{t.role}</div>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ═══════ FAQ ACCORDION ═══════ */}
      <section className="py-24 px-6 bg-[#080b12] border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <Reveal variant="blurRise" className="text-center mb-12">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#e2e8f0]">Common Questions</h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <MotionAccordion items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.05] bg-[#080b12] pt-20 pb-10 px-6 relative overflow-hidden">
        <ParticleField count={12} />

        {/* Footer gradient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* top row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* brand */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <OmniLogo size={28} />
                <span className="text-[#e2e8f0] font-black tracking-tight">OMNI</span>
              </div>
              <p className="text-[#334155] text-xs leading-relaxed mb-5">
                The world&apos;s first truly polylingual framework. 15 languages, 1 universal AST, zero FFI overhead.
              </p>
              <div className="flex gap-3">
                {[
                  { label: "GitHub", href: "https://github.com/Cukurikik/Omni", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  ) },
                ].map(s => (
                  <motion.a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-[#475569]"
                    whileHover={{ borderColor: "rgba(0,212,255,0.4)", color: "#00d4ff", scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 340, damping: 22 }}
                    aria-label={s.label}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>

              {/* Deploy button — hero CTA in footer */}
              <motion.div
                className="mt-5"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.2 }}
              >
                <DeployButton />
              </motion.div>
            </motion.div>

            {/* links */}
            {[
              { heading: "Framework",  links: [["Intro", "/intro"], ["Docs", "/docs"], ["Playground", "/playground"], ["Roadmap", "/roadmap"]] },
              { heading: "Community",  links: [["Forum", "/community"], ["Discord", "/community"], ["GitHub", "https://github.com/Cukurikik/Omni"], ["Blog", "/community"]] },
              { heading: "Account",    links: [["Login", "/login"], ["Register", "/register"], ["Dashboard", "/"], ["Packages", "/packages"]] },
            ].map((col, ci) => (
              <motion.div key={col.heading}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * (ci + 1), type: "spring", stiffness: 260, damping: 24 }}
              >
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[#334155] mb-4 font-mono">{col.heading}</h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(([label, href]) => (
                    <motion.li key={label}>
                      <motion.a
                        href={href}
                        className="text-xs text-[#475569] flex items-center gap-1.5 group"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 24 }}
                      >
                        <motion.span
                          className="w-1 h-1 rounded-full bg-[#1e293b] group-hover:bg-[#00d4ff] flex-shrink-0"
                          transition={{ duration: 0.15 }}
                          aria-hidden="true"
                        />
                        <motion.span
                          className="group-hover:text-[#00d4ff] transition-colors"
                        >
                          {label}
                        </motion.span>
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* divider */}
          <motion.div
            className="h-px bg-white/[0.05] mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1) }}
            aria-hidden="true"
          />

          {/* bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.p
              className="text-[#1e293b] text-xs font-mono"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              &copy; {new Date().getFullYear()} OMNI Framework. Apache 2.0 License.
            </motion.p>
            <motion.div
              className="flex items-center gap-2 text-[#1e293b] text-[10px] font-mono"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />
              All systems operational
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}
