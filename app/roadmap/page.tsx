"use client"
import Link from "next/link"
import OmniNav from "@/components/omni-nav"
import { useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "motion/react"

const VERSIONS = [
  {
    version: "v2.0",
    name: "OMNI NEXUS ULTRA",
    status: "released",
    statusLabel: "Released",
    period: "Q1 2026",
    color: "#00ff88",
    items: [
      "15 language support (C, C++, Rust, Go, JS, Python, Julia, R, TS, HTML, Swift, GraphQL, C#, Ruby, PHP)",
      "LLVM-Omni compiler with vectorize, inline, unroll passes",
      "Universal AST (UAST) engine with cross-language type checking",
      "OMNI-NEXUS unified package registry (540+ modules)",
      "Unikernel deployment (3-8MB, <10ms cold start)",
      "VS Code extension with LSP, IntelliSense, domain layer color coding",
      "Monadic error handling with Result<T,E> and ? operator",
      "Ownership & borrowing system (affine types)",
      "Go API gateway with HTTP/3, gRPC, WebSocket",
      "Rust runtime core with arena allocators",
    ],
  },
  {
    version: "v2.1",
    name: "Edge Computing & Speed",
    status: "progress",
    statusLabel: "In Progress",
    period: "Q2 2026",
    color: "#00d4ff",
    items: [
      "WebGPU compute shader support (Rust + WGSL)",
      "OMNI Cloud v2 — global edge deployment (30+ regions)",
      "Incremental compilation (10x faster rebuilds)",
      "WASI support for Cloudflare Workers, Deno Deploy",
      "Hot Module Replacement (HMR) for development",
      "Parallel test execution (8x speedup)",
      "Language Server improvements (faster diagnostics)",
    ],
  },
  {
    version: "v2.2",
    name: "Developer Experience",
    status: "planned",
    statusLabel: "Planned",
    period: "Q3 2026",
    color: "#a855f7",
    items: [
      "Visual debugger with cross-language step-through",
      "OMNI Studio — web-based IDE (VS Code fork)",
      "Package analytics dashboard for NEXUS",
      "Formal verification tooling (Design by Contract)",
      "AI-powered code completion (trained on OMNI corpus)",
      "Performance profiler with flame graphs",
      "Documentation generator (omni doc)",
    ],
  },
  {
    version: "v3.0",
    name: "The Singularity",
    status: "vision",
    statusLabel: "Vision",
    period: "2027",
    color: "#f59e0b",
    items: [
      "Neural Protocol — intent-based programming",
      "Telepathy Engine — code by describing, not typing",
      "Quantum computing bridge (IBM Qiskit, Google Cirq)",
      "Self-healing runtime (automatic error recovery)",
      "Interplanetary Deep-Space Transport Protocol",
      "Immortality Mesh — self-replicating code",
      "150+ language support target",
    ],
  },
]

const STATUS_LINE: Record<string, string> = {
  released: "#00ff88",
  progress: "#00d4ff",
  planned:  "#a855f7",
  vision:   "#f59e0b",
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

/* ── Single roadmap card ── */
function RoadmapCard({ v, i }: { v: typeof VERSIONS[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const color = STATUS_LINE[v.status]

  return (
    <motion.div
      ref={ref}
      className="relative flex gap-6 pb-12"
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.12 }}
    >
      {/* Vertical line */}
      {i < VERSIONS.length - 1 && (
        <motion.div
          className="absolute left-[1.625rem] top-14 bottom-0 w-px"
          style={{ background: `linear-gradient(to bottom, ${color}60, ${color}08)` }}
          initial={{ scaleY: 0, originY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, delay: i * 0.12 + 0.4, ease: "easeOut" }}
        />
      )}

      {/* Version circle */}
      <div className="shrink-0 z-10">
        <motion.div
          className="w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center text-[11px] font-black border-2"
          style={{ borderColor: color, background: `${color}10`, color }}
          initial={{ scale: 0, rotate: -180 }}
          animate={inView ? {
            scale: 1,
            rotate: 0,
            boxShadow: [`0 0 8px ${color}30`, `0 0 24px ${color}60`, `0 0 8px ${color}30`],
          } : {}}
          transition={{
            scale: { type: "spring", stiffness: 280, damping: 20, delay: i * 0.12 + 0.05 },
            rotate: { type: "spring", stiffness: 280, damping: 20, delay: i * 0.12 + 0.05 },
            boxShadow: { duration: 2.5, repeat: Infinity, delay: i * 0.3 },
          }}
        >
          {v.version}
        </motion.div>
        {/* Pulse ring for in-progress */}
        {v.status === "progress" && (
          <motion.div
            className="absolute top-0 left-0 w-[3.25rem] h-[3.25rem] rounded-full border-2"
            style={{ borderColor: color }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Card */}
      <motion.div
        className="flex-1 min-w-0"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 340, damping: 22 }}
      >
        <motion.div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${color}18` }}
          whileHover={{ borderColor: `${color}40`, boxShadow: `0 8px 32px ${color}10` }}
          transition={{ duration: 0.3 }}
        >
          {/* Card header */}
          <div
            className="px-6 py-5 border-b flex flex-wrap items-center gap-3"
            style={{ borderColor: `${color}12`, background: `${color}05` }}
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-[#e2e8f0] font-black text-lg leading-tight">{v.name}</h3>
              <p className="text-[#475569] text-sm mt-0.5 font-mono">{v.period}</p>
            </div>
            <motion.span
              className="text-xs font-bold px-3 py-1 rounded-full border"
              style={{ color, borderColor: `${color}40`, background: `${color}12` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: i * 0.12 + 0.25 }}
            >
              {v.statusLabel}
            </motion.span>
          </div>

          {/* Feature list */}
          <div className="px-6 py-5 bg-[#0d1117]">
            <ul className="flex flex-col gap-2.5">
              {v.items.map((item, li) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3 text-sm text-[#64748b]"
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ type: "spring", stiffness: 280, damping: 22, delay: i * 0.12 + 0.3 + li * 0.04 }}
                >
                  <motion.span
                    style={{ color }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {v.status === "released" ? (
                      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    )}
                  </motion.span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function RoadmapPage() {
  /* Hero parallax */
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yParallax   = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  /* stagger variants */
  const hc = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }
  const hi = {
    hidden:  { opacity: 0, y: 28, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <div className="min-h-screen bg-[#080b12] overflow-x-hidden">
      <OmniNav />

      {/* ── Hero ── */}
      <motion.section
        ref={heroRef}
        className="pt-32 pb-16 px-6 text-center radial-glow-bg relative overflow-hidden"
        style={{ y: yParallax, opacity: opacityHero }}
      >
        {/* Animated orbs */}
        <motion.div className="pointer-events-none absolute inset-0" aria-hidden="true"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          {[
            { color: "rgba(0,255,136,0.06)", x: "20%", y: "60%", s: 350, d: 9  },
            { color: "rgba(0,212,255,0.06)", x: "75%", y: "40%", s: 300, d: 11 },
            { color: "rgba(168,85,247,0.05)",x: "50%", y: "80%", s: 250, d: 13 },
          ].map((orb, i) => (
            <motion.div key={i}
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ left: orb.x, top: orb.y, width: orb.s, height: orb.s,
                background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)` }}
              animate={{ scale: [1, 1.2, 1], x: [0, i % 2 === 0 ? 25 : -25, 0] }}
              transition={{ duration: orb.d, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
            />
          ))}
          {/* Scanlines */}
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i}
              className="absolute h-px w-full"
              style={{ top: `${20 + i * 20}%`, background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.04), transparent)" }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "linear", delay: i * 1.2 }}
              aria-hidden="true"
            />
          ))}
        </motion.div>

        <motion.div className="max-w-3xl mx-auto relative z-10" variants={hc as any} initial="hidden" animate="visible">
          <motion.p variants={hi as any} className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-4">
            Evolution
          </motion.p>
          <motion.h1 className="text-5xl md:text-6xl font-black text-[#e2e8f0] mb-4 leading-tight" variants={hi as any}>
            {"OMNI Roadmap".split("").map((ch, i) => (
              <motion.span key={i} className="inline-block"
                initial={{ opacity: 0, y: 20, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.3 + i * 0.04 }}>
                {ch === " " ? "\u00a0" : ch}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p variants={hi as any} className="text-[#64748b] text-lg mb-4">
            The .omni programming language evolution
          </motion.p>
          <motion.p variants={hi as any} className="text-[#475569] max-w-xl mx-auto leading-relaxed">
            OMNI is on a mission to unify all programming into a single, safe, performant runtime.
            Here&apos;s what&apos;s been built and what&apos;s coming next.
          </motion.p>

          {/* Status legend */}
          <motion.div variants={hi as any} className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { label: "Released",    color: "#00ff88" },
              { label: "In Progress", color: "#00d4ff" },
              { label: "Planned",     color: "#a855f7" },
              { label: "Vision",      color: "#f59e0b" },
            ].map((s, si) => (
              <motion.div
                key={s.label}
                className="flex items-center gap-2 text-xs text-[#64748b]"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.7 + si * 0.08 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: s.color }}
                  animate={{ boxShadow: [`0 0 3px ${s.color}`, `0 0 10px ${s.color}`, `0 0 3px ${s.color}`] }}
                  transition={{ duration: 2, repeat: Infinity, delay: si * 0.4 }}
                />
                {s.label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Timeline ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-0">
          {VERSIONS.map((v, i) => (
            <RoadmapCard key={v.version} v={v} i={i} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 border-t border-white/[0.05] bg-[#0d1117]">
        <Reveal className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-black text-[#e2e8f0] mb-3">Want to contribute to the roadmap?</h2>
          <p className="text-[#64748b] mb-8 text-sm leading-relaxed">
            OMNI is open source. Open issues, submit PRs, or discuss ideas in the GitHub repository.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { href: "https://github.com/Cukurikik/Omni", label: "Contribute on GitHub", primary: true, external: true },
              { href: "/docs",                             label: "Read Documentation",   primary: false, external: false },
            ].map(btn => (
              <motion.a
                key={btn.href}
                href={btn.href}
                {...(btn.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`relative overflow-hidden flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl text-sm ${
                  btn.primary
                    ? "bg-[#00d4ff] text-[#080b12]"
                    : "border border-white/10 bg-white/[0.04] text-[#e2e8f0]"
                }`}
                whileHover={{
                  scale: 1.05,
                  y: -3,
                  boxShadow: btn.primary
                    ? "0 0 40px rgba(0,212,255,0.5), 0 8px 24px rgba(0,0,0,0.3)"
                    : "0 0 20px rgba(0,212,255,0.12), 0 8px 24px rgba(0,0,0,0.2)",
                  ...(btn.primary ? {} : { borderColor: "rgba(0,212,255,0.4)" }),
                }}
                whileTap={{ scale: 0.96, y: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 22 }}
              >
                {/* Shimmer sweep on hover */}
                <motion.div
                  className="absolute inset-0 -translate-x-full pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
                  whileHover={{ translateX: "100%" }}
                  transition={{ duration: 0.55 }}
                  aria-hidden="true"
                />
                {btn.primary && (
                  <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                )}
                <span className="relative z-10">{btn.label}</span>
              </motion.a>
            ))}
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.05] py-8 px-6 text-center">
        <motion.p className="text-[#334155] text-xs"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          &copy; {new Date().getFullYear()} OMNI Framework — Apache 2.0 License
        </motion.p>
      </footer>
    </div>
  )
}
