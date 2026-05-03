"use client"
import Link from "next/link"
import { useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "motion/react"
import OmniNav from "@/components/omni-nav"

/* ── data ─────────────────────────────────────────── */
const STATS = [
  { value: "15",    label: "Languages" },
  { value: "5",     label: "Domain Layers" },
  { value: "540+",  label: "NEXUS Packages" },
  { value: "<10ms", label: "Cold Start" },
  { value: "3-8MB", label: "Unikernel Size" },
]

const DOMAINS = [
  { name: "System",    desc: "Bare metal, memory management, crypto, GPU",    color: "#ef4444", langs: ["C","C++","Rust"] },
  { name: "Network",   desc: "HTTP servers, WebSocket, green threads",         color: "#f59e0b", langs: ["Go","JavaScript"] },
  { name: "Compute",   desc: "ML/AI, data science, numerical computing",       color: "#a855f7", langs: ["Python","Julia","R"] },
  { name: "Interface", desc: "Type-safe APIs, mobile apps, SSR",               color: "#00d4ff", langs: ["TypeScript","HTML","Swift"] },
  { name: "Business",  desc: "DDD, CQRS, GraphQL, routing",                   color: "#00ff88", langs: ["GraphQL","C#","Ruby","PHP"] },
]

const FEATURES = [
  { title: "Monadic Error Handling",  color: "#00d4ff", code: `fn get_user(id: String) -> Result<User, Error> {\n    let conn = db::connect()?\n    let user = conn.find(id)?\n    Ok(user)\n}` },
  { title: "Ownership & Borrowing",   color: "#00ff88", code: `let data = vec![1, 2, 3]  // owned\nlet sum = calculate(&data) // borrowed\nprocess(data)              // moved` },
  { title: "Language Annotations",    color: "#a855f7", code: `@rust\nfn encrypt(data: &[u8]) -> Vec<u8> { ... }\n\n@go\nfunc Serve(w http.ResponseWriter) { ... }` },
  { title: "Zero-Copy Interop",       color: "#f59e0b", code: `// Go calls Rust — zero copy:\nencrypted := omni_bridge::encrypt(body)\n// Result: ~50ns vs ~1ms for gRPC` },
]

/* ── shared spring ── */
const sp = { type: "spring", stiffness: 300, damping: 24 } as const

/* ── Reveal wrapper ── */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 24, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ── ScrollReveal with scale ── */
function RevealScale({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ── Code snippet ── */
function CodeSnippet({ code }: { code: string }) {
  const ref = useRef<HTMLPreElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.pre
      ref={ref}
      className="code-block text-xs mt-3 leading-relaxed overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {code.split("\n").map((line, i) => {
        let cls = "sh-var"
        if (line.startsWith("//"))       cls = "sh-cmt"
        else if (line.match(/^(fn |func |def )/)) cls = "sh-fn"
        else if (line.match(/^@\w+/))    cls = "sh-dec"
        else if (line.match(/\bResult\b|\bOk\b/)) cls = "sh-type"
        else if (line.match(/let |const /)) cls = "sh-kw"
        return (
          <motion.div
            key={i}
            className={cls}
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.04, duration: 0.3 }}
          >
            {line || "\u00a0"}
          </motion.div>
        )
      })}
    </motion.pre>
  )
}

export default function IntroPage() {
  /* scroll-linked parallax */
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -60])
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  /* stagger container */
  const heroContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  }
  const heroItem = {
    hidden:  { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <div className="min-h-screen bg-[#080b12] overflow-x-hidden">
      <OmniNav />

      {/* ── Hero ── */}
      <motion.section
        ref={heroRef}
        className="pt-32 pb-20 px-6 text-center radial-glow-bg relative"
        style={{ y: yParallax, opacity: opacityHero }}
      >
        {/* Floating background orbs */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {[
            { color: "rgba(0,212,255,0.06)", x: "20%",  y: "30%", size: 400, dur: 9  },
            { color: "rgba(168,85,247,0.05)", x: "70%",  y: "60%", size: 320, dur: 11 },
            { color: "rgba(0,255,136,0.04)", x: "50%",  y: "80%", size: 280, dur: 13 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size,
                background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)` }}
              animate={{ scale: [1, 1.18, 1], x: [0, 20 * (i % 2 === 0 ? 1 : -1), 0] }}
              transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
            />
          ))}
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto relative z-10"
          variants={heroContainer as any}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={heroItem as any} className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-4">
            Introduction
          </motion.p>

          {/* Split text headline */}
          <motion.h1 className="text-5xl md:text-6xl font-black text-[#e2e8f0] mb-4 leading-tight" variants={heroItem as any}>
            {"What is OMNI?".split("").map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 20, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 + i * 0.03 }}
              >
                {ch === " " ? "\u00a0" : ch}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p variants={heroItem as any} className="text-[#64748b] text-lg mb-12">
            A comprehensive introduction to the framework and language
          </motion.p>

          {/* Intro text card */}
          <motion.div
            variants={heroItem as any}
            className="text-left bg-[#0d1117] border border-white/[0.07] rounded-2xl p-7 mb-10"
            whileHover={{ borderColor: "rgba(0,212,255,0.2)", boxShadow: "0 0 30px rgba(0,212,255,0.06)" }}
            transition={{ duration: 0.3 }}
          >
            {[
              <>OMNI Framework is the world&apos;s first polylingual runtime — a revolutionary system that unifies{" "}<span className="text-[#e2e8f0] font-semibold">15 programming languages</span> into a single runtime powered by LLVM-Omni.</>,
              <>Instead of choosing one language, OMNI lets you use the best language for each domain within a single codebase — Rust for crypto, Go for HTTP, Python for ML — all in one{" "}<code className="text-[#00d4ff] bg-[#00d4ff]/10 px-1.5 py-0.5 rounded font-mono text-sm">.omni</code> file.</>,
              <>It also introduces the <span className="text-[#e2e8f0] font-semibold">OMNI Language</span> — a native language that combines Rust, TypeScript, and Go syntax with monadic error handling, ownership, and zero-copy cross-language interop.</>,
            ].map((para, i) => (
              <motion.p
                key={i}
                className="text-[#94a3b8] leading-relaxed mb-4 last:mb-0"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 260, damping: 22 }}
              >
                {para}
              </motion.p>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={heroItem as any}
            className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.06]"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="bg-[#0d1117] px-4 py-5 text-center"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.8 + i * 0.08 }}
                whileHover={{ backgroundColor: "rgba(0,212,255,0.04)" }}
              >
                <motion.div
                  className="text-2xl font-black text-[#00d4ff]"
                  style={{ textShadow: "0 0 20px rgba(0,212,255,0.5)" }}
                  animate={{ textShadow: ["0 0 10px rgba(0,212,255,0.3)", "0 0 30px rgba(0,212,255,0.7)", "0 0 10px rgba(0,212,255,0.3)"] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                >
                  {s.value}
                </motion.div>
                <div className="text-[#475569] text-xs mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Domains ── */}
      <section className="py-20 px-6 bg-[#0d1117] border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">Domain Architecture</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#e2e8f0]">15 Languages, 5 Domains</h2>
            <p className="text-[#64748b] mt-3">Each language belongs to a domain layer. Higher layers can call lower, never upward.</p>
          </Reveal>

          <div className="flex flex-col gap-3">
            {DOMAINS.map((d, i) => (
              <RevealScale key={d.name} delay={i * 0.07}>
                <motion.div
                  className="flex items-start gap-5 p-5 rounded-xl border transition-colors"
                  style={{ borderColor: `${d.color}20`, background: `${d.color}05` }}
                  whileHover={{
                    borderColor: `${d.color}45`,
                    background: `${d.color}0a`,
                    x: 4,
                    boxShadow: `0 0 20px ${d.color}12`,
                  }}
                  transition={sp}
                >
                  <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: d.color }}
                      animate={{ boxShadow: [`0 0 4px ${d.color}`, `0 0 14px ${d.color}`, `0 0 4px ${d.color}`] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                    {i < DOMAINS.length - 1 && (
                      <motion.div
                        className="w-px"
                        style={{ background: d.color, opacity: 0.2 }}
                        initial={{ height: 0 }}
                        whileInView={{ height: 32 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.08 + 0.3 }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap mb-1.5">
                      <span className="text-[#e2e8f0] font-bold">{d.name}</span>
                      <span className="text-[#64748b] text-sm">{d.desc}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.langs.map((l, li) => (
                        <motion.span
                          key={l}
                          className="text-xs px-2 py-0.5 rounded-full font-mono"
                          style={{ background: `${d.color}12`, color: d.color, border: `1px solid ${d.color}20` }}
                          initial={{ opacity: 0, scale: 0.7 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: "spring", stiffness: 350, damping: 22, delay: i * 0.07 + li * 0.06 }}
                          whileHover={{ scale: 1.1, background: `${d.color}22` }}
                        >
                          {l}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-3">The Language</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#e2e8f0]">The .omni Language</h2>
            <p className="text-[#64748b] mt-3">OMNI&apos;s native language combines the best ideas from Rust, TypeScript, and Go.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <RevealScale key={f.title} delay={i * 0.1}>
                <motion.div
                  className="rounded-xl border border-white/[0.07] bg-[#0d1117] p-6 h-full"
                  whileHover={{
                    borderColor: `${f.color}30`,
                    boxShadow: `0 8px 32px ${f.color}10`,
                    y: -3,
                  }}
                  transition={sp}
                >
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full mb-3"
                    style={{ background: f.color }}
                    animate={{ boxShadow: [`0 0 4px ${f.color}`, `0 0 16px ${f.color}`, `0 0 4px ${f.color}`] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  />
                  <h3 className="text-[#e2e8f0] font-bold mb-2">{f.title}</h3>
                  <CodeSnippet code={f.code} />
                </motion.div>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#0d1117] border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#e2e8f0] mb-3">Start Your Journey</h2>
            <p className="text-[#64748b]">Everything you need to become a polylingual developer.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: "/docs/quick-start",    title: "Quick Start",      desc: "Install and write your first program",           color: "#00d4ff" },
              { href: "/docs/language-guide", title: "Language Docs",    desc: "Complete syntax and type system reference",      color: "#00ff88" },
              { href: "/playground",          title: "Playground",       desc: "Try OMNI in the browser — no install needed",    color: "#a855f7" },
              { href: "/docs/architecture",   title: "Architecture",     desc: "How the UAST pipeline works end-to-end",         color: "#f59e0b" },
            ].map((card, i) => (
              <RevealScale key={card.href} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4, boxShadow: `0 12px 30px ${card.color}15` }} transition={sp}>
                  <Link href={card.href} className="group block rounded-xl border border-white/[0.07] bg-[#0d1117] p-6 hover:bg-[#111827] transition-colors">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full mb-3"
                      style={{ background: card.color }}
                      animate={{ boxShadow: [`0 0 4px ${card.color}`, `0 0 12px ${card.color}`, `0 0 4px ${card.color}`] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                    />
                    <h3 className="text-[#e2e8f0] font-bold mb-1">{card.title}</h3>
                    <p className="text-[#64748b] text-sm">{card.desc}</p>
                    <motion.div
                      className="mt-4 flex items-center gap-1 text-xs font-semibold"
                      style={{ color: card.color }}
                      animate={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={sp}
                    >
                      Learn more
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </motion.div>
                  </Link>
                </motion.div>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] py-8 px-6 text-center">
        <motion.p
          className="text-[#334155] text-xs"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          &copy; {new Date().getFullYear()} OMNI Framework — Apache 2.0 License
        </motion.p>
      </footer>
    </div>
  )
}
