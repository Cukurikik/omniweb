"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react"

const sp = { type: "spring", stiffness: 300, damping: 26 } as const

interface Package {
  id: string; name: string; version: string; description: string
  lang: string; downloads: number; stars: number; license: string
  verified: boolean; author: string; size: string; tags: string[]
}

const LANG_COLORS: Record<string, string> = {
  Rust: "#ef4444", Go: "#00d4ff", Python: "#f59e0b", TypeScript: "#3178c6",
  Julia: "#a855f7", "C++": "#00ff88", Swift: "#f97316", Multi: "#64748b",
}

type SortKey = "downloads" | "stars" | "name"

function PkgCard({ pkg, index }: { pkg: Package; index: number }) {
  const [installed, setInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)
  const mx  = useMotionValue(0); const my = useMotionValue(0)
  const rx  = useTransform(my, [-0.5, 0.5], [4, -4])
  const ry  = useTransform(mx, [-0.5, 0.5], [-4,  4])
  const srx = useSpring(rx, { stiffness: 160, damping: 20 })
  const sry = useSpring(ry, { stiffness: 160, damping: 20 })
  const color = LANG_COLORS[pkg.lang] ?? "#64748b"

  async function install() {
    if (installed) return
    setInstalling(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600))
    setInstalling(false)
    setInstalled(true)
  }

  return (
    <motion.div
      className="relative rounded-2xl border border-white/[0.07] p-5 overflow-hidden flex flex-col gap-4"
      style={{ background: "rgba(13,17,23,0.85)", rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ ...sp, delay: index * 0.05 }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top)  / r.height - 0.5)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      whileHover={{ borderColor: `${color}22`, boxShadow: `0 0 36px ${color}10, 0 8px 28px rgba(0,0,0,0.28)` }}
    >
      {/* top accent glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} aria-hidden="true" />

      {/* shimmer */}
      <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)" }}
        whileHover={{ translateX: "100%" }} transition={{ duration: 0.55 }} aria-hidden="true" />

      {/* header */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
            style={{ background: `${color}14`, color, border: `1.5px solid ${color}20` }}
            whileHover={{ scale: 1.1, rotate: 8 }} transition={sp}
          >
            {pkg.name.slice(0, 2).toUpperCase()}
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-bold text-[#e2e8f0] truncate">{pkg.name}</p>
              {pkg.verified && (
                <motion.svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "#00d4ff" }}
                  viewBox="0 0 20 20" fill="none"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  aria-label="Verified"
                >
                  <path d="M9 12l2 2 4-4M10 2l2.5 2H16l.6 3.3 2.4 1.7-1.5 3 1.5 3-2.4 1.7L16 17h-3.5L10 19l-2.5-2H4l-.6-3.3L1 12l1.5-3L1 6l2.4-1.7L4 1h3.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </motion.svg>
              )}
            </div>
            <p className="text-[10px] font-mono text-[#334155]">v{pkg.version} · {pkg.author}</p>
          </div>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono"
          style={{ color, background: `${color}10`, border: `1px solid ${color}18` }}>
          {pkg.lang}
        </span>
      </div>

      {/* description */}
      <p className="text-[11px] text-[#475569] leading-relaxed relative z-10 line-clamp-2">{pkg.description}</p>

      {/* tags */}
      <div className="flex flex-wrap gap-1.5 relative z-10">
        {pkg.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-md text-[9px] font-mono text-[#334155] border border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            #{tag}
          </span>
        ))}
      </div>

      {/* stats row */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-[#334155] relative z-10">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          {pkg.stars.toLocaleString()}
        </span>
        <span>↓ {pkg.downloads.toLocaleString()}</span>
        <span>{pkg.size}</span>
        <span className="ml-auto">{pkg.license}</span>
      </div>

      {/* install button */}
      <motion.button
        onClick={install}
        disabled={installing}
        className="relative overflow-hidden w-full py-2.5 rounded-xl text-[12px] font-bold z-10"
        style={installed
          ? { background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.25)" }
          : { background: `${color}10`, color, border: `1px solid ${color}22` }}
        whileHover={!installed && !installing ? { scale: 1.02, boxShadow: `0 0 20px ${color}20` } : {}}
        whileTap={!installed && !installing ? { scale: 0.97 } : {}}
        transition={sp}
        aria-label={installed ? "Package installed" : `Install ${pkg.name}`}
      >
        <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }}
          whileHover={{ translateX: "100%" }} transition={{ duration: 0.5 }} aria-hidden="true" />
        <AnimatePresence mode="wait">
          {installing ? (
            <motion.span key="ing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Installing…
            </motion.span>
          ) : installed ? (
            <motion.span key="ed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Installed
            </motion.span>
          ) : (
            <motion.span key="install" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              omni add {pkg.name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

export default function PackagesPage() {
  const [pkgs,    setPkgs]   = useState<Package[]>([])
  const [loading, setLoad]   = useState(true)
  const [q,       setQ]      = useState("")
  const [langF,   setLangF]  = useState("all")
  const [sort,    setSort]   = useState<SortKey>("downloads")

  useEffect(() => {
    fetch("/api/packages")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setPkgs(d?.packages ?? []); setLoad(false) })
      .catch(() => setLoad(false))
  }, [])

  const langs   = ["all", ...Array.from(new Set(pkgs.map(p => p.lang)))]
  const filtered = pkgs
    .filter(p => (langF === "all" || p.lang === langF)
                && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => sort === "name"
      ? a.name.localeCompare(b.name)
      : (b[sort] as number) - (a[sort] as number))

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* header */}
      <motion.div className="flex items-center justify-between"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={sp}>
        <div>
          <h1 className="text-2xl font-black text-[#e2e8f0]">Packages</h1>
          <p className="text-[#475569] text-sm font-mono mt-0.5">
            {pkgs.length} packages · OMNI-NEXUS Registry
          </p>
        </div>
        <motion.div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#00d4ff]/18 bg-[#00d4ff]/05 text-[10px] font-mono text-[#00d4ff]"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} aria-hidden="true" />
          NEXUS online
        </motion.div>
      </motion.div>

      {/* search + filters */}
      <motion.div className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...sp, delay: 0.06 }}>
        <motion.input
          type="text" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search packages, libraries, bindings…"
          className="flex-1 bg-[#0d1117]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#e2e8f0] placeholder-[#334155] outline-none font-mono"
          whileFocus={{ borderColor: "rgba(0,212,255,0.4)", boxShadow: "0 0 0 3px rgba(0,212,255,0.08)" }}
          transition={{ duration: 0.18 }}
        />
        {/* sort */}
        <div className="flex items-center gap-1 bg-[#0d1117]/60 border border-white/[0.07] rounded-xl p-1">
          {(["downloads", "stars", "name"] as SortKey[]).map(s => (
            <motion.button key={s} onClick={() => setSort(s)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-mono capitalize ${sort===s?"text-[#00d4ff]":"text-[#475569]"}`}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              {sort===s && (
                <motion.div layoutId="pkg-sort-bg"
                  className="absolute inset-0 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/25"
                  transition={{ type:"spring", stiffness:380, damping:30 }} aria-hidden="true" />
              )}
              <span className="relative z-10">{s}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* lang filter pills */}
      <motion.div className="flex flex-wrap gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ ...sp, delay: 0.1 }}>
        {langs.map(lang => {
          const c = LANG_COLORS[lang] ?? "#64748b"
          const active = langF === lang
          return (
            <motion.button key={lang} onClick={() => setLangF(lang)}
              className="px-3 py-1 rounded-full text-[11px] font-mono border transition-colors"
              style={active
                ? { color: lang === "all" ? "#00d4ff" : c, background: `${lang==="all"?"rgba(0,212,255,0.1)":`${c}12`}`, borderColor: `${lang==="all"?"rgba(0,212,255,0.3)":`${c}35`}` }
                : { color: "#334155", background: "transparent", borderColor: "rgba(255,255,255,0.07)" }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              {lang === "all" ? "All" : lang}
            </motion.button>
          )
        })}
      </motion.div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-white/[0.06] bg-[#0d1117]/60 animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" layout>
            {filtered.map((p, i) => <PkgCard key={p.id} pkg={p} index={i} />)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
