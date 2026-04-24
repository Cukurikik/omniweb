"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "motion/react"

/* ── Constants ───────────────────────────────────────────── */
const LANG_COLORS: Record<string, string> = {
  Rust: "#ef4444", Go: "#00d4ff", Python: "#f59e0b", TypeScript: "#3178c6",
  "C++": "#00ff88", Julia: "#a855f7", Swift: "#ff7043", GraphQL: "#e535ab",
  "C#": "#9b59b6", Ruby: "#cc342d", PHP: "#8892be", R: "#2166ac",
  HTML: "#e44d26", C: "#A8B9CC", WASM: "#654ff0",
}

const LANG_CATEGORIES = [
  { id: "rust",   label: "Rust",       count: 112, desc: "Memory-safe systems" },
  { id: "go",     label: "Go",         count: 98,  desc: "Concurrent networking" },
  { id: "python", label: "Python",     count: 87,  desc: "ML & data science" },
  { id: "ts",     label: "TypeScript", count: 76,  desc: "Type-safe APIs" },
  { id: "cpp",    label: "C++",        count: 54,  desc: "SIMD & GPU compute" },
  { id: "julia",  label: "Julia",      count: 31,  desc: "Scientific computing" },
  { id: "swift",  label: "Swift",      count: 28,  desc: "iOS / macOS native" },
  { id: "gql",    label: "GraphQL",    count: 22,  desc: "Schema-first APIs" },
  { id: "csharp", label: "C#",         count: 19,  desc: "DDD / enterprise" },
  { id: "ruby",   label: "Ruby",       count: 17,  desc: "Rapid prototyping" },
  { id: "php",    label: "PHP",        count: 14,  desc: "Legacy web compat" },
  { id: "r",      label: "R",          count: 12,  desc: "Statistical analysis" },
  { id: "html",   label: "HTML",       count: 10,  desc: "WASM-GC DOM ops" },
  { id: "c",      label: "C",          count: 9,   desc: "Bare-metal systems" },
  { id: "wasm",   label: "WASM",       count: 8,   desc: "Cross-platform bytecode" },
]

const ALL_EVENTS = [
  { pkg: "omni-tensor",      version: "v1.2.0", author: "@system",    lang: "Python",     size: "4.1 MB",  stars: 2341, downloads: "18K/day" },
  { pkg: "omni-http3",       version: "v3.1.4", author: "@axv",       lang: "Go",         size: "812 KB",  stars: 1820, downloads: "14K/day" },
  { pkg: "omni-crypto-rs",   version: "v2.0.1", author: "@m0unt4in",  lang: "Rust",       size: "2.2 MB",  stars: 1540, downloads: "11K/day" },
  { pkg: "omni-gql",         version: "v1.0.9", author: "@prism",     lang: "GraphQL",    size: "340 KB",  stars: 820,  downloads: "6K/day"  },
  { pkg: "omni-ts-sdk",      version: "v4.5.0", author: "@nexus",     lang: "TypeScript", size: "1.1 MB",  stars: 3102, downloads: "24K/day" },
  { pkg: "omni-julia-ml",    version: "v0.9.2", author: "@deepv",     lang: "Julia",      size: "8.4 MB",  stars: 610,  downloads: "3K/day"  },
  { pkg: "omni-wasm-rt",     version: "v1.1.0", author: "@edge",      lang: "WASM",       size: "640 KB",  stars: 470,  downloads: "4K/day"  },
  { pkg: "omni-swift-kit",   version: "v2.3.0", author: "@apple-oss", lang: "Swift",      size: "3.2 MB",  stars: 890,  downloads: "5K/day"  },
  { pkg: "omni-r-stats",     version: "v0.4.1", author: "@datax",     lang: "R",          size: "5.7 MB",  stars: 310,  downloads: "2K/day"  },
  { pkg: "omni-simd-cpp",    version: "v1.3.0", author: "@avx512",    lang: "C++",        size: "1.8 MB",  stars: 750,  downloads: "5K/day"  },
  { pkg: "omni-csharp-ddd",  version: "v2.1.0", author: "@enterprise","lang": "C#",       size: "920 KB",  stars: 430,  downloads: "3K/day"  },
  { pkg: "omni-ruby-orm",    version: "v1.0.0", author: "@compat",    lang: "Ruby",       size: "480 KB",  stars: 280,  downloads: "1K/day"  },
]

const FEATURED = [
  { name: "omni-ts-sdk",    lang: "TypeScript", version: "v4.5.0", deps: 3102, size: "1.1 MB",  color: "#3178c6", weeklyDl: "168K", license: "MIT",     desc: "Official OMNI TypeScript SDK. Full type inference, Zod schemas, tree-shakeable ESM output. Zero runtime overhead." },
  { name: "omni-http3",     lang: "Go",         version: "v3.1.4", deps: 1820, size: "812 KB",  color: "#00d4ff", weeklyDl: "98K",  license: "Apache-2", desc: "HTTP/3 server with zero-alloc routing, QUIC transport, and 10M concurrent goroutine-threads." },
  { name: "omni-tensor",    lang: "Python",     version: "v1.2.0", deps: 2341, size: "4.1 MB",  color: "#f59e0b", weeklyDl: "126K", license: "MIT",     desc: "SIMD-optimized tensor ops via LLVM-Omni vectorization. NumPy drop-in, 4x faster on ARM64." },
  { name: "omni-crypto-rs", lang: "Rust",       version: "v2.0.1", deps: 1540, size: "2.2 MB",  color: "#ef4444", weeklyDl: "77K",  license: "MIT",     desc: "Constant-time AES-256-GCM, ChaCha20-Poly1305, Ed25519. Formally verified with Fiat Crypto." },
]

/* ── Ticker item ─────────────────────────────────────────── */
function TickerItem({ ev, idx }: { ev: typeof ALL_EVENTS[0]; idx: number }) {
  const c = LANG_COLORS[ev.lang] ?? "#64748b"
  return (
    <motion.div
      layout
      className="flex items-center gap-2.5 px-4 py-2 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
      initial={{ opacity: 0, x: -16, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28, delay: idx * 0.03 }}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: c }}
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.4, 1] }}
        transition={{ duration: 1.8 + idx * 0.2, repeat: Infinity }}
        aria-hidden="true"
      />
      <span className="font-mono text-[11px] font-semibold text-[#00ff88] group-hover:text-white transition-colors truncate">
        {ev.pkg}
      </span>
      <span className="font-mono text-[10px] text-[#1e293b] flex-shrink-0">{ev.version}</span>
      <span
        className="font-mono text-[9px] px-1.5 py-0.5 rounded flex-shrink-0"
        style={{ background: `${c}14`, color: c, border: `1px solid ${c}20` }}
      >
        {ev.lang}
      </span>
      <span className="font-mono text-[10px] text-[#334155] truncate">published by {ev.author}</span>
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        <span className="font-mono text-[9px] text-[#1e293b]">{ev.size}</span>
        <span className="font-mono text-[9px] text-[#334155]">{ev.downloads}</span>
      </div>
    </motion.div>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function RegistryExplorer() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView  = useInView(wrapRef, { once: true, margin: "-80px 0px" })

  const [query,        setQuery]        = useState("")
  const [cmdOpen,      setCmdOpen]      = useState(false)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [selectedPkg,  setSelectedPkg]  = useState<typeof FEATURED[0] | null>(null)
  const [tickerList,   setTickerList]   = useState(ALL_EVENTS.slice(0, 6))
  const [tickIdx,      setTickIdx]      = useState(6)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Fuzzy filter */
  const filtered = query
    ? LANG_CATEGORIES.filter(l =>
        l.label.toLowerCase().includes(query.toLowerCase()) ||
        l.id.includes(query.toLowerCase()) ||
        l.desc.toLowerCase().includes(query.toLowerCase())
      )
    : LANG_CATEGORIES

  /* Ticker refresh every 2.6s */
  useEffect(() => {
    const id = setInterval(() => {
      setTickerList(prev => {
        const next = [...prev]
        next.pop()
        next.unshift(ALL_EVENTS[tickIdx % ALL_EVENTS.length])
        return next
      })
      setTickIdx(i => i + 1)
    }, 2600)
    return () => clearInterval(id)
  }, [tickIdx])

  /* ⌘K / Ctrl+K shortcut */
  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault(); setCmdOpen(o => !o)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
    if (e.key === "Escape") { setCmdOpen(false); setQuery("") }
  }, [])
  useEffect(() => {
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onKey])

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
          style={{ background: "rgba(0,212,255,0.02)" }}>
          <div className="flex gap-1.5" aria-hidden="true">
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#334155]">OMNI-NEXUS Registry</span>
          <div className="ml-auto flex items-center gap-3">
            <motion.span className="text-[10px] font-mono text-[#00ff88]"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }}>
              540 packages
            </motion.span>
            <span className="text-[#1e293b] text-xs">·</span>
            <span className="text-[10px] font-mono text-[#334155]">15 ecosystems</span>
          </div>
        </div>

        {/* ── ⌘K Search bar ── */}
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <motion.button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.015] text-left"
            onClick={() => { setCmdOpen(true); setTimeout(() => inputRef.current?.focus(), 60) }}
            whileHover={{ borderColor: "rgba(0,212,255,0.22)", backgroundColor: "rgba(0,212,255,0.025)" }}
            transition={{ duration: 0.18 }}
          >
            <svg className="w-3.5 h-3.5 text-[#334155] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="flex-1 text-[12px] font-mono text-[#334155]">Search 540 packages across 15 languages…</span>
            <div className="flex items-center gap-1">
              <kbd className="text-[9px] font-mono text-[#1e293b] border border-white/[0.06] px-1.5 py-0.5 rounded">⌘</kbd>
              <kbd className="text-[9px] font-mono text-[#1e293b] border border-white/[0.06] px-1.5 py-0.5 rounded">K</kbd>
            </div>
          </motion.button>
        </div>

        {/* ── Command palette overlay ── */}
        <AnimatePresence>
          {cmdOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setCmdOpen(false); setQuery("") }}
              />
              <motion.div
                className="fixed left-1/2 top-[16%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-white/[0.12] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                style={{ background: "rgba(7,10,16,0.99)" }}
                initial={{ opacity: 0, scale: 0.90, y: -24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.90, y: -24 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                role="dialog" aria-label="Package search"
              >
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
                  <svg className="w-4 h-4 text-[#00d4ff] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search packages, languages, authors…"
                    className="flex-1 bg-transparent text-[13px] font-mono text-[#e2e8f0] placeholder-[#334155] outline-none"
                    autoComplete="off" spellCheck={false}
                  />
                  <button
                    className="text-[10px] font-mono text-[#334155] border border-white/[0.06] px-2 py-1 rounded hover:text-[#e2e8f0] transition-colors"
                    onClick={() => { setCmdOpen(false); setQuery("") }}
                  >
                    ESC
                  </button>
                </div>

                {/* Results */}
                <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
                  {filtered.length === 0 ? (
                    <div className="px-4 py-10 text-center text-[12px] font-mono text-[#334155]">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    <>
                      <div className="px-4 pt-2.5 pb-1.5 text-[9px] font-mono text-[#334155] uppercase tracking-widest">
                        Language Categories &mdash; {filtered.length} of 15
                      </div>
                      {filtered.map((l, i) => {
                        const c = LANG_COLORS[l.label] ?? "#64748b"
                        return (
                          <motion.button
                            key={l.id}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.025 }}
                            onClick={() => { setSelectedLang(l.id); setCmdOpen(false); setQuery("") }}
                            whileHover={{ x: 4 }}
                          >
                            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold font-mono flex-shrink-0"
                              style={{ background: `${c}18`, color: c, border: `1px solid ${c}25` }}>
                              {l.label[0]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-mono text-[#e2e8f0]">{l.label}</div>
                              <div className="text-[9px] font-mono text-[#334155]">{l.desc}</div>
                            </div>
                            <span className="text-[11px] font-mono text-[#475569]">{l.count}</span>
                            <span className="text-[9px] font-mono text-[#1e293b]">pkgs</span>
                          </motion.button>
                        )
                      })}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.05]"
                  style={{ background: "rgba(0,0,0,0.3)" }}>
                  <span className="text-[9px] font-mono text-[#1e293b]">↑↓ navigate</span>
                  <span className="text-[9px] font-mono text-[#1e293b]">↵ select</span>
                  <span className="text-[9px] font-mono text-[#1e293b]">ESC close</span>
                  <span className="ml-auto text-[9px] font-mono text-[#1e293b]">OMNI-NEXUS v2.0</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content grid ── */}
        <div className="grid lg:grid-cols-[1fr_260px]">
          {/* Left column */}
          <div className="border-r border-white/[0.05] min-w-0">

            {/* Live ticker */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]"
              style={{ background: "rgba(0,255,136,0.015)" }}>
              <motion.span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] flex-shrink-0"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}
                aria-hidden="true" />
              <span className="text-[9px] font-mono text-[#475569] uppercase tracking-wider">Live Publish Feed</span>
              <span className="ml-auto text-[9px] font-mono text-[#1e293b]">every 2.6s</span>
            </div>
            <div className="overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                {tickerList.map((ev, i) => (
                  <TickerItem key={`${ev.pkg}${ev.version}${i}`} ev={ev} idx={i} />
                ))}
              </AnimatePresence>
            </div>

            {/* Featured packages */}
            <div className="px-4 py-3 border-t border-white/[0.04]">
              <div className="text-[9px] font-mono text-[#334155] uppercase tracking-widest mb-3">
                Featured Packages
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {FEATURED.map(pkg => {
                  const isSelected = selectedPkg?.name === pkg.name
                  return (
                    <motion.button
                      key={pkg.name}
                      className="flex items-start gap-3 p-3 rounded-xl border text-left w-full"
                      style={{
                        borderColor: isSelected ? `${pkg.color}45` : "rgba(255,255,255,0.05)",
                        background:  isSelected ? `${pkg.color}08`  : "rgba(255,255,255,0.01)",
                      }}
                      whileHover={{ borderColor: `${pkg.color}30`, background: `${pkg.color}05` }}
                      onClick={() => setSelectedPkg(isSelected ? null : pkg)}
                      transition={{ duration: 0.18 }}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono flex-shrink-0"
                        style={{ background: `${pkg.color}18`, color: pkg.color, border: `1px solid ${pkg.color}25` }}
                      >
                        {pkg.lang[0]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-mono font-semibold text-[#e2e8f0] truncate">{pkg.name}</span>
                          <span className="text-[9px] font-mono text-[#1e293b] flex-shrink-0">{pkg.version}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-[#475569]">
                          <span>{pkg.deps.toLocaleString()} deps</span>
                          <span className="text-[#1e293b]">·</span>
                          <span>{pkg.weeklyDl}/wk</span>
                          <span className="text-[#1e293b]">·</span>
                          <span>{pkg.size}</span>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selectedPkg && (
                <motion.div
                  className="border-t border-white/[0.05] px-4 py-4"
                  style={{ background: `${selectedPkg.color}06` }}
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] font-mono font-bold text-[#e2e8f0]">{selectedPkg.name}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                          style={{ background: `${selectedPkg.color}18`, color: selectedPkg.color, border: `1px solid ${selectedPkg.color}25` }}>
                          {selectedPkg.lang}
                        </span>
                        <span className="text-[9px] font-mono text-[#334155] border border-white/[0.07] px-2 py-0.5 rounded-full">
                          {selectedPkg.license}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#64748b] leading-relaxed">{selectedPkg.desc}</p>
                    </div>
                    <div className="flex flex-col gap-3 flex-shrink-0 text-right">
                      {[
                        { label: "Dependents", val: selectedPkg.deps.toLocaleString() },
                        { label: "Weekly DL",  val: selectedPkg.weeklyDl },
                        { label: "Bundle Size",val: selectedPkg.size },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="text-[12px] font-mono font-bold text-[#e2e8f0]">{s.val}</div>
                          <div className="text-[9px] font-mono text-[#334155] uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column — category list */}
          <div className="px-4 py-3">
            <div className="text-[9px] font-mono text-[#334155] uppercase tracking-widest mb-3">
              All Categories
            </div>
            <div className="flex flex-col gap-1">
              {LANG_CATEGORIES.map(l => {
                const c   = LANG_COLORS[l.label] ?? "#64748b"
                const pct = (l.count / 112) * 100
                const isSel = selectedLang === l.id
                return (
                  <motion.button
                    key={l.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left w-full relative overflow-hidden"
                    style={{
                      background: isSel ? `${c}10` : "transparent",
                      border: `1px solid ${isSel ? `${c}28` : "transparent"}`,
                    }}
                    whileHover={{ background: `${c}08`, x: 2 }}
                    onClick={() => setSelectedLang(s => s === l.id ? null : l.id)}
                    transition={{ duration: 0.14 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} aria-hidden="true" />
                    <span className="text-[11px] font-mono text-[#64748b] flex-1">{l.label}</span>
                    <span className="text-[10px] font-mono text-[#334155] mr-2">{l.count}</span>
                    {/* Mini bar */}
                    <div className="w-12 h-1 rounded-full overflow-hidden bg-white/[0.04] flex-shrink-0">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: c }}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${pct}%` } : { width: 0 }}
                        transition={{ duration: 0.9, delay: 0.1 }}
                      />
                    </div>
                  </motion.button>
                )
              })}
            </div>
            {/* Total */}
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#334155]">Total packages</span>
              <motion.span
                className="text-[12px] font-mono font-bold text-[#00d4ff]"
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}
              >
                540+
              </motion.span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-5 px-5 py-2.5 border-t border-white/[0.04]"
          style={{ background: "rgba(0,0,0,0.25)" }}>
          <span className="text-[9px] font-mono text-[#1e293b]">nexus.omni-lang.dev</span>
          <span className="text-[#1e293b] text-xs">·</span>
          <span className="text-[9px] font-mono text-[#1e293b]">Replaces npm · Cargo · PyPI · RubyGems</span>
          <div className="ml-auto flex items-center gap-1.5">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} aria-hidden="true" />
            <span className="text-[9px] font-mono text-[#334155]">registry healthy</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
