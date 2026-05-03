// @ts-nocheck
"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import OmniNav from "@/components/omni-nav"

/* ─── Types ─────────────────────────────────────────────── */
interface Example {
  id: string
  num: string
  title: string
  description: string
  tags: string[]
  accentColor: string
  secondaryColor: string
  stats: { label: string; value: string }[]
  features: string[]
  demoContent: React.ReactNode
}

/* ─── Demo mini-UIs rendered inside cards ──────────────── */
function EcommerceDemoUI() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-[#ff5f57]"/><span className="w-2 h-2 rounded-full bg-[#febc2e]"/><span className="w-2 h-2 rounded-full bg-[#28c840]"/></div>
        <span className="text-[10px] font-mono text-white/20 ml-1">shop.omni.dev</span>
      </div>
      <div className="flex-1 p-3 grid grid-cols-2 gap-2">
        {[
          { name: "OMNI Compiler", price: "$0", color: "#00d4ff" },
          { name: "NEXUS Pro",     price: "$12/mo", color: "#00ff88" },
          { name: "UAST Tools",    price: "$0", color: "#a855f7" },
          { name: "Deploy Kit",    price: "$8/mo", color: "#f59e0b" },
        ].map(p => (
          <div key={p.name} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 flex flex-col gap-1.5">
            <div className="w-full h-10 rounded-md flex items-center justify-center text-lg font-black"
              style={{ background: `${p.color}12`, color: p.color }}>◈</div>
            <div className="text-[9px] text-white/60 font-semibold leading-tight">{p.name}</div>
            <div className="text-[9px] font-mono font-bold" style={{ color: p.color }}>{p.price}</div>
            <div className="w-full h-4 rounded-md text-[8px] flex items-center justify-center font-bold"
              style={{ background: `${p.color}20`, color: p.color }}>Add →</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardDemoUI() {
  return (
    <div className="w-full h-full bg-[#060910] rounded-xl overflow-hidden flex">
      <div className="w-12 bg-[#0a0e1a] border-r border-white/[0.05] flex flex-col items-center py-3 gap-3">
        {["⊞","◈","⬡","◉","⚙"].map((ic, i) => (
          <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${i === 0 ? "bg-[#00d4ff]/20 text-[#00d4ff]" : "text-white/20"}`}>{ic}</div>
        ))}
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { v: "15", l: "Languages", c: "#00d4ff" },
            { v: "98%", l: "Uptime",    c: "#00ff88" },
            { v: "3ms", l: "Latency",   c: "#a855f7" },
          ].map(m => (
            <div key={m.l} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-1.5 text-center">
              <div className="text-[11px] font-black tabular-nums" style={{ color: m.c }}>{m.v}</div>
              <div className="text-[8px] text-white/25 font-mono">{m.l}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
          <div className="flex items-end gap-0.5 h-full">
            {[40,65,45,80,55,90,70,85,60,95].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(0,212,255,${0.1 + i * 0.08})` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentationDemoUI() {
  return (
    <div className="w-full h-full bg-[#080b12] rounded-xl overflow-hidden flex flex-col text-[9px] font-mono">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-[#0d1117]">
        <span className="text-[#00d4ff]">OMNI</span>
        <span className="text-white/20">/</span>
        <span className="text-white/40">docs</span>
        <span className="text-white/20">/</span>
        <span className="text-white/60">uast</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-20 border-r border-white/[0.05] p-2 flex flex-col gap-1">
          {["Getting Started","UAST Spec","Compiler","NEXUS","Deploy"].map((s, i) => (
            <div key={s} className={`px-1.5 py-1 rounded text-[8px] cursor-default ${i === 1 ? "text-[#00d4ff] bg-[#00d4ff]/10" : "text-white/20"}`}>{s}</div>
          ))}
        </div>
        <div className="flex-1 p-3 flex flex-col gap-2">
          <div className="text-[#e2e8f0] font-bold text-[10px]">Universal AST</div>
          <div className="text-white/30 text-[8px] leading-relaxed">The UAST bridges all 15 languages into one unified node representation...</div>
          <div className="rounded bg-black/40 border border-white/[0.06] p-2">
            <div className="text-[#00d4ff]">{"@rust"}</div>
            <div className="text-[#e2e8f0]">{"fn greet(name: &str) -> String {"}</div>
            <div className="text-white/40 pl-3">{"// zero-copy bridge"}</div>
            <div className="text-[#00ff88] pl-3">{"format!(\"Hello, {}!\", name)"}</div>
            <div className="text-[#e2e8f0">{"}"}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlogDemoUI() {
  return (
    <div className="w-full h-full bg-[#080b12] rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-black text-[#e2e8f0]">OMNI Blog</span>
        <div className="flex gap-2 text-[9px] text-white/30 font-mono">
          <span>News</span><span>Releases</span><span>Tech</span>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2">
        {[
          { title: "OMNI v2.0 Released — 15 Languages Unified", tag: "Release", color: "#00d4ff", date: "Apr 2026" },
          { title: "How We Built Zero-Copy Cross-Language Bridges", tag: "Tech", color: "#00ff88", date: "Mar 2026" },
          { title: "NEXUS Package Registry: One Registry for All", tag: "News", color: "#a855f7", date: "Mar 2026" },
        ].map(p => (
          <div key={p.title} className="flex items-start gap-2 p-2 rounded-lg border border-white/[0.05] bg-white/[0.02] group hover:bg-white/[0.04] transition-all">
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: p.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-semibold text-white/70 leading-tight mb-0.5 truncate">{p.title}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] px-1.5 py-0.5 rounded font-mono" style={{ background: `${p.color}15`, color: p.color }}>{p.tag}</span>
                <span className="text-[8px] text-white/20 font-mono">{p.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortfolioDemoUI() {
  return (
    <div className="w-full h-full bg-[#050708] rounded-xl overflow-hidden relative flex flex-col items-center justify-center gap-3 p-4">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 60%)" }} />
      <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl"
        style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)", color: "#00d4ff" }}>A</div>
      <div className="relative text-center">
        <div className="text-[11px] font-black text-[#e2e8f0]">Aria Chen</div>
        <div className="text-[9px] text-white/40 font-mono">Full-Stack · OMNI Developer</div>
      </div>
      <div className="relative flex gap-1.5">
        {["Rust","Go","TypeScript","OMNI"].map(t => (
          <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full border border-white/[0.08] text-white/40 font-mono">{t}</span>
        ))}
      </div>
      <div className="relative grid grid-cols-3 gap-1.5 w-full">
        {[
          { l: "Projects", v: "42", c: "#00d4ff" },
          { l: "Stars",    v: "1.2k", c: "#f59e0b" },
          { l: "Commits",  v: "3.8k", c: "#00ff88" },
        ].map(s => (
          <div key={s.l} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-1.5 text-center">
            <div className="text-[11px] font-black" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/25 font-mono">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SaaSLandingDemoUI() {
  return (
    <div className="w-full h-full bg-[#060910] rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-[#00d4ff]/20 flex items-center justify-center text-[8px] font-black text-[#00d4ff]">O</div>
          <span className="text-[10px] font-black text-[#e2e8f0]">OmniCloud</span>
        </div>
        <div className="flex gap-2 text-[9px] text-white/30 font-mono items-center">
          <span>Docs</span><span>Pricing</span>
          <span className="bg-[#00d4ff] text-[#080b12] font-bold px-2 py-0.5 rounded text-[8px]">Start</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 pb-3">
        <div className="text-[13px] font-black text-center text-[#e2e8f0] leading-tight">
          Deploy<br/><span className="text-[#00d4ff]">Anywhere</span> in 3ms
        </div>
        <div className="text-[9px] text-white/30 text-center leading-relaxed max-w-[120px]">
          Unikernel images under 8MB. Zero cold-start overhead.
        </div>
        <div className="flex gap-1.5">
          <div className="text-[8px] font-bold bg-[#00d4ff] text-[#080b12] px-3 py-1.5 rounded-lg">Deploy Free</div>
          <div className="text-[8px] font-bold border border-white/10 text-white/50 px-3 py-1.5 rounded-lg">Learn More</div>
        </div>
      </div>
    </div>
  )
}

function DevToolsDemoUI() {
  return (
    <div className="w-full h-full bg-[#0d1117] rounded-xl overflow-hidden flex flex-col font-mono">
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-white/[0.06]">
        <div className="flex gap-1.5 text-[9px]">
          <span className="text-[#00d4ff]">OMNI</span>
          <span className="text-white/20">IDE</span>
        </div>
        <div className="flex gap-1 text-[8px] text-white/20">
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">File</span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">Edit</span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">Run</span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden text-[9px]">
        <div className="w-16 border-r border-white/[0.05] p-2 flex flex-col gap-1">
          <div className="text-[8px] text-white/20 uppercase tracking-wider mb-1">Explorer</div>
          {["src/","  main.omni","  lib.omni","tests/","Cargo.toml"].map((f, i) => (
            <div key={f} className={`text-[8px] ${i === 1 ? "text-[#00d4ff]" : "text-white/30"}`}>{f}</div>
          ))}
        </div>
        <div className="flex-1 p-2 flex flex-col gap-0.5 overflow-hidden">
          {[
            { t: "/// OMNI polyglot module",  c: "text-white/25" },
            { t: "@rust",                      c: "text-[#f59e0b]" },
            { t: "fn compute(n: u64) -> u64 {",c: "text-[#e2e8f0]" },
            { t: "  n.wrapping_mul(2)",        c: "text-[#00ff88]" },
            { t: "}",                          c: "text-[#e2e8f0]" },
            { t: "@go",                        c: "text-[#f59e0b]" },
            { t: "func Serve() {",             c: "text-[#e2e8f0]" },
            { t: "  // HTTP/3 server",         c: "text-white/25" },
            { t: "}",                          c: "text-[#e2e8f0]" },
          ].map((l, i) => (
            <div key={i} className={`leading-relaxed ${l.c}`}>{l.t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MonitoringDemoUI() {
  return (
    <div className="w-full h-full bg-[#060910] rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-white/[0.05] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
        <span className="text-[10px] font-mono text-white/60">OMNI Monitoring — All Systems</span>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2">
        {[
          { name: "UAST Compiler",   uptime: "99.99%", latency: "2ms",  status: "ok",   color: "#00ff88" },
          { name: "NEXUS Registry",  uptime: "99.98%", latency: "4ms",  status: "ok",   color: "#00ff88" },
          { name: "Unikernel Host",  uptime: "100%",   latency: "1ms",  status: "ok",   color: "#00ff88" },
          { name: "LSP Server",      uptime: "99.95%", latency: "8ms",  status: "warn", color: "#f59e0b" },
        ].map(s => (
          <div key={s.name} className="flex items-center gap-2 text-[9px]">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <div className="flex-1 text-white/60 font-mono truncate">{s.name}</div>
            <div className="text-white/30 font-mono">{s.latency}</div>
            <div className="font-mono" style={{ color: s.color }}>{s.uptime}</div>
          </div>
        ))}
        <div className="mt-1 rounded-lg bg-white/[0.02] border border-white/[0.04] p-2 flex items-end gap-0.5 h-10">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="flex-1 rounded-sm"
              style={{ height: `${30 + Math.sin(i * 0.5) * 20 + Math.random() * 30}%`, background: "rgba(0,255,136,0.25)" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CommunityForumDemoUI() {
  return (
    <div className="w-full h-full bg-[#080b12] rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#e2e8f0]">OMNI Community</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
          <span className="text-[8px] font-mono text-white/30">2.4k online</span>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2">
        {[
          { title: "Zero-cost FFI in OMNI — deep dive",       replies: 42, votes: 128, hot: true,  color: "#00d4ff" },
          { title: "NEXUS vs npm: 10x faster installs",       replies: 31, votes: 96,  hot: true,  color: "#00ff88" },
          { title: "WASM target for embedded systems?",       replies: 18, votes: 54,  hot: false, color: "#a855f7" },
          { title: "Setting up LSP in Neovim + OMNI",        replies: 29, votes: 73,  hot: false, color: "#f59e0b" },
        ].map(p => (
          <div key={p.title} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="text-[9px] font-black" style={{ color: p.color }}>{p.votes}</div>
              <div className="text-[7px] text-white/20 font-mono">votes</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-white/70 leading-tight truncate">{p.title}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {p.hot && <span className="text-[7px] font-bold" style={{ color: "#f59e0b" }}>HOT</span>}
                <span className="text-[7px] text-white/20 font-mono">{p.replies} replies</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PackageRegistryDemoUI() {
  return (
    <div className="w-full h-full bg-[#060910] rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2 bg-[#0d1117]">
        <div className="flex-1 flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1">
          <svg className="w-2.5 h-2.5 text-white/20" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 8l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span className="text-[9px] text-white/20 font-mono">Search 540+ packages…</span>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-1.5">
        {[
          { name: "omni-http",    desc: "HTTP/3 server & client", dl: "240k/wk",  color: "#00d4ff", lang: "Go" },
          { name: "omni-ml",      desc: "ML pipeline primitives", dl: "180k/wk",  color: "#a855f7", lang: "Python" },
          { name: "omni-crypto",  desc: "Zero-alloc crypto ops",  dl: "310k/wk",  color: "#ef4444", lang: "Rust" },
          { name: "omni-ui",      desc: "Type-safe component lib",dl: "120k/wk",  color: "#3178c6", lang: "TS" },
        ].map(p => (
          <div key={p.name} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0"
              style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}20` }}>{p.lang}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-[#e2e8f0]">{p.name}</div>
              <div className="text-[8px] text-white/30 truncate">{p.desc}</div>
            </div>
            <div className="text-[8px] font-mono text-white/25">{p.dl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Examples data ─────────────────────────────────────── */
const EXAMPLES: Example[] = [
  {
    id: "ecommerce",
    num: "01",
    title: "E-Commerce Storefront",
    description: "A high-performance storefront built with OMNI's TypeScript layer for the UI, Rust for payment processing, and Go for inventory management — all in one unified codebase.",
    tags: ["E-Commerce", "TypeScript", "Rust", "Go"],
    accentColor: "#00d4ff",
    secondaryColor: "#00ff88",
    stats: [{ label: "Page Load", value: "< 50ms" }, { label: "Conversion", value: "+34%" }, { label: "Uptime", value: "99.99%" }],
    features: ["Zero-copy cart state with Rust", "HTTP/3 checkout pipeline via Go", "SSR product pages in TypeScript", "Unikernel deploy at 5MB"],
    demoContent: <EcommerceDemoUI />,
  },
  {
    id: "dashboard",
    num: "02",
    title: "Analytics Dashboard",
    description: "Real-time analytics platform combining Python for ML-driven insights, Go for WebSocket streaming, and TypeScript for the interactive visualization layer.",
    tags: ["Analytics", "Python", "Go", "TypeScript"],
    accentColor: "#a855f7",
    secondaryColor: "#00d4ff",
    stats: [{ label: "Data Points", value: "10M/s" }, { label: "Latency", value: "< 3ms" }, { label: "Accuracy", value: "99.2%" }],
    features: ["Python ML anomaly detection", "Go WebSocket push at 10M events/s", "TypeScript D3 visualizations", "Cross-language shared memory"],
    demoContent: <DashboardDemoUI />,
  },
  {
    id: "documentation",
    num: "03",
    title: "Documentation Site",
    description: "OMNI's own documentation site — built with TypeScript for rendering, Go for search indexing, and Rust for the content transformation pipeline.",
    tags: ["Docs", "TypeScript", "Go", "Rust"],
    accentColor: "#f59e0b",
    secondaryColor: "#00d4ff",
    stats: [{ label: "Pages", value: "1,200+" }, { label: "Search", value: "< 1ms" }, { label: "Build", value: "< 2s" }],
    features: ["Rust MDX → AST transformer", "Go full-text search engine", "TypeScript interactive examples", "Live code playground embeds"],
    demoContent: <DocumentationDemoUI />,
  },
  {
    id: "blog",
    num: "04",
    title: "Technical Blog Platform",
    description: "A developer blog with OMNI's polyglot power — Rust for content parsing, Go for RSS and APIs, TypeScript for the React frontend with ISR support.",
    tags: ["Blog", "Rust", "Go", "TypeScript"],
    accentColor: "#ef4444",
    secondaryColor: "#f59e0b",
    stats: [{ label: "Build Time", value: "0.8s" }, { label: "TTFB", value: "12ms" }, { label: "Core Web Vitals", value: "100/100" }],
    features: ["Rust markdown → HTML pipeline", "Go sitemap & RSS generation", "TypeScript ISR frontend", "Edge-deployable unikernel"],
    demoContent: <BlogDemoUI />,
  },
  {
    id: "portfolio",
    num: "05",
    title: "Developer Portfolio",
    description: "A stunning developer portfolio showcasing OMNI projects, with GitHub integration in Go, animated TypeScript UI, and Rust-powered performance metrics.",
    tags: ["Portfolio", "TypeScript", "Go", "Rust"],
    accentColor: "#00ff88",
    secondaryColor: "#a855f7",
    stats: [{ label: "Lighthouse", value: "100" }, { label: "Bundle", value: "< 20KB" }, { label: "Animation", value: "60fps" }],
    features: ["Go GitHub activity integration", "Rust WebAssembly animations", "TypeScript framer-motion UI", "3–8MB unikernel deploy"],
    demoContent: <PortfolioDemoUI />,
  },
  {
    id: "saas",
    num: "06",
    title: "SaaS Landing Page",
    description: "A conversion-optimized SaaS landing with TypeScript for the animated marketing site, Go for A/B testing infrastructure, and Rust for analytics ingestion.",
    tags: ["SaaS", "Marketing", "TypeScript", "Go"],
    accentColor: "#3178c6",
    secondaryColor: "#00d4ff",
    stats: [{ label: "CLS", value: "0.00" }, { label: "LCP", value: "0.8s" }, { label: "A/B Tests", value: "100+" }],
    features: ["Go A/B test routing engine", "Rust event analytics pipeline", "TypeScript animated sections", "Vercel Edge + Unikernel CDN"],
    demoContent: <SaaSLandingDemoUI />,
  },
  {
    id: "devtools",
    num: "07",
    title: "Developer IDE & Tooling",
    description: "A browser-based IDE built on OMNI — LSP server in Rust, build pipeline in Go, TypeScript for the Monaco editor integration with real-time polyglot IntelliSense.",
    tags: ["IDE", "Rust", "TypeScript", "LSP"],
    accentColor: "#00d4ff",
    secondaryColor: "#00ff88",
    stats: [{ label: "IntelliSense", value: "< 5ms" }, { label: "Languages", value: "15" }, { label: "Completion", value: "98%" }],
    features: ["Rust LSP with cross-language types", "TypeScript Monaco editor", "Go incremental build daemon", "WASM hot-reload in browser"],
    demoContent: <DevToolsDemoUI />,
  },
  {
    id: "monitoring",
    num: "08",
    title: "Uptime Monitoring Tool",
    description: "Real-time infrastructure monitoring with Go for HTTP/TCP health probes, Rust for metrics aggregation, TypeScript dashboard, and Python for predictive alerting.",
    tags: ["Monitoring", "Go", "Rust", "Python"],
    accentColor: "#00ff88",
    secondaryColor: "#f59e0b",
    stats: [{ label: "Check Interval", value: "1s" }, { label: "Latency", value: "0.5ms" }, { label: "Probes", value: "50k/min" }],
    features: ["Go concurrent HTTP/TCP prober", "Rust time-series aggregator", "Python ML anomaly alerting", "TypeScript status page"],
    demoContent: <MonitoringDemoUI />,
  },
  {
    id: "community",
    num: "09",
    title: "Community Forum",
    description: "A full-featured developer forum built with Go for the backend API, Rust for real-time search indexing, and TypeScript for the interactive frontend with live updates.",
    tags: ["Community", "Forum", "Go", "Rust"],
    accentColor: "#f59e0b",
    secondaryColor: "#a855f7",
    stats: [{ label: "Members", value: "28k" }, { label: "Posts/day", value: "1,200" }, { label: "Search", value: "< 2ms" }],
    features: ["Rust full-text search engine", "Go WebSocket real-time updates", "TypeScript interactive threads", "Python spam detection ML"],
    demoContent: <CommunityForumDemoUI />,
  },
  {
    id: "registry",
    num: "10",
    title: "Package Registry UI",
    description: "The OMNI-NEXUS package registry frontend — Go powers the resolution engine, Rust handles security scanning, TypeScript delivers the blazing-fast search UI.",
    tags: ["Registry", "Packages", "Go", "Rust"],
    accentColor: "#a855f7",
    secondaryColor: "#ef4444",
    stats: [{ label: "Packages", value: "540+" }, { label: "Resolve", value: "< 1ms" }, { label: "Security", value: "100%" }],
    features: ["Go multi-registry resolver", "Rust CVE scanner pipeline", "TypeScript fuzzy search UI", "Zero-conflict dependency tree"],
    demoContent: <PackageRegistryDemoUI />,
  },
]

/* ─── Main Page ─────────────────────────────────────────── */
export default function ShowcasePage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#080b12] text-[#e2e8f0] overflow-x-hidden">
      <OmniNav />

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px]"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] text-xs font-mono text-[#64748b]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" aria-hidden="true" />
          10 Production Examples &mdash; Powered by OMNI
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.92] mb-6 text-[#e2e8f0]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          Built with{" "}
          <span className="gradient-text" style={{ textShadow: "0 0 60px rgba(0,212,255,0.25)" }}>
            OMNI.
          </span>
        </motion.h1>

        <motion.p
          className="text-[#475569] text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          10 real-world web applications — each combining multiple languages in one
          unified codebase. See what becomes possible when 15 languages share one AST.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {["All", "E-Commerce", "Analytics", "Docs", "Blog", "Portfolio", "SaaS", "IDE", "Monitoring", "Community", "Registry"].map(tag => (
            <button key={tag}
              className="text-xs font-mono px-3.5 py-1.5 rounded-full border border-white/[0.07] text-[#475569]
                hover:text-[#00d4ff] hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/[0.05] transition-all"
            >{tag}</button>
          ))}
        </motion.div>
      </section>

      {/* ── Examples Grid ── */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-5">
            {EXAMPLES.map((ex, idx) => (
              <motion.article
                key={ex.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px 0px" }}
                transition={{ delay: (idx % 2) * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredId(ex.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative rounded-3xl border overflow-hidden cursor-pointer"
                style={{
                  borderColor: hoveredId === ex.id ? `${ex.accentColor}30` : "rgba(255,255,255,0.06)",
                  background: hoveredId === ex.id ? `${ex.accentColor}04` : "rgba(13,17,23,0.8)",
                  transition: "border-color 0.3s, background 0.3s",
                }}
                onClick={() => setActiveId(activeId === ex.id ? null : ex.id)}
              >
                {/* Number watermark */}
                <div className="absolute -right-4 -top-4 text-[80px] font-black leading-none select-none pointer-events-none tabular-nums opacity-[0.04]"
                  style={{ color: ex.accentColor }}>{ex.num}</div>

                {/* Top accent bar */}
                <motion.div className="absolute top-0 left-0 right-0 h-[2px] origin-left"
                  style={{ background: `linear-gradient(90deg, ${ex.accentColor}, ${ex.secondaryColor})` }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, duration: 0.7 }}
                  aria-hidden="true" />

                <div className="p-7 flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="text-[11px] font-mono font-bold" style={{ color: ex.accentColor }}>{ex.num}</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {ex.tags.map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-mono border"
                              style={{ color: `${ex.accentColor}99`, borderColor: `${ex.accentColor}20`, background: `${ex.accentColor}08` }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h2 className="text-xl font-black text-[#e2e8f0] mb-2 leading-tight">{ex.title}</h2>
                      <p className="text-[#475569] text-sm leading-relaxed">{ex.description}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {ex.stats.map(s => (
                      <div key={s.label} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-center">
                        <div className="text-base font-black tabular-nums" style={{ color: ex.accentColor }}>{s.value}</div>
                        <div className="text-[10px] text-[#334155] font-mono mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Demo preview */}
                  <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ height: "180px" }}>
                    {ex.demoContent}
                  </div>

                  {/* Expand toggle */}
                  <motion.button
                    className="flex items-center gap-2 text-xs font-semibold self-start"
                    style={{ color: ex.accentColor }}
                    whileHover={{ gap: "10px" }}
                    onClick={e => { e.stopPropagation(); setActiveId(activeId === ex.id ? null : ex.id) }}
                    aria-expanded={activeId === ex.id}
                    aria-label={activeId === ex.id ? "Collapse details" : "Expand details"}
                  >
                    <motion.svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"
                      animate={{ rotate: activeId === ex.id ? 90 : 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      aria-hidden="true">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                    {activeId === ex.id ? "Hide details" : "See tech details"}
                  </motion.button>

                  {/* Expanded features */}
                  <AnimatePresence>
                    {activeId === ex.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 grid sm:grid-cols-2 gap-2">
                          {ex.features.map((f, i) => (
                            <motion.div
                              key={f}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.07, duration: 0.35 }}
                              className="flex items-start gap-2.5 text-sm text-[#64748b]"
                            >
                              <motion.span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                                style={{ background: `${ex.accentColor}15`, color: ex.accentColor }}
                                whileHover={{ scale: 1.2 }}
                              >✓</motion.span>
                              {f}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-white/[0.05] bg-[#0d1117] text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(0,212,255,0.04) 0%, transparent 70%)" }} aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto relative z-10"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#334155] mb-4">Start building</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#e2e8f0] mb-4 leading-tight">
            Your project could be<br />
            <span className="gradient-text">example #11.</span>
          </h2>
          <p className="text-[#475569] mb-10 max-w-md mx-auto leading-relaxed">
            OMNI gives you all 15 languages, one compiler, one registry.
            Ship what was impossible before.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/docs"
              className="bg-[#00d4ff] text-[#080b12] font-bold px-8 py-4 rounded-2xl text-sm
                hover:bg-[#22e0ff] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(0,212,255,0.4)]"
            >
              Read the Docs
            </Link>
            <Link href="/playground"
              className="border border-white/10 text-[#e2e8f0] font-semibold px-8 py-4 rounded-2xl text-sm
                hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/[0.05] transition-all hover:scale-105 active:scale-95"
            >
              Open Playground
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-6 px-6 text-center">
        <p className="text-[#1e293b] text-xs font-mono">
          &copy; {new Date().getFullYear()} OMNI Framework &mdash; Apache 2.0 License
        </p>
      </footer>
    </div>
  )
}
