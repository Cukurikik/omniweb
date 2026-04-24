"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"
import OmniNav from "@/components/omni-nav"

/* ── sidebar data ────────────────────────────────────────── */
const SIDEBAR: { group: string; items: { href: string; label: string }[] }[] = [
  { group: "Learn OMNI", items: [
    { href: "/docs",                label: "Introduction" },
    { href: "/docs/quick-start",    label: "Quick Start" },
    { href: "/docs/installation",   label: "Installation" },
    { href: "/docs/faq",            label: "FAQ" },
    { href: "/docs/changelog",      label: "Changelog" },
  ]},
  { group: "Core Concepts", items: [
    { href: "/docs/uast",               label: "Universal AST" },
    { href: "/docs/architecture",       label: "5-Layer Architecture" },
    { href: "/docs/compiler",           label: "LLVM-Omni Compiler" },
    { href: "/docs/domain-segregation", label: "Domain Segregation" },
    { href: "/docs/memory-model",       label: "Memory Model" },
    { href: "/docs/runtime",            label: "Runtime Engine" },
    { href: "/docs/concurrency",        label: "Concurrency Model" },
    { href: "/docs/zero-copy",          label: "Zero-Copy Interop" },
  ]},
  { group: "Language Guide", items: [
    { href: "/docs/language-guide",   label: "OMNI Syntax" },
    { href: "/docs/polyglot",         label: "Polyglot Imports" },
    { href: "/docs/error-handling",   label: "Error Handling" },
    { href: "/docs/types",            label: "Type System" },
    { href: "/docs/ownership",        label: "Ownership & Borrowing" },
    { href: "/docs/modules",          label: "Modules" },
    { href: "/docs/structs",          label: "Structs & Enums" },
    { href: "/docs/traits",           label: "Traits & Interfaces" },
    { href: "/docs/generics",         label: "Generics" },
    { href: "/docs/closures",         label: "Closures & Lambdas" },
    { href: "/docs/pattern-matching", label: "Pattern Matching" },
    { href: "/docs/iterators",        label: "Iterators" },
    { href: "/docs/async",            label: "Async / Await" },
    { href: "/docs/macros",           label: "Macros" },
    { href: "/docs/unsafe",           label: "Unsafe Blocks" },
  ]},
  { group: "Language Bridges", items: [
    { href: "/docs/rust-bridge",       label: "Rust Bridge (@rust)" },
    { href: "/docs/go-bridge",         label: "Go Bridge (@go)" },
    { href: "/docs/python-bridge",     label: "Python Bridge (@python)" },
    { href: "/docs/typescript-bridge", label: "TypeScript Bridge (@ts)" },
    { href: "/docs/c-bridge",          label: "C Bridge (@c)" },
    { href: "/docs/cpp-bridge",        label: "C++ Bridge (@cpp)" },
    { href: "/docs/julia-bridge",      label: "Julia Bridge (@julia)" },
    { href: "/docs/swift-bridge",      label: "Swift Bridge (@swift)" },
    { href: "/docs/r-bridge",          label: "R Bridge (@r)" },
    { href: "/docs/html-bridge",       label: "HTML Bridge (@html)" },
    { href: "/docs/graphql-bridge",    label: "GraphQL Bridge (@graphql)" },
    { href: "/docs/csharp-bridge",     label: "C# Bridge (@cs)" },
    { href: "/docs/ruby-bridge",       label: "Ruby Bridge (@ruby)" },
    { href: "/docs/php-bridge",        label: "PHP Bridge (@php)" },
    { href: "/docs/js-bridge",         label: "JavaScript Bridge (@js)" },
  ]},
  { group: "Standard Library", items: [
    { href: "/docs/stdlib-overview",     label: "omni-std Overview" },
    { href: "/docs/stdlib-collections",  label: "Collections" },
    { href: "/docs/stdlib-io",           label: "I/O & File System" },
    { href: "/docs/stdlib-net",          label: "Networking" },
    { href: "/docs/stdlib-crypto",       label: "Cryptography" },
    { href: "/docs/stdlib-datetime",     label: "Date & Time" },
    { href: "/docs/stdlib-math",         label: "Math & Numbers" },
    { href: "/docs/stdlib-string",       label: "String Operations" },
    { href: "/docs/stdlib-json",         label: "JSON / Serialization" },
    { href: "/docs/stdlib-regex",        label: "Regular Expressions" },
    { href: "/docs/stdlib-env",          label: "Environment & Config" },
    { href: "/docs/stdlib-process",      label: "Process & Threads" },
  ]},
  { group: "OMNI-NEXUS", items: [
    { href: "/docs/nexus",           label: "Registry Overview" },
    { href: "/docs/nexus-install",   label: "Installing Packages" },
    { href: "/docs/nexus-publish",   label: "Publishing Packages" },
    { href: "/docs/nexus-omnifile",  label: "Omnifile.toml" },
    { href: "/docs/nexus-versioning",label: "Version Constraints" },
    { href: "/docs/nexus-workspaces",label: "Workspaces" },
    { href: "/docs/nexus-private",   label: "Private Registries" },
  ]},
  { group: "Toolchain", items: [
    { href: "/docs/cli",         label: "CLI Reference" },
    { href: "/docs/testing",     label: "Testing" },
    { href: "/docs/benchmarking",label: "Benchmarking" },
    { href: "/docs/profiling",   label: "Profiling" },
    { href: "/docs/linting",     label: "Linting & Formatting" },
    { href: "/docs/vscode",      label: "VS Code Extension" },
    { href: "/docs/lsp",         label: "Language Server (LSP)" },
    { href: "/docs/ci-cd",       label: "CI/CD Integration" },
  ]},
  { group: "Deployment", items: [
    { href: "/docs/deploying",   label: "Deployment Overview" },
    { href: "/docs/unikernel",   label: "Unikernel Images" },
    { href: "/docs/docker",      label: "Docker / OCI" },
    { href: "/docs/kubernetes",  label: "Kubernetes" },
    { href: "/docs/omni-cloud",  label: "OMNI Cloud" },
    { href: "/docs/wasm-deploy", label: "WebAssembly Deploy" },
    { href: "/docs/edge-deploy", label: "Edge / CDN Deploy" },
  ]},
  { group: "Advanced", items: [
    { href: "/docs/singularity",        label: "Singularity Tier" },
    { href: "/docs/telepathy-engine",   label: "Telepathy Engine" },
    { href: "/docs/immortality-mesh",   label: "Immortality Mesh" },
    { href: "/docs/quantum-bridge",     label: "Quantum Bridge" },
    { href: "/docs/interplanetary-dtp", label: "Interplanetary DTP" },
    { href: "/docs/gpu-compute",        label: "GPU Compute" },
    { href: "/docs/hft",                label: "High-Frequency Trading" },
    { href: "/docs/formal-verification",label: "Formal Verification" },
  ]},
  { group: "API Reference", items: [
    { href: "/docs/api-overview", label: "API Overview" },
    { href: "/docs/api-compiler", label: "Compiler API" },
    { href: "/docs/api-runtime",  label: "Runtime API" },
    { href: "/docs/api-nexus",    label: "NEXUS API" },
    { href: "/docs/api-cloud",    label: "Cloud API" },
    { href: "/docs/api-ml",       label: "ML API" },
    { href: "/docs/api-db",       label: "Database API" },
  ]},
  { group: "Guides & Tutorials", items: [
    { href: "/docs/guide-fullstack",   label: "Full-Stack App" },
    { href: "/docs/guide-ml-pipeline", label: "ML Pipeline" },
    { href: "/docs/guide-http-server", label: "HTTP Server" },
    { href: "/docs/guide-crypto",      label: "Cryptography App" },
    { href: "/docs/guide-websocket",   label: "WebSocket Chat" },
    { href: "/docs/guide-microservice",label: "Microservice Migration" },
    { href: "/docs/guide-database",    label: "Database Layer" },
    { href: "/docs/guide-mobile",      label: "Native Mobile (Swift)" },
    { href: "/docs/guide-wasm",        label: "WebAssembly Module" },
    { href: "/docs/guide-cli-tool",    label: "CLI Tool" },
  ]},
]

/* ── animated sidebar section ─────────────────────────────── */
function SidebarSection({
  group, items, pathname, onClose, index,
}: { group: string; items: { href: string; label: string }[]; pathname: string; onClose?: () => void; index: number }) {
  const hasActive = items.some(i => pathname === i.href || pathname.startsWith(i.href + "/"))
  const [open, setOpen] = useState(hasActive || index === 0)

  return (
    <motion.div
      className="mb-1"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: index * 0.04 }}
    >
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-left sidebar-group-label hover:text-[#64748b] transition-colors"
        aria-expanded={open}
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
        <span>{group}</span>
        <motion.svg
          className="w-3 h-3 shrink-0"
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </motion.svg>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{ overflow: "hidden" }}
          >
            {items.map((item, i) => {
              const active = pathname === item.href
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24, delay: i * 0.025 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`sidebar-link relative block ${active ? "active" : ""}`}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-lg bg-[#00d4ff]/10 border-l-2 border-[#00d4ff]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── sidebar content ─────────────────────────────────────── */
function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const [search, setSearch] = useState("")
  const allItems = SIDEBAR.flatMap(s => s.items)
  const filtered = search.trim()
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <aside className="w-full h-full flex flex-col bg-[#080b12]">
      {/* Top bar */}
      <motion.div
        className="px-4 pt-4 pb-3 border-b border-white/[0.05]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <div className="flex items-center justify-between mb-3">
          <motion.div whileHover={{ x: -2 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
            <Link
              href="/"
              className="flex items-center gap-2 text-[#64748b] text-xs hover:text-[#00d4ff] transition-colors group"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/packages"
              onClick={onClose}
              className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-white/[0.06] px-2 py-0.5 rounded font-mono transition-colors"
            >
              Packages
            </Link>
          </motion.div>
        </div>

        {/* Animated search */}
        <motion.div
          className="relative"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.1 }}
        >
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#334155]"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <motion.input
            type="search"
            placeholder="Search docs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs
              text-[#e2e8f0] placeholder:text-[#334155] outline-none transition-all"
            whileFocus={{
              borderColor: "rgba(0,212,255,0.4)",
              boxShadow: "0 0 0 3px rgba(0,212,255,0.08)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          />
        </motion.div>


      </motion.div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Documentation">
        <AnimatePresence mode="wait">
          {filtered ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className="sidebar-group-label">Results</div>
              {filtered.length === 0 && (
                <motion.p
                  className="px-4 py-3 text-xs text-[#334155]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  No results for &ldquo;{search}&rdquo;
                </motion.p>
              )}
              {filtered.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 320, damping: 24 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="full-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {SIDEBAR.map((section, i) => (
                <SidebarSection
                  key={section.group}
                  group={section.group}
                  items={section.items}
                  pathname={pathname}
                  onClose={onClose}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </aside>
  )
}

/* ── scroll progress line ────────────────────────────────── */
function DocScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 z-[9999] origin-left"
      style={{ scaleX, background: "linear-gradient(90deg, #00d4ff, #00ff88, #a855f7)" }}
      aria-hidden="true"
    />
  )
}

/* ── main layout ─────────────────────────────────────────── */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  /* close drawer on route change */
  useEffect(() => { setMobileOpen(false) }, [pathname])

  /* close on Escape */
  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMobileOpen(false)
  }, [])
  useEffect(() => {
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onKey])

  return (
    <div className="min-h-screen bg-[#080b12]">
      <DocScrollProgress />
      <OmniNav />

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <motion.button
          onClick={() => setMobileOpen(v => !v)}
          className="bg-[#0d1117] border border-white/10 text-[#00d4ff] w-12 h-12 rounded-full
            flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}
          whileTap={{ scale: 0.93 }}
          aria-label="Toggle sidebar"
          aria-expanded={mobileOpen}
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.svg key="close" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg key="open" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-y-0 left-0 z-40 w-72 border-r border-white/[0.07] shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex pt-16">
        {/* Desktop sidebar */}
        <motion.div
          className="hidden md:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-white/[0.05]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 }}
        >
          <SidebarContent pathname={pathname} />
        </motion.div>

        {/* Main content — animate on pathname change */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            className="flex-1 min-w-0 max-w-3xl px-6 md:px-12 py-10"
            initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
