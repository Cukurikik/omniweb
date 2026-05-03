// @ts-nocheck
"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"

const sp = { type: "spring", stiffness: 300, damping: 26 } as const

const DOCS = [
  {
    category: "Getting Started",
    color: "#00d4ff",
    items: [
      { title: "Quick Start",        slug: "quick-start",        desc: "Install OMNI and run your first polyglot program in under 60 seconds.", time: "5 min" },
      { title: "Installation",       slug: "installation",       desc: "System requirements, package managers, and binary downloads.",           time: "3 min" },
      { title: "Project Structure",  slug: "project-structure",  desc: "Understanding the .omni file layout and workspace conventions.",         time: "7 min" },
      { title: "Configuration",      slug: "configuration",      desc: "omni.toml reference — runtime, compiler, and registry settings.",        time: "10 min" },
    ],
  },
  {
    category: "Core Concepts",
    color: "#00ff88",
    items: [
      { title: "Universal AST",      slug: "uast",               desc: "How OMNI's UAST bridges 15 languages into a single semantic graph.",     time: "12 min" },
      { title: "LLVM-Omni",          slug: "llvm-omni",          desc: "Whole-program optimisation and cross-language inlining with LLVM.",      time: "15 min" },
      { title: "FFI Bridge",         slug: "ffi-bridge",         desc: "Zero-overhead foreign function calls between Rust, Go, Python, and more.","time": "10 min" },
      { title: "Unikernels",         slug: "unikernels",         desc: "Sub-10ms cold starts: building and deploying OMNI unikernels.",          time: "18 min" },
    ],
  },
  {
    category: "Languages",
    color: "#a855f7",
    items: [
      { title: "Rust in OMNI",       slug: "lang-rust",          desc: "Memory safety meets polyglot interop — Rust as the systems backbone.",   time: "8 min" },
      { title: "Go in OMNI",         slug: "lang-go",            desc: "Goroutines, channels, and Go's concurrency model inside OMNI.",          time: "7 min" },
      { title: "Python in OMNI",     slug: "lang-python",        desc: "ML pipelines, scripting, and CPython embedding via UAST.",               time: "9 min" },
      { title: "TypeScript in OMNI", slug: "lang-typescript",    desc: "Full-stack TS with Deno runtime, type sharing across Rust/Go.",          time: "8 min" },
    ],
  },
  {
    category: "OMNI-NEXUS",
    color: "#f59e0b",
    items: [
      { title: "Publishing Packages", slug: "nexus-publish",     desc: "Versioning, signing, and publishing polyglot packages to NEXUS.",        time: "10 min" },
      { title: "Private Registry",    slug: "nexus-private",     desc: "Set up a private NEXUS mirror for your organisation.",                   time: "8 min" },
      { title: "Dependency Solver",   slug: "nexus-solver",      desc: "How OMNI-NEXUS resolves cross-language version constraints.",            time: "12 min" },
    ],
  },
  {
    category: "API Reference",
    color: "#ef4444",
    items: [
      { title: "REST API",           slug: "api-rest",           desc: "Full reference for the OMNI Cloud REST API — auth, builds, deploys.",    time: "20 min" },
      { title: "CLI Reference",      slug: "api-cli",            desc: "All omni commands, flags, and environment variable overrides.",           time: "15 min" },
      { title: "SDK — TypeScript",   slug: "sdk-typescript",     desc: "Official TypeScript SDK for programmatic access to the OMNI platform.",  time: "12 min" },
    ],
  },
]

function DocCard({ title, desc, time, color, index }: { title: string; desc: string; time: string; color: string; index: number }) {
  return (
    <motion.div
      className="relative flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] overflow-hidden group cursor-pointer"
      style={{ background: "rgba(8,11,18,0.6)" }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...sp, delay: 0.05 + index * 0.04 }}
      whileHover={{ borderColor: `${color}25`, background: `${color}04`, y: -2, boxShadow: `0 6px 20px rgba(0,0,0,0.22), 0 0 16px ${color}0a` }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)" }}
        whileHover={{ translateX: "100%" }} transition={{ duration: 0.55 }} aria-hidden="true" />

      <motion.div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
        style={{ background: `${color}10`, color }}
        whileHover={{ scale: 1.1, rotate: 5 }} transition={sp}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <line x1="4" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <line x1="4" y1="8.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[12px] font-semibold text-[#e2e8f0] group-hover:text-white transition-colors">{title}</p>
          <span className="text-[9px] font-mono text-[#334155] shrink-0">{time} read</span>
        </div>
        <p className="text-[11px] text-[#475569] leading-relaxed">{desc}</p>
      </div>

      <motion.div
        className="shrink-0 text-[#1e293b] group-hover:text-[#475569] transition-colors mt-0.5"
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
        aria-hidden="true"
      >
        <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none">
          <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default function DocsPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = DOCS.map(section => ({
    ...section,
    items: section.items.filter(item =>
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section => {
    const catMatch = !activeCategory || section.category === activeCategory
    return catMatch && section.items.length > 0
  })

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={sp}>
        <h1 className="text-2xl font-black text-[#e2e8f0]">Documentation</h1>
        <p className="text-[#475569] text-sm font-mono mt-0.5">OMNI Framework v2.0 reference and guides</p>
      </motion.div>

      {/* search */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...sp, delay: 0.06 }}
      >
        <motion.input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search docs…"
          className="flex-1 bg-[#0d1117]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#e2e8f0] placeholder-[#334155] outline-none font-mono"
          whileFocus={{ borderColor: "rgba(0,212,255,0.4)", boxShadow: "0 0 0 3px rgba(0,212,255,0.08)" }}
          transition={{ duration: 0.18 }}
        />
        <div className="flex items-center gap-1.5 bg-[#0d1117]/60 border border-white/[0.07] rounded-xl p-1 flex-wrap">
          <motion.button
            onClick={() => setActiveCategory(null)}
            className={`relative px-3 py-1.5 rounded-lg text-[11px] font-mono ${!activeCategory ? "text-[#00d4ff]" : "text-[#475569]"}`}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          >
            {!activeCategory && (
              <motion.div layoutId="doc-cat-bg"
                className="absolute inset-0 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/25"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} aria-hidden="true" />
            )}
            <span className="relative z-10">All</span>
          </motion.button>
          {DOCS.map(s => (
            <motion.button
              key={s.category}
              onClick={() => setActiveCategory(activeCategory === s.category ? null : s.category)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap ${activeCategory === s.category ? "text-[#e2e8f0]" : "text-[#475569]"}`}
              style={activeCategory === s.category ? { color: s.color } : {}}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            >
              {activeCategory === s.category && (
                <motion.div layoutId="doc-cat-bg"
                  className="absolute inset-0 rounded-lg border"
                  style={{ background: `${s.color}10`, borderColor: `${s.color}28` }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }} aria-hidden="true" />
              )}
              <span className="relative z-10">{s.category}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* sections */}
      <AnimatePresence mode="popLayout">
        {filtered.map((section, si) => (
          <motion.section key={section.category} layout
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ ...sp, delay: si * 0.05 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-1.5 h-5 rounded-full"
                style={{ background: section.color }}
                animate={{ scaleY: [1, 1.3, 1] }}
                transition={{ duration: 2.5 + si * 0.4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <h2 className="text-[14px] font-bold" style={{ color: section.color }}>{section.category}</h2>
              <span className="text-[10px] font-mono text-[#334155]">{section.items.length} articles</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
              {section.items.map((item, ii) => (
                <DocCard key={item.slug} title={item.title} desc={item.desc} time={item.time} color={section.color} index={ii} />
              ))}
            </div>
          </motion.section>
        ))}
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div className="flex flex-col items-center justify-center py-20 gap-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[#334155] text-sm font-mono">No docs found for &quot;{search}&quot;</p>
          <motion.button onClick={() => setSearch("")}
            className="text-[11px] text-[#00d4ff] font-mono border border-[#00d4ff]/22 px-3 py-1.5 rounded-lg bg-[#00d4ff]/06"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            Clear search
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
