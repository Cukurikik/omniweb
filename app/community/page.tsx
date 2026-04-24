"use client"
import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
} from "motion/react"
import OmniNav from "@/components/omni-nav"

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const VIDEOS = [
  { id: 1, title: "OMNI in 15 Minutes",          duration: "15:22", views: "48.2K", level: "Beginner",     thumb: "https://placehold.co/480x270?text=OMNI+in+15+Minutes+Getting+Started+Tutorial", topic: "Intro" },
  { id: 2, title: "Polyglot HTTP Server",         duration: "22:41", views: "31.5K", level: "Intermediate", thumb: "https://placehold.co/480x270?text=Polyglot+HTTP+Server+Rust+Go+OMNI+Network+Tutorial", topic: "Network" },
  { id: 3, title: "ML Pipeline with Python+Rust", duration: "38:17", views: "24.8K", level: "Advanced",     thumb: "https://placehold.co/480x270?text=ML+Pipeline+Python+Rust+OMNI+Compute+Tutorial", topic: "Compute" },
  { id: 4, title: "OMNI-NEXUS Package System",    duration: "18:04", views: "19.3K", level: "Beginner",     thumb: "https://placehold.co/480x270?text=OMNI+NEXUS+Package+Registry+System+Tutorial", topic: "Toolchain" },
  { id: 5, title: "Zero-Copy Bridges Deep Dive",  duration: "27:55", views: "16.1K", level: "Advanced",     thumb: "https://placehold.co/480x270?text=Zero+Copy+Bridges+Deep+Dive+OMNI+Advanced", topic: "Core" },
  { id: 6, title: "Unikernel Deployment",         duration: "14:30", views: "12.7K", level: "Intermediate", thumb: "https://placehold.co/480x270?text=Unikernel+Deployment+OMNI+Cloud+Production", topic: "Deploy" },
  { id: 7, title: "Type System & Ownership",      duration: "31:09", views: "10.4K", level: "Advanced",     thumb: "https://placehold.co/480x270?text=Type+System+Ownership+OMNI+Language+Guide", topic: "Language" },
  { id: 8, title: "Building a REST API",          duration: "25:48", views: "9.8K",  level: "Intermediate", thumb: "https://placehold.co/480x270?text=Building+REST+API+OMNI+Go+Rust+TypeScript", topic: "Network" },
  { id: 9, title: "OMNI vs Traditional Stacks",   duration: "11:22", views: "8.2K",  level: "Beginner",     thumb: "https://placehold.co/480x270?text=OMNI+vs+Traditional+Polyglot+Stacks+Comparison", topic: "Intro" },
]
const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#00ff88", Intermediate: "#f59e0b", Advanced: "#ef4444",
}

const TAGS = ["All", "Basics", "Language", "Network", "System", "Compute", "ML", "Crypto", "CLI", "WASM"]
const VIDEO_TOPICS = ["All", "Intro", "Network", "Compute", "Toolchain", "Core", "Deploy", "Language"]

type Example = {
  id: number; title: string; category: string; desc: string; author: string; likes: number; code: string
}
const EXAMPLES: Example[] = [
  { id: 1, title: "Hello World",          category: "Basics",   desc: "Your first OMNI program",          author: "OMNI Team",    likes: 342, code: `module hello\n\nfn main() {\n    println("Hello from OMNI!")\n    let answer = 6 * 7\n    println("The answer is: {answer}")\n}` },
  { id: 2, title: "Polylingual Crypto",   category: "System",   desc: "Rust encryption + Go HTTP serving", author: "rust_dev",     likes: 312, code: `module crypto_demo\n\n@rust\nfn hash_sha256(data: &[u8]) -> [u8; 32] {\n    use sha2::{Sha256, Digest};\n    let mut hasher = Sha256::new();\n    hasher.update(data);\n    hasher.finalize().into()\n}` },
  { id: 3, title: "ML Sentiment",        category: "Compute",  desc: "Python ML inference via bridge",    author: "ml_engineer",  likes: 278, code: `module sentiment\n\n@python\ndef analyze_sentiment(text):\n    from transformers import pipeline\n    classifier = pipeline("sentiment-analysis")\n    return classifier(text)[0]` },
  { id: 4, title: "HTTP Server",         category: "Network",  desc: "Simple Go service with routes",     author: "Cukurikik",    likes: 256, code: `module server\n\n@go\nservice API on :8080 {\n    get "/hello" -> hello\n    get "/health" -> health\n}` },
  { id: 5, title: "Error Handling",      category: "Basics",   desc: "Result monad and ? operator",       author: "safe_dev",     likes: 201, code: `module errors\n\nfn get_user(id: String) -> Result<User, AppError> {\n    let conn = db::connect()?\n    let user = conn.find("users", id)?;\n    Ok(user)\n}` },
  { id: 6, title: "Todo CRUD API",       category: "Network",  desc: "Full REST API with database",       author: "web_dev",      likes: 195, code: `module todo_api\nuse omni-db::{Connection}\n\nstruct Todo { id: UUID, title: String, done: Bool }` },
  { id: 7, title: "Fibonacci Iterator",  category: "Language", desc: "Custom iterator implementation",    author: "dev_alice",    likes: 189, code: `module fibonacci\n\nstruct Fib { a: Int, b: Int }\n\nimpl Iterator for Fib {\n    type Item = Int\n    fn next(mut self) -> Option<Int> { ... }\n}` },
  { id: 8, title: "WebSocket Chat",      category: "Network",  desc: "Real-time chat with channels",      author: "realtime_dev", likes: 167, code: `module chat\nuse omni-ws::{WebSocketServer, Connection}\n\nasync fn on_message(conn: Connection, msg: String) { ... }` },
  { id: 9, title: "Pattern Matching",    category: "Language", desc: "Enums and match expressions",       author: "fp_lover",     likes: 143, code: `module patterns\n\nenum Shape {\n    Circle(Float),\n    Rectangle(Float, Float),\n}\n\nfn area(shape: Shape) -> Float { match shape { ... } }` },
]

const TAG_COLORS: Record<string, string> = {
  Basics: "#00d4ff", Language: "#00ff88", Network: "#f59e0b",
  System: "#ef4444", Compute: "#a855f7", Tutorial: "#00d4ff",
}

const STATS = [
  { v: "3,200+", l: "Community Members" },
  { v: "540+",   l: "NEXUS Packages" },
  { v: "120+",   l: "Code Examples" },
  { v: "9",      l: "Video Tutorials" },
]

/* ═══════════════════════════════════════════════════════════
   ANIMATED STAT COUNTER
═══════════════════════════════════════════════════════════ */
function StatItem({ v, l, index }: { v: string; l: string; index: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px 0px" })

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 24, scale: 0.85 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: index * 0.1 }}
    >
      <motion.div
        className="text-3xl font-black text-[#00d4ff] mb-1"
        animate={inView ? { textShadow: ["0 0 0px rgba(0,212,255,0)", "0 0 30px rgba(0,212,255,0.6)", "0 0 20px rgba(0,212,255,0.4)"] } : {}}
        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
      >
        {v}
      </motion.div>
      <motion.div
        className="text-[#475569] text-xs"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.4 }}
      >
        {l}
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   VIDEO CARD
═══════════════════════════════════════════════════════════ */
function VideoCard({ v, index }: { v: typeof VIDEOS[0]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const x      = useMotionValue(0)
  const y      = useMotionValue(0)
  const rotX   = useTransform(y, [-60, 60], [6, -6])
  const rotY   = useTransform(x, [-80, 80], [-6, 6])
  const sX     = useSpring(rotX, { stiffness: 300, damping: 22 })
  const sY     = useSpring(rotY, { stiffness: 300, damping: 22 })

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left - rect.width  / 2)
    y.set(e.clientY - rect.top  - rect.height / 2)
  }, [x, y])
  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: sX, rotateY: sY, transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 32, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.06 }}
      whileHover={{ scale: 1.03 }}
      className="rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <motion.img
          src={v.thumb}
          alt={`${v.title} video tutorial thumbnail`}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 bg-[#080b12]/50"
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            className="w-14 h-14 rounded-full bg-[#00d4ff]/20 backdrop-blur border border-[#00d4ff]/40
              flex items-center justify-center"
            whileHover={{ scale: 1.18, backgroundColor: "rgba(0,212,255,0.35)", boxShadow: "0 0 24px rgba(0,212,255,0.5)" }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label={`Play ${v.title}`}
          >
            <svg className="w-6 h-6 text-[#00d4ff] ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.button>
        </div>
        {/* Badges */}
        <motion.div
          className="absolute bottom-3 right-3 bg-[#080b12]/80 text-[#e2e8f0] text-xs font-mono px-2 py-1 rounded"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: index * 0.06 + 0.3 }}
        >
          {v.duration}
        </motion.div>
        <motion.div
          className="absolute top-3 left-3"
          initial={{ opacity: 0, x: -8 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: index * 0.06 + 0.25 }}
        >
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold"
            style={{ color: LEVEL_COLORS[v.level], borderColor: `${LEVEL_COLORS[v.level]}40`, background: `${LEVEL_COLORS[v.level]}10` }}>
            {v.level}
          </span>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="text-[#475569] text-[10px] font-mono uppercase tracking-wider mb-1">{v.topic}</div>
        <h3 className="text-[#e2e8f0] font-bold text-sm mb-2 line-clamp-1">{v.title}</h3>
        <div className="flex items-center gap-3 text-[#475569] text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {v.views}
          </span>
          <span>{v.duration}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COPY BUTTON
═══════════════════════════════════════════════════════════ */
function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <motion.button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
      className="text-[#475569] hover:text-[#00d4ff] transition-colors text-xs flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:border-[#00d4ff]/20"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="copied" className="flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <svg className="w-3 h-3 text-[#00ff88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Copied
          </motion.span>
        ) : (
          <motion.span key="copy" className="flex items-center gap-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192" />
            </svg>
            Copy
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════
   LIKE BUTTON
═══════════════════════════════════════════════════════════ */
function LikeBtn({ initial }: { initial: number }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initial)
  const toggle = () => { setLiked(v => !v); setCount(c => liked ? c - 1 : c + 1) }
  return (
    <motion.button
      onClick={toggle}
      className="flex items-center gap-1.5 text-xs"
      style={{ color: liked ? "#00d4ff" : "#475569" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
    >
      <motion.svg
        className="w-4 h-4"
        fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        animate={{ scale: liked ? [1, 1.4, 1] : 1, rotate: liked ? [0, -15, 0] : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 14 }}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904" />
      </motion.svg>
      <motion.span
        key={count}
        className="tabular-nums"
        initial={{ y: liked ? -6 : 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {count}
      </motion.span>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════
   EXAMPLE CARD
═══════════════════════════════════════════════════════════ */
function ExampleCard({ ex, index, expanded, onToggle }: {
  ex: Example; index: number; expanded: boolean; onToggle: () => void
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const c      = TAG_COLORS[ex.category] ?? "#64748b"

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl border border-white/[0.07] bg-[#0d1117] flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.055 }}
      whileHover={{ y: -3, borderColor: `${c}20`, boxShadow: `0 8px 30px ${c}0a` }}
    >
      {/* Code preview */}
      <div className="relative">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
          <div className="flex gap-1.5" aria-hidden="true">
            {["#ff5f57", "#febc2e", "#28c840"].map((col, i) => (
              <motion.span
                key={col}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: col }}
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.055 + i * 0.04 + 0.2, type: "spring", stiffness: 400, damping: 18 }}
              />
            ))}
          </div>
          <CopyBtn code={ex.code} />
        </div>
        <motion.pre
          className="px-4 py-3 text-xs font-mono leading-5 text-[#64748b] overflow-hidden"
          style={{ background: "#080b12" }}
          animate={{ maxHeight: expanded ? 360 : 130 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          {ex.code}
        </motion.pre>
        <AnimatePresence>
          {!expanded && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, #0d1117)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Meta */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[#e2e8f0] font-bold text-sm">{ex.title}</h3>
            <p className="text-[#475569] text-xs mt-0.5">{ex.desc}</p>
          </div>
          <motion.span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 border"
            style={{ color: c, borderColor: `${c}30`, background: `${c}10` }}
            whileHover={{ scale: 1.08 }}
          >
            {ex.category}
          </motion.span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.05]">
          <span className="text-[#334155] text-xs">
            by <span className="text-[#475569]">{ex.author}</span>
          </span>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onToggle}
              className="text-xs text-[#334155] hover:text-[#00d4ff] transition-colors font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-expanded={expanded}
            >
              {expanded ? "collapse" : "expand"}
            </motion.button>
            <LikeBtn initial={ex.likes} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FILTER BAR
═══════════════════════════════════════════════════════════ */
function FilterBar({ options, active, onChange, counts }: {
  options: string[]; active: string; onChange: (v: string) => void; counts: (v: string) => number
}) {
  return (
    <div className="sticky top-14 z-30 bg-[#080b12]/95 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap gap-2 items-center">
        {options.map(t => (
          <motion.button
            key={t}
            onClick={() => onChange(t)}
            className="relative px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            style={{
              color:       active === t ? "#00d4ff" : "#475569",
              borderColor: active === t ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {active === t && (
              <motion.div
                layoutId="filter-pill"
                className="absolute inset-0 rounded-lg bg-[#00d4ff]/15"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">
              {t}
              <span className="ml-1.5 opacity-60">({counts(t)})</span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function CommunityPage() {
  const [activeTag,       setActiveTag]       = useState("All")
  const [expanded,        setExpanded]        = useState<number | null>(null)
  const [activeVidTopic,  setActiveVidTopic]  = useState("All")
  const [activeSection,   setActiveSection]   = useState<"tutorials" | "examples">("tutorials")

  const heroRef    = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })
  const { scrollYProgress } = useScroll()
  const scrollBarScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  const filteredEx  = activeTag       === "All" ? EXAMPLES : EXAMPLES.filter(e => e.category === activeTag)
  const filteredVid = activeVidTopic  === "All" ? VIDEOS   : VIDEOS.filter(v => v.topic === activeVidTopic)

  /* section switcher variants */
  const containerV = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  }
  const childV = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
  }

  return (
    <motion.div
      className="min-h-screen bg-[#080b12] overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Global scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 z-[9999] origin-left"
        style={{ scaleX: scrollBarScale, background: "linear-gradient(90deg, #00d4ff, #00ff88, #a855f7)" }}
        aria-hidden="true"
      />

      <OmniNav />

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden omni-grid">
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(0,212,255,0.09) 0%, transparent 60%)" }}
          aria-hidden="true"
        />

        <motion.div
          ref={heroRef}
          className="max-w-3xl mx-auto relative"
          variants={containerV}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          <motion.p variants={childV} className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-4">
            Community
          </motion.p>

          <motion.h1
            variants={childV}
            className="text-5xl md:text-7xl font-black text-[#e2e8f0] mb-5 leading-[1.05]"
          >
            Learn &amp;{" "}
            <motion.span
              className="gradient-text"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Build
            </motion.span>
          </motion.h1>

          <motion.p variants={childV} className="text-[#64748b] text-lg mb-10 leading-relaxed max-w-lg mx-auto">
            Video tutorials, community examples, and real-world code. Everything you need to master OMNI.
          </motion.p>

          {/* Section switcher */}
          <motion.div
            variants={childV}
            className="inline-flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 gap-1"
          >
            {(["tutorials", "examples"] as const).map(s => (
              <motion.button
                key={s}
                onClick={() => setActiveSection(s)}
                className="relative px-6 py-2.5 rounded-lg text-sm font-semibold capitalize"
                style={{ color: activeSection === s ? "#080b12" : "#64748b" }}
                whileHover={{ scale: activeSection === s ? 1 : 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {activeSection === s && (
                  <motion.div
                    layoutId="section-pill"
                    className="absolute inset-0 rounded-lg bg-[#00d4ff]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">
                  {s === "tutorials" ? "Video Tutorials" : "Code Examples"}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ VIDEO TUTORIALS ═══ */}
      <AnimatePresence mode="wait">
        {activeSection === "tutorials" && (
          <motion.div
            key="tutorials"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <FilterBar
              options={VIDEO_TOPICS}
              active={activeVidTopic}
              onChange={setActiveVidTopic}
              counts={t => t === "All" ? VIDEOS.length : VIDEOS.filter(v => v.topic === t).length}
            />

            <section className="py-10 px-6">
              <div className="max-w-6xl mx-auto">
                {/* Featured */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px 0px" }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                >
                  <p className="text-xs text-[#00d4ff] font-mono uppercase tracking-widest mb-2">Featured</p>
                  <h2 className="text-2xl font-black text-[#e2e8f0]">Start Here</h2>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-6 mb-12">
                  <motion.div
                    className="lg:col-span-3"
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <VideoCard v={VIDEOS[0]} index={0} />
                  </motion.div>

                  <motion.div
                    className="lg:col-span-2 flex flex-col gap-4"
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    {VIDEOS.slice(1, 4).map((v, i) => (
                      <motion.div
                        key={v.id}
                        className="rounded-xl border border-white/[0.07] bg-[#0d1117] overflow-hidden flex gap-3 p-3 group"
                        whileHover={{ x: 4, borderColor: "rgba(0,212,255,0.18)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      >
                        <div className="relative w-28 shrink-0 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                          <motion.img
                            src={v.thumb}
                            alt={`${v.title} thumbnail`}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.4 }}
                          />
                          <div className="absolute inset-0 bg-[#080b12]/40 flex items-center justify-center">
                            <motion.div
                              className="w-7 h-7 rounded-full bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center"
                              whileHover={{ scale: 1.2, backgroundColor: "rgba(0,212,255,0.35)" }}
                            >
                              <svg className="w-3 h-3 text-[#00d4ff] ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </motion.div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#475569] mb-1">{v.topic}</span>
                          <h4 className="text-[#e2e8f0] text-sm font-semibold line-clamp-2 mb-1">{v.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-[#334155]">
                            <span>{v.duration}</span><span>&middot;</span><span>{v.views} views</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Grid */}
                <motion.h2
                  className="text-xl font-black text-[#e2e8f0] mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {activeVidTopic === "All" ? "All Tutorials" : `${activeVidTopic} Tutorials`}
                  <span className="text-[#334155] text-sm font-normal ml-2">({filteredVid.length})</span>
                </motion.h2>

                <AnimatePresence mode="wait">
                  {filteredVid.length === 0 ? (
                    <motion.div key="empty-vid" className="text-center py-20"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-[#334155] text-sm">No tutorials for this topic yet.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeVidTopic}
                      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {filteredVid.map((v, i) => <VideoCard key={v.id} v={v} index={i} />)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        )}

        {/* ═══ CODE EXAMPLES ═══ */}
        {activeSection === "examples" && (
          <motion.div
            key="examples"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <FilterBar
              options={TAGS}
              active={activeTag}
              onChange={setActiveTag}
              counts={t => t === "All" ? EXAMPLES.length : EXAMPLES.filter(e => e.category === t).length}
            />

            <section className="py-10 px-6">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <h2 className="text-xl font-black text-[#e2e8f0]">
                    {activeTag === "All" ? "All Examples" : `${activeTag} Examples`}
                    <span className="text-[#334155] text-sm font-normal ml-2">({filteredEx.length})</span>
                  </h2>
                  <p className="text-[#475569] text-sm mt-1">Real-world OMNI code from the community. Copy, learn, remix.</p>
                </motion.div>

                <AnimatePresence mode="wait">
                  {filteredEx.length === 0 ? (
                    <motion.div key="empty-ex" className="text-center py-20"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-[#334155] text-sm">No examples in this category yet.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeTag}
                      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {filteredEx.map((ex, i) => (
                        <ExampleCard
                          key={ex.id}
                          ex={ex}
                          index={i}
                          expanded={expanded === ex.id}
                          onToggle={() => setExpanded(expanded === ex.id ? null : ex.id)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ STATS ═══ */}
      <section className="py-16 px-6 bg-[#0d1117] border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => <StatItem key={s.l} v={s.v} l={s.l} index={i} />)}
        </div>
      </section>

      {/* ═══ SUBMIT CTA ═══ */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <h2 className="text-3xl font-black text-[#e2e8f0] mb-4">Share your code</h2>
          <p className="text-[#64748b] text-sm mb-8 leading-relaxed">
            Built something interesting with OMNI? Submit your example and help the community learn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.a
              href="https://github.com/Cukurikik/Omni"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-2 bg-[#00d4ff] text-[#080b12] font-bold px-7 py-3.5 rounded-xl text-sm overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(0,212,255,0.45)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <motion.div
                className="absolute inset-0 -translate-x-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                whileHover={{ translateX: "100%" }}
                transition={{ duration: 0.5 }}
                aria-hidden="true"
              />
              <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="relative z-10">Submit on GitHub</span>
            </motion.a>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="/docs"
                className="border border-white/10 bg-white/[0.04] text-[#e2e8f0] font-semibold
                  px-7 py-3.5 rounded-xl text-sm hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/[0.05] transition-colors"
              >
                Explore Docs
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <motion.footer
        className="border-t border-white/[0.05] py-8 px-6 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-[#334155] text-xs">
          &copy; {new Date().getFullYear()} OMNI Framework &mdash; Apache 2.0 License
        </p>
      </motion.footer>
    </motion.div>
  )
}
