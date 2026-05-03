"use client"
import { useState, useMemo, useRef, useCallback } from "react"
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
} from "motion/react"
import OmniNav from "@/components/omni-nav"

/* ── Data ─────────────────────────────────────────────────── */
const CATEGORIES = ["All","HTTP","ML/AI","Database","Auth","Parser","Crypto","UI","Async","Systems"]

const PACKAGES = [
  { name:"@omni/go-http",           version:"3.2.1",   lang:"Go",         cat:"HTTP",     weekly:"2.3M", desc:"High-throughput HTTP/3 server and client. Green threads, zero allocations.",             stars:"4.1k" },
  { name:"@omni/python-torch",      version:"2.2.0",   lang:"Python",     cat:"ML/AI",    weekly:"1.8M", desc:"PyTorch integration with Singularity Tier GPU auto-offload.",                           stars:"6.7k" },
  { name:"@omni/python-bs4",        version:"4.12.3",  lang:"Python",     cat:"Parser",   weekly:"1.2M", desc:"BeautifulSoup4 HTML/XML parser bridged into OMNI via UAST DomainBridge.",              stars:"2.2k" },
  { name:"@omni/ts-zod",            version:"3.22.4",  lang:"TypeScript", cat:"Auth",     weekly:"980k", desc:"Zod schema validation with OMNI type inference and compile-time checks.",              stars:"3.5k" },
  { name:"@omni/rust-crypto",       version:"1.4.0",   lang:"Rust",       cat:"Crypto",   weekly:"870k", desc:"AES-256-GCM, ChaCha20, Ed25519, SHA-3. Zero-copy, constant-time.",                     stars:"5.1k" },
  { name:"@omni/python-numpy",      version:"1.26.0",  lang:"Python",     cat:"ML/AI",    weekly:"1.5M", desc:"NumPy SIMD-accelerated array ops. Auto-vectorized via LLVM-Omni passes.",              stars:"7.3k" },
  { name:"@omni/go-websocket",      version:"1.5.3",   lang:"Go",         cat:"HTTP",     weekly:"640k", desc:"WebSocket server with room-based pub/sub, heartbeats, backpressure.",                  stars:"1.8k" },
  { name:"@omni/rust-sqlx",         version:"0.7.4",   lang:"Rust",       cat:"Database", weekly:"720k", desc:"Async PostgreSQL, MySQL, SQLite with compile-time query validation.",                  stars:"4.4k" },
  { name:"@omni/ts-react",          version:"18.3.0",  lang:"TypeScript", cat:"UI",       weekly:"2.1M", desc:"React 18 with OMNI server components. Compiles to Interface layer primitives.",        stars:"9.2k" },
  { name:"@omni/rust-rayon",        version:"1.10.0",  lang:"Rust",       cat:"Systems",  weekly:"550k", desc:"Data-parallel iterators. Automatic thread pool, work stealing.",                       stars:"3.9k" },
  { name:"@omni/python-pandas",     version:"2.2.1",   lang:"Python",     cat:"ML/AI",    weekly:"1.1M", desc:"DataFrame operations bridged with Rust memory model for zero-copy slicing.",           stars:"5.8k" },
  { name:"@omni/go-grpc",           version:"1.62.0",  lang:"Go",         cat:"HTTP",     weekly:"430k", desc:"gRPC server/client with OMNI type-safe proto definitions.",                            stars:"2.6k" },
  { name:"@omni/rust-serde",        version:"1.0.197", lang:"Rust",       cat:"Parser",   weekly:"2.8M", desc:"Serialization framework. JSON, TOML, YAML, MessagePack — zero-copy deserialize.",      stars:"8.1k" },
  { name:"@omni/cs-aspnet",         version:"8.0.2",   lang:"C#",         cat:"HTTP",     weekly:"380k", desc:"ASP.NET Core bridged into OMNI Business layer. Razor, SignalR included.",              stars:"1.4k" },
  { name:"@omni/graphql-yoga",      version:"5.2.0",   lang:"GraphQL",    cat:"HTTP",     weekly:"290k", desc:"GraphQL server with OMNI schema generation from UAST type nodes.",                     stars:"2.0k" },
  { name:"@omni/python-sklearn",    version:"1.4.1",   lang:"Python",     cat:"ML/AI",    weekly:"890k", desc:"scikit-learn with OMNI compute layer. Auto-profiled hyperparameters.",                 stars:"4.2k" },
  { name:"@omni/rust-tokio",        version:"1.37.0",  lang:"Rust",       cat:"Async",    weekly:"1.6M", desc:"Async runtime with cooperative scheduling. 0.5us task switching overhead.",            stars:"6.5k" },
  { name:"@omni/ruby-rails",        version:"7.1.3",   lang:"Ruby",       cat:"HTTP",     weekly:"210k", desc:"Ruby on Rails in the OMNI Business layer. ActiveRecord with Rust SQL engine.",         stars:"1.1k" },
  { name:"@omni/ts-prisma",         version:"5.11.0",  lang:"TypeScript", cat:"Database", weekly:"680k", desc:"Prisma ORM with OMNI compile-time schema introspection.",                             stars:"3.1k" },
  { name:"@omni/go-jwt",            version:"5.2.1",   lang:"Go",         cat:"Auth",     weekly:"510k", desc:"JWT generation and validation. HMAC, RSA, ECDSA. Sub-microsecond verify.",             stars:"2.3k" },
  { name:"@omni/rust-wgpu",         version:"0.19.3",  lang:"Rust",       cat:"Systems",  weekly:"190k", desc:"WebGPU/Vulkan graphics and compute. Compiles to Interface layer shaders.",             stars:"4.7k" },
  { name:"@omni/python-langchain",  version:"0.1.12",  lang:"Python",     cat:"ML/AI",    weekly:"760k", desc:"LLM orchestration bridged to OMNI. Chain Go HTTP + Python LLM + Rust embed.",        stars:"5.3k" },
  { name:"@omni/go-fiber",          version:"2.52.2",  lang:"Go",         cat:"HTTP",     weekly:"330k", desc:"Express-inspired web framework on fasthttp. 50k req/s on a single core.",              stars:"2.9k" },
  { name:"@omni/rust-redis",        version:"0.25.3",  lang:"Rust",       cat:"Database", weekly:"410k", desc:"Async Redis client. Pipelining, pub/sub, cluster support.",                           stars:"1.9k" },
]

const LANG_COLORS: Record<string, string> = {
  Rust:"#ef4444", Go:"#00d4ff", Python:"#f59e0b", TypeScript:"#3b82f6",
  "C#":"#a855f7", GraphQL:"#e91e8c", Ruby:"#dc2626", C:"#94a3b8", "C++":"#f97316",
}

const STATS = [
  { label: "Total Packages",   value: "540+" },
  { label: "Languages",        value: "15" },
  { label: "Weekly Downloads", value: "18M+" },
  { label: "Zero Conflicts",   value: "100%" },
]

/* ── Tilt card wrapper ───────────────────────────────────── */
function PkgCard({ pkg, index }: { pkg: typeof PACKAGES[0]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const [installed, setInstalled] = useState(false)

  const x    = useMotionValue(0)
  const y    = useMotionValue(0)
  const rX   = useTransform(y, [-50, 50], [5, -5])
  const rY   = useTransform(x, [-70, 70], [-5, 5])
  const srX  = useSpring(rX, { stiffness: 300, damping: 22 })
  const srY  = useSpring(rY, { stiffness: 300, damping: 22 })

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - r.left - r.width  / 2)
    y.set(e.clientY - r.top  - r.height / 2)
  }, [x, y])
  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  const langColor = LANG_COLORS[pkg.lang] ?? "#64748b"

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srX, rotateY: srY, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: (index % 8) * 0.055 }}
      whileHover={{ scale: 1.03, y: -4, borderColor: `${langColor}30`, boxShadow: `0 12px 32px ${langColor}12` }}
      className="rounded-xl border border-white/[0.07] bg-[#0d1117] p-5 flex flex-col gap-3 cursor-default"
    >
      {/* Glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${langColor}08, transparent 70%)` }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-sm text-[#e2e8f0] font-semibold">{pkg.name}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-[#475569]">v{pkg.version}</span>
            <motion.span
              className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: `${langColor}18`, color: langColor }}
              whileHover={{ scale: 1.08 }}
            >
              {pkg.lang}
            </motion.span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-[#f59e0b] text-xs">
            <motion.svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, delay: index * 0.15, repeat: Infinity, repeatDelay: 8 }}
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </motion.svg>
            {pkg.stars}
          </div>
          <div className="text-[10px] text-[#334155] mt-0.5">{pkg.weekly}/wk</div>
        </div>
      </div>

      <p className="relative text-[#64748b] text-xs leading-relaxed flex-1">{pkg.desc}</p>

      <div className="relative flex items-center justify-between">
        <span className="text-[10px] border border-white/[0.05] text-[#475569] px-2 py-0.5 rounded font-mono">
          {pkg.cat}
        </span>
        <motion.button
          onClick={() => { setInstalled(true); setTimeout(() => setInstalled(false), 2200) }}
          className="relative text-xs font-mono overflow-hidden"
          style={{ color: installed ? "#00ff88" : "#00d4ff" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        >
          <AnimatePresence mode="wait">
            {installed ? (
              <motion.span key="done"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                installed
              </motion.span>
            ) : (
              <motion.span key="install"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                + install
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ── Stat tile ───────────────────────────────────────────── */
function StatTile({ label, value, index }: { label: string; value: string; index: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20px 0px" })
  return (
    <motion.div
      ref={ref}
      className="bg-[#0d1117] border border-white/[0.06] rounded-xl px-5 py-4 text-center"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: index * 0.08 }}
      whileHover={{ y: -3, borderColor: "rgba(0,212,255,0.2)" }}
    >
      <motion.div
        className="text-2xl font-black text-[#00d4ff]"
        animate={inView ? { textShadow: ["0 0 0px rgba(0,212,255,0)", "0 0 24px rgba(0,212,255,0.6)", "0 0 16px rgba(0,212,255,0.4)"] } : {}}
        transition={{ delay: index * 0.08 + 0.3, duration: 0.8 }}
      >
        {value}
      </motion.div>
      <div className="text-[#475569] text-xs mt-1">{label}</div>
    </motion.div>
  )
}

/* ── Filter button ───────────────────────────────────────── */
function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative text-xs px-3 py-1.5 rounded-lg border transition-colors"
      style={{
        color:       active ? "#00d4ff" : "#475569",
        borderColor: active ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)",
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {active && (
        <motion.div
          layoutId="pkg-filter-pill"
          className="absolute inset-0 rounded-lg bg-[#00d4ff]/15"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function PackagesPage() {
  const [query, setQuery] = useState("")
  const [cat,   setCat]   = useState("All")
  const [lang,  setLang]  = useState("All")

  const heroRef    = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })

  const langs    = ["All", ...Array.from(new Set(PACKAGES.map(p => p.lang))).sort()]
  const filtered = useMemo(() => PACKAGES.filter(p => {
    const q = query.toLowerCase()
    return (!q || p.name.includes(q) || p.desc.toLowerCase().includes(q))
      && (cat === "All" || p.cat === cat)
      && (lang === "All" || p.lang === lang)
  }), [query, cat, lang])

  const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  }
  const child = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
  }

  return (
    <div className="min-h-screen bg-[#080b12]">
      <OmniNav />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <motion.div
            ref={heroRef}
            className="text-center mb-14"
            variants={stagger as any}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
          >
            <motion.div
              variants={child as any}
              className="inline-flex items-center gap-2 text-xs text-[#00d4ff] font-mono bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-4 py-1.5 mb-6"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />
              OMNI-NEXUS Registry
            </motion.div>

            <motion.h1 variants={child as any} className="text-4xl md:text-5xl font-black text-[#e2e8f0] mb-4">
              <motion.span
                className="gradient-text"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                540+
              </motion.span>{" "}packages.<br />
              <span className="text-[#e2e8f0]">One registry.</span>
            </motion.h1>

            <motion.p variants={child as any} className="text-[#64748b] max-w-lg mx-auto">
              Replace npm, Cargo, PyPI, Maven, and RubyGems with OMNI-NEXUS.
              All packages resolve together without version conflicts.
            </motion.p>
          </motion.div>

          {/* ── Search + filters ── */}
          <motion.div
            className="mb-8 flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.3 }}
          >
            <div className="relative max-w-xl">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]"
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
              </svg>
              <motion.input
                type="text"
                placeholder="Search packages..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-white/[0.07] text-[#e2e8f0] placeholder-[#334155] text-sm px-10 py-3 rounded-xl focus:outline-none transition-all font-mono"
                whileFocus={{
                  borderColor: "rgba(0,212,255,0.4)",
                  boxShadow: "0 0 0 3px rgba(0,212,255,0.08)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <FilterBtn key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
                ))}
              </div>
              <motion.select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="bg-[#0d1117] border border-white/[0.07] text-[#475569] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00d4ff]/40 transition-colors"
                whileHover={{ borderColor: "rgba(0,212,255,0.3)" }}
              >
                {langs.map(l => <option key={l} value={l}>{l}</option>)}
              </motion.select>
              <motion.span
                className="text-[#334155] text-xs ml-auto"
                key={filtered.length}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {filtered.length} packages
              </motion.span>
            </div>
          </motion.div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {STATS.map((s, i) => <StatTile key={s.label} label={s.label} value={s.value} index={i} />)}
          </div>

          {/* ── Package grid ── */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                className="text-center py-24 text-[#334155]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <motion.svg
                  className="w-12 h-12 mx-auto mb-4 opacity-30"
                  fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
                </motion.svg>
                <p className="text-sm">No packages match &ldquo;{query}&rdquo;</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${cat}-${lang}-${query}`}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filtered.map((pkg, i) => <PkgCard key={pkg.name} pkg={pkg} index={i} />)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Install hint ── */}
          <motion.div
            className="mt-16 rounded-2xl border border-white/[0.07] bg-[#0d1117] p-8 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px 0px" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <h2 className="text-xl font-bold text-[#e2e8f0] mb-2">Install any package</h2>
            <p className="text-[#64748b] text-sm mb-6">
              Declare in{" "}
              <code className="text-[#00d4ff] bg-[#00d4ff]/10 px-1 rounded font-mono text-xs">Omnifile.toml</code>{" "}
              and NEXUS resolves cross-ecosystem dependencies automatically.
            </p>
            <motion.pre
              className="code-block max-w-md mx-auto text-xs text-left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
{`[dependencies]
"@omni/go-http"       = "3.2.1"
"@omni/python-torch"  = "2.2.0"
"@omni/rust-crypto"   = "1.4.0"
"@omni/ts-zod"        = "3.22.4"`}
            </motion.pre>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        className="border-t border-white/[0.05] bg-[#080b12] py-10 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 rounded-full border border-[#00d4ff]/50 orbit-cw" />
              <div className="absolute inset-[7px] rounded-full bg-[#00d4ff]" />
            </div>
            <span className="text-[#e2e8f0] font-bold">OMNI Framework</span>
          </motion.div>
          <p className="text-[#334155] text-xs">
            &copy; {new Date().getFullYear()} OMNI Framework. Apache 2.0 License.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
