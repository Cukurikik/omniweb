"use client"
import Link from "next/link"
import OmniNav from "@/components/omni-nav"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useSpring,
} from "motion/react"

/* ── Data ─────────────────────────────────────────── */
const STEPS = [
  {
    num: 1, label: "source file",
    title: "Write .omni Code",
    desc: "Author polylingual source files using @rust, @go, @python annotations. Each block uses native syntax for its language. Mix and match freely within a single .omni file.",
    color: "#00d4ff",
    details: [
      { label: "Languages", value: "15 supported" },
      { label: "File ext",  value: ".omni" },
      { label: "Syntax",    value: "Native per block" },
    ],
    code: `/// main.omni\nmodule payment_service\n\n@rust\nfn hash_card(data: &[u8]) -> [u8; 32] {\n    sha256::digest(data)\n}\n\n@go\nfunc HandleCharge(w http.ResponseWriter, r *http.Request) {\n    hash := omni_bridge::hash_card(r.Body)\n    // ...\n}\n\n@python\ndef detect_fraud(transaction: dict) -> float:\n    return fraud_model.predict([transaction])[0]`,
  },
  {
    num: 2, label: "compiler output",
    title: "UAST Compilation",
    desc: "The OMNI compiler lexes, parses, and merges all language blocks into a Universal Abstract Syntax Tree. Each language's AST is validated and converted into UAST nodes.",
    color: "#00ff88",
    details: [
      { label: "AST nodes", value: "22 merged" },
      { label: "Bridges",   value: "3 cross-lang" },
      { label: "Parse time",value: "0.12s" },
    ],
    code: `[LEXER]   Scanning @rust block... 41 tokens\n[LEXER]   Scanning @go block...   38 tokens\n[LEXER]   Scanning @python block... 29 tokens\n[PARSER]  Building Rust AST:   6 nodes\n[PARSER]  Building Go AST:     9 nodes\n[PARSER]  Building Python AST: 7 nodes\n[UAST]    Merging into UAST:  22 nodes ✓\n[UAST]    DomainBridge: 3 cross-language calls ✓`,
  },
  {
    num: 3, label: "type checker",
    title: "Type & Safety Checks",
    desc: "Cross-language type compatibility, ownership analysis, domain layer rules, and borrow checking — all at compile time. Errors surface before a single line runs.",
    color: "#a855f7",
    details: [
      { label: "Type errors", value: "0 found" },
      { label: "Violations", value: "0 domain" },
      { label: "Borrow",     value: "All clear" },
    ],
    code: `[TYPECHECK] Checking cross-language signatures...\n[TYPECHECK] rust::hash_card(&[u8]) -> [u8; 32] ✓\n[TYPECHECK] go bridge: []byte → *[u8] ✓ (zero-copy)\n[DOMAIN]    System  ← Network: allowed ✓\n[DOMAIN]    Network ← Compute: allowed ✓\n[BORROW]    No dangling references ✓\n[SAFETY]    Domain segregation: no violations ✓\n[SAFETY]    All Result<T,E> handled ✓`,
  },
  {
    num: 4, label: "llvm passes",
    title: "LLVM Optimization",
    desc: "LLVM-Omni applies vectorization, cross-language inlining, dead code elimination, and constant folding across all 15 language boundaries simultaneously.",
    color: "#f59e0b",
    details: [
      { label: "Speedup", value: "4.1x SIMD" },
      { label: "Inlined", value: "12 calls" },
      { label: "Removed", value: "847 bytes" },
    ],
    code: `[LLVM]  Pass: vectorize        → 4.1x SIMD speedup\n[LLVM]  Pass: inline           → 12 calls inlined\n[LLVM]  Pass: dead-code-elim   → 847 bytes removed\n[LLVM]  Pass: const-fold       → 3 expressions folded\n[LLVM]  Pass: loop-unroll      → inner loops: 4x\n[LLVM]  Cross-lang inline:     rust→go bridge: 0ns\n[LLVM]  Optimization: complete (-O3, 2.1s) ✓`,
  },
  {
    num: 5, label: "build output",
    title: "Native Binary",
    desc: "Outputs a single optimized binary for x86_64, ARM64, WASM32, or a 3-8MB bootable unikernel image. One binary, every language, zero runtime dependency.",
    color: "#ef4444",
    details: [
      { label: "Binary size", value: "4.7 MB" },
      { label: "Unikernel",  value: "6.1 MB" },
      { label: "Build time", value: "3.4s" },
    ],
    code: `[BUILD]  Target: x86_64-unknown-linux-gnu\n[BUILD]  Compiling: Rust core runtime\n[BUILD]  Compiling: Go scheduler + HTTP/3\n[BUILD]  Linking:   python3.12 embed\n[BUILD]  Stripping: debug symbols\n[BUILD]  Output:    ./dist/payment-service\n[BUILD]  Size:      4.7 MB  (unikernel: 6.1 MB)\n[BUILD]  Build time: 3.4s ✓`,
  },
  {
    num: 6, label: "deploy log",
    title: "Deploy Anywhere",
    desc: "One command deploys to OMNI Cloud, Docker, Kubernetes, or bare metal. Auto-scaling built in. Cold start under 10ms with unikernel mode.",
    color: "#00d4ff",
    details: [
      { label: "Cold start", value: "8ms" },
      { label: "Replicas",  value: "3 / max 50" },
      { label: "Status",    value: "Live" },
    ],
    code: `$ omni cloud deploy --region id-jkt-1\n\n[CLOUD]  Pushing binary (4.7 MB)... done\n[CLOUD]  Provisioning unikernel VM...\n[CLOUD]  Cold start:  8ms ✓\n[CLOUD]  Health check: /health  200 OK ✓\n[CLOUD]  DNS: payment.omni.cloud → live\n[CLOUD]  Replicas: 3 / auto-scale max: 50\n[CLOUD]  Deploy complete ✓`,
  },
]

const PRINCIPLES = [
  { title: "Best Tool Per Domain",   color: "#00d4ff", desc: "System layer uses Rust/C for performance. Network uses Go for concurrency. Compute uses Python for ML. Each language in its element." },
  { title: "Zero-Copy Bridges",      color: "#00ff88", desc: "Data >64 bytes passes between languages via shared memory pointers. No JSON, no Protobuf. ~50ns vs ~1ms for gRPC." },
  { title: "Compile-Time Safety",    color: "#a855f7", desc: "Ownership tracking, domain segregation, and type checking across all 15 languages — before a single line runs. Zero runtime surprises." },
  { title: "One Binary, One Deploy", color: "#f59e0b", desc: "No microservice mesh. No Docker compose with 40 services. One binary contains Rust+Go+Python+TypeScript compiled together." },
]

/* ── Animated typewriter terminal ── */
function AnimatedCode({ code, color, active }: { code: string; color: string; active: boolean }) {
  const [displayed, setDisplayed] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!active) { setDisplayed(""); return }
    setDisplayed(""); let i = 0
    const type = () => { i++; setDisplayed(code.slice(0, i)); if (i < code.length) timerRef.current = setTimeout(type, 11) }
    timerRef.current = setTimeout(type, 100)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active, code])

  return (
    <pre className="p-5 text-xs font-mono leading-[1.75] overflow-x-auto whitespace-pre min-h-[9rem]">
      {displayed.split("\n").map((line, i) => {
        const isOk  = line.includes("✓")
        const isCmt = line.trimStart().startsWith("//") || line.trimStart().startsWith("///")
        const isKey = line.trimStart().startsWith("[")
        return (
          <div key={i}>
            <span style={{ color: isOk ? color : isCmt ? "#6272a4" : isKey ? color : "#94a3b8" }}>
              {line || " "}
            </span>
          </div>
        )
      })}
      <span className="cursor-blink ml-0.5" />
    </pre>
  )
}

/* ── Reveal wrapper ── */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 24, delay }}>
      {children}
    </motion.div>
  )
}

/* ── Pipeline connector ── */
function PipelineConnector({ color, flowing }: { color: string; flowing: boolean }) {
  return (
    <div className="flex justify-center my-1" aria-hidden="true">
      <motion.div
        className="w-0.5 h-12 rounded-full overflow-hidden"
        style={{ background: flowing ? `linear-gradient(to bottom, ${color}80, ${color}20)` : "rgba(255,255,255,0.06)" }}
        animate={{ background: flowing ? `linear-gradient(to bottom, ${color}80, ${color}20)` : "rgba(255,255,255,0.06)" }}
        transition={{ duration: 0.5 }}
      >
        {flowing && (
          <motion.div
            className="w-full rounded-full"
            style={{ background: color, height: "33%" }}
            animate={{ y: ["-100%", "400%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  )
}

export default function WorkflowPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [autoPlay,   setAutoPlay]   = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Hero parallax */
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yParallax   = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    if (!autoPlay) { if (autoRef.current) clearTimeout(autoRef.current); return }
    autoRef.current = setTimeout(() => {
      setActiveStep(prev => {
        const next = (prev === null ? 0 : prev + 1)
        if (next >= STEPS.length) { setAutoPlay(false); return prev }
        return next
      })
    }, 5000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoPlay, activeStep])

  const startTour = useCallback(() => { setActiveStep(0); setAutoPlay(true) }, [])

  /* hero stagger */
  const hc = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }
  const hi = {
    hidden:  { opacity: 0, y: 28, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  }

  return (
    <div className="min-h-screen bg-[#080b12] overflow-x-hidden">
      <OmniNav />

      {/* ═══ HERO ═══ */}
      <motion.section
        ref={heroRef}
        className="pt-32 pb-20 px-6 text-center relative overflow-hidden omni-grid"
        style={{ y: yParallax, opacity: opacityHero }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: "radial-gradient(ellipse at 50% -5%, rgba(0,212,255,0.08) 0%, transparent 60%)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
        />
        {/* Floating orbs */}
        {[
          { color: "rgba(0,212,255,0.07)", x: "15%", y: "40%", size: 350, dur: 9  },
          { color: "rgba(0,255,136,0.05)", x: "80%", y: "55%", size: 280, dur: 12 },
          { color: "rgba(168,85,247,0.05)",x: "50%", y: "85%", size: 300, dur: 10 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.2, 1], x: [0, i % 2 === 0 ? 20 : -20, 0] }}
            transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: i * 1.8 }}
            aria-hidden="true"
          />
        ))}

        <motion.div
          className="max-w-3xl mx-auto relative z-10"
          variants={hc} initial="hidden" animate="visible"
        >
          <motion.p variants={hi} className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-4">
            Compilation Pipeline
          </motion.p>

          <motion.h1 className="text-5xl md:text-7xl font-black text-[#e2e8f0] mb-5 leading-[1.05]" variants={hi}>
            {"The OMNI".split("").map((ch, i) => (
              <motion.span key={i} className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.3 + i * 0.035 }}>
                {ch === " " ? "\u00a0" : ch}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="gradient-text"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.9 }}
            >
              Architecture
            </motion.span>
          </motion.h1>

          <motion.p variants={hi} className="text-[#64748b] text-lg mb-3 leading-relaxed">
            6-step pipeline. Zero-copy bridges. One binary.
          </motion.p>
          <motion.p variants={hi} className="text-[#475569] max-w-xl mx-auto leading-relaxed text-sm mb-10">
            Click any step below to inspect compiler output in real time, or run the interactive walkthrough.
          </motion.p>

          <motion.div variants={hi} className="flex flex-wrap gap-4 justify-center">
            <motion.button
              onClick={startTour}
              className="group relative overflow-hidden bg-[#00d4ff] text-[#080b12] font-bold px-8 py-3.5 rounded-xl text-sm flex items-center gap-2"
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(0,212,255,0.5)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
            >
              <motion.div
                className="absolute inset-0 -translate-x-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                whileHover={{ translateX: "100%" }}
                transition={{ duration: 0.5 }}
                aria-hidden="true"
              />
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              Run Interactive Tour
            </motion.button>
            <motion.button
              onClick={() => { setActiveStep(null); setAutoPlay(false) }}
              className="border border-white/10 bg-white/[0.04] text-[#e2e8f0] font-semibold px-6 py-3.5 rounded-xl text-sm"
              whileHover={{ borderColor: "rgba(0,212,255,0.4)", backgroundColor: "rgba(0,212,255,0.05)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
            >
              Reset
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══ PIPELINE STEPS ═══ */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Progress bar */}
          <AnimatePresence>
            {activeStep !== null && (
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-[#475569]">
                  <span>Pipeline progress</span>
                  <motion.span
                    key={activeStep}
                    className="text-[#00d4ff]"
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    Step {activeStep + 1} / {STEPS.length}
                  </motion.span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)", boxShadow: "0 0 12px rgba(0,212,255,0.5)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 30 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col">
            {STEPS.map((step, i) => {
              const isActive = activeStep === i
              const isDone   = activeStep !== null && i < activeStep
              const connectorColors: Record<number, string> = { 0: "#00d4ff", 1: "#00ff88", 2: "#a855f7", 3: "#f59e0b", 4: "#ef4444" }

              return (
                <div key={step.num}>
                  {/* Step card */}
                  <motion.div
                    className="relative rounded-2xl border overflow-hidden cursor-pointer"
                    style={{ background: "#0d1117" }}
                    animate={{
                      borderColor: isActive ? `${step.color}60` : isDone ? `${step.color}25` : "rgba(255,255,255,0.06)",
                      scale: isActive ? 1.01 : 1,
                      boxShadow: isActive ? `0 0 40px ${step.color}15, 0 0 0 1px ${step.color}20` : "none",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    whileHover={{ borderColor: `${step.color}35`, boxShadow: `0 4px 20px ${step.color}08` }}
                    onClick={() => setActiveStep(isActive ? null : i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && setActiveStep(isActive ? null : i)}
                    aria-expanded={isActive}
                    aria-label={`Step ${step.num}: ${step.title}`}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    {/* Active bg glow */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: `linear-gradient(135deg, ${step.color}06 0%, transparent 60%)` }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          aria-hidden="true"
                        />
                      )}
                    </AnimatePresence>

                    {/* Header row */}
                    <div className="flex items-center gap-5 p-5">
                      {/* Step number badge */}
                      <motion.div
                        className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl relative"
                        style={{ borderWidth: 2, borderStyle: "solid", color: step.color }}
                        animate={{
                          borderColor: isActive ? step.color : isDone ? `${step.color}50` : `${step.color}30`,
                          background:  isActive ? `${step.color}15` : `${step.color}08`,
                          boxShadow:   isActive ? `0 0 24px ${step.color}40` : "none",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      >
                        <AnimatePresence mode="wait">
                          {isDone ? (
                            <motion.svg key="check" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                              initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </motion.svg>
                          ) : (
                            <motion.span key="num"
                              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                              {step.num}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-xl border-2"
                            style={{ borderColor: step.color }}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            aria-hidden="true"
                          />
                        )}
                      </motion.div>

                      {/* Title + desc */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-[#e2e8f0] font-bold text-base">{step.title}</h3>
                          <AnimatePresence>
                            {isDone && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                                style={{ background: `${step.color}15`, color: step.color }}>
                                DONE
                              </motion.span>
                            )}
                            {isActive && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                                style={{ background: `${step.color}15`, color: step.color, borderColor: `${step.color}40` }}>
                                <motion.span
                                  animate={{ opacity: [1, 0.3, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}>
                                  RUNNING
                                </motion.span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <p className="text-[#64748b] text-sm leading-relaxed line-clamp-2">{step.desc}</p>
                      </div>

                      {/* Expand chevron */}
                      <motion.svg
                        className="w-5 h-5 shrink-0 text-[#475569]"
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                        animate={{ rotate: isActive ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </motion.svg>
                    </div>

                    {/* Expandable content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 280, damping: 28 }}
                          className="overflow-hidden"
                        >
                          {/* Terminal */}
                          <div className="mx-5 mb-5 rounded-xl border overflow-hidden"
                            style={{ borderColor: `${step.color}20`, background: "#080b12" }}>
                            <div className="flex items-center gap-2 px-4 py-2.5 border-b"
                              style={{ borderColor: `${step.color}12`, background: `${step.color}06` }}>
                              <div className="flex gap-1.5">
                                {["#ef4444", "#f59e0b", "#00ff88"].map(c => (
                                  <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                                ))}
                              </div>
                              <span className="text-[10px] font-mono ml-2 uppercase tracking-widest" style={{ color: step.color }}>
                                {step.label}
                              </span>
                              <motion.div className="ml-auto flex items-center gap-1.5">
                                <motion.div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: step.color }}
                                  animate={{ opacity: [1, 0.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                                <span className="text-[9px] font-mono text-[#475569]">live</span>
                              </motion.div>
                            </div>
                            <AnimatedCode code={step.code} color={step.color} active={isActive} />
                          </div>

                          {/* Details grid */}
                          <div className="grid sm:grid-cols-3 gap-3 mx-5 mb-5">
                            {step.details.map((d, di) => (
                              <motion.div
                                key={d.label}
                                className="rounded-lg p-3 border"
                                style={{ borderColor: `${step.color}15`, background: `${step.color}05` }}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 22, delay: di * 0.08 }}
                              >
                                <div className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: step.color }}>
                                  {d.label}
                                </div>
                                <div className="text-[#e2e8f0] font-bold text-sm">{d.value}</div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Connector */}
                  {i < STEPS.length - 1 && (
                    <PipelineConnector
                      color={connectorColors[i] ?? "#00d4ff"}
                      flowing={isDone || isActive}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ DESIGN PRINCIPLES ═══ */}
      <section className="py-24 px-6 bg-[#0d1117] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Philosophy</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#e2e8f0]">Design Principles</h2>
            <p className="text-[#475569] mt-3 text-sm max-w-md mx-auto">
              Every architectural decision in OMNI serves one goal: eliminating the cost of polyglot development.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <motion.div
                  className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-6 relative overflow-hidden h-full"
                  whileHover={{ borderColor: `${p.color}30`, boxShadow: `0 8px 32px ${p.color}10`, y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 rounded-2xl"
                    style={{ background: `radial-gradient(circle at 20% 50%, ${p.color}07 0%, transparent 60%)` }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full mb-5"
                      style={{ background: p.color }}
                      animate={{ boxShadow: [`0 0 4px ${p.color}`, `0 0 16px ${p.color}`, `0 0 4px ${p.color}`] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                    />
                    <h3 className="text-[#e2e8f0] font-bold mb-2">{p.title}</h3>
                    <p className="text-[#64748b] text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6 text-center">
        <Reveal className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-[#e2e8f0] mb-4">Ready to build?</h2>
          <p className="text-[#64748b] mb-10 leading-relaxed">
            Start with the docs or jump straight into the interactive playground.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { href: "/docs",       label: "Read the Docs",   primary: true  },
              { href: "/playground", label: "Open Playground", primary: false },
            ].map(btn => (
              <motion.div key={btn.href}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.96, y: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 22 }}
              >
                <Link
                  href={btn.href}
                  className={`relative overflow-hidden inline-flex items-center font-bold px-8 py-3.5 rounded-xl text-sm ${
                    btn.primary
                      ? "bg-[#00d4ff] text-[#080b12]"
                      : "border border-white/10 bg-white/[0.04] text-[#e2e8f0]"
                  }`}
                  style={btn.primary ? undefined : undefined}
                >
                  {/* Shimmer */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
                    whileHover={{ translateX: "100%" }}
                    transition={{ duration: 0.5 }}
                    aria-hidden="true"
                  />
                  <span className="relative z-10">{btn.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.05] py-8 px-6 text-center">
        <motion.p className="text-[#334155] text-xs"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          &copy; {new Date().getFullYear()} OMNI Framework &mdash; Apache 2.0 License
        </motion.p>
      </footer>
    </div>
  )
}
