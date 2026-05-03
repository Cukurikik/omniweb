// @ts-nocheck
"use client"
import { motion, useInView, useScroll, useTransform } from "motion/react"
import { useRef, useState } from "react"
import Link from "next/link"
import type { DocPage as DocPageType, DocSection } from "@/lib/docs-content"

// ─── Inline code syntax highlighting (enhanced with animations) ─────────────
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px 0px" })
  const [copied, setCopied] = useState(false)

  const keywords = new Set([
    "fn","let","const","mut","struct","enum","impl","trait","type","mod","use","pub","async",
    "await","return","if","else","while","for","in","match","break","continue","loop","self",
    "Self","true","false","None","Some","Ok","Err","where","move","ref","unsafe","extern",
    "import","export","module","from","class","interface","extends","implements",
    "func","var","val","def","new","this","super","static","final","abstract",
    "SELECT","FROM","WHERE","INSERT","INTO","UPDATE","DELETE","CREATE","TABLE",
  ])

  const lines = code.split("\n")

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      ref={ref}
      className="relative my-5 rounded-xl border border-white/[0.08] bg-[#0a0d14] overflow-hidden group"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      whileHover={{ borderColor: "rgba(0,212,255,0.15)" }}
    >
      {lang && (
        <motion.div
          className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
        >
          <motion.span
            className="text-[10px] font-mono text-[#475569] uppercase tracking-widest"
            animate={inView ? { opacity: [0, 1] } : {}}
            transition={{ delay: 0.15 }}
          >
            {lang}
          </motion.span>
          <div className="flex items-center gap-3">
            <motion.div
              className="flex gap-1.5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 20 }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-[#ff5f57]"
                whileHover={{ scale: 1.3, boxShadow: "0 0 8px rgba(255,95,87,0.6)" }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              />
              <motion.span
                className="w-2 h-2 rounded-full bg-[#febc2e]"
                whileHover={{ scale: 1.3, boxShadow: "0 0 8px rgba(254,188,46,0.6)" }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              />
              <motion.span
                className="w-2 h-2 rounded-full bg-[#28c840]"
                whileHover={{ scale: 1.3, boxShadow: "0 0 8px rgba(40,200,64,0.6)" }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              />
            </motion.div>
            <motion.button
              onClick={handleCopy}
              className="text-[#475569] hover:text-[#00d4ff] transition-colors text-xs font-mono flex items-center gap-1.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              {copied ? (
                <>
                  <motion.svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
      <div className="overflow-x-auto p-4 relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d4ff]/[0.02] to-transparent pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          style={{ opacity: inView ? 1 : 0 }}
          aria-hidden="true"
        />
        <pre className="font-mono text-[13px] leading-6 relative z-10">
          {lines.map((raw, li) => {
            if (raw.trimStart().startsWith("//") || raw.trimStart().startsWith("#") || raw.trimStart().startsWith("--") || raw.trimStart().startsWith(";")) {
              return (
                <motion.div
                  key={li}
                  className="text-[#475569]"
                  initial={{ opacity: 0, x: -4 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: li * 0.02, duration: 0.3 }}
                >
                  {raw || "\u00A0"}
                </motion.div>
              )
            }
            const parts: React.ReactNode[] = []
            let rest = raw
            let ki = 0
            while (rest.length > 0) {
              const strM = rest.match(/^(["'`])(?:(?!\1)[^\\]|\\.)*?\1/)
              if (strM) {
                parts.push(<span key={ki++} className="text-[#00ff88]">{strM[0]}</span>)
                rest = rest.slice(strM[0].length)
                continue
              }
              const wordM = rest.match(/^[a-zA-Z_]\w*/)
              if (wordM) {
                const w = wordM[0]
                parts.push(
                  <span key={ki++} className={keywords.has(w) ? "text-[#00d4ff]" : /^[A-Z]/.test(w) ? "text-[#f59e0b]" : "text-[#e2e8f0]"}>
                    {w}
                  </span>
                )
                rest = rest.slice(w.length)
                continue
              }
              const numM = rest.match(/^\d[\d_.]*/)
              if (numM) {
                parts.push(<span key={ki++} className="text-[#a855f7]">{numM[0]}</span>)
                rest = rest.slice(numM[0].length)
                continue
              }
              parts.push(<span key={ki++} className="text-[#64748b]">{rest[0]}</span>)
              rest = rest.slice(1)
            }
            return (
              <motion.div
                key={li}
                initial={{ opacity: 0, x: -4 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: li * 0.02, duration: 0.3 }}
              >
                {parts.length ? parts : "\u00A0"}
              </motion.div>
            )
          })}
        </pre>
      </div>
    </motion.div>
  )
}

// ─── Section renderer with animations ─────────────────────────────────────────
function Section({ s, index }: { s: DocSection; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20px 0px" })

  switch (s.type) {
    case "h2":
      return (
        <motion.h2
          ref={ref}
          className="text-xl font-bold text-[#e2e8f0] mt-10 mb-3 flex items-center gap-2 scroll-mt-20 relative group"
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <motion.span
            className="absolute -left-5 text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ x: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            #
          </motion.span>
          {s.text}
        </motion.h2>
      )
    case "h3":
      return (
        <motion.h3
          ref={ref}
          className="text-lg font-semibold text-[#cbd5e1] mt-7 mb-2"
          initial={{ opacity: 0, x: -8 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          {s.text}
        </motion.h3>
      )
    case "p":
      return (
        <motion.p
          ref={ref}
          className="text-[#94a3b8] leading-relaxed mb-4"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          {s.text}
        </motion.p>
      )
    case "code":
      return <CodeBlock code={s.code ?? ""} lang={s.lang} />
    case "ul":
      return (
        <motion.ul
          ref={ref}
          className="my-4 space-y-1.5 pl-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          {(s.items ?? []).map((item, i) => (
            <motion.li
              key={i}
              className="text-[#94a3b8] leading-relaxed flex items-start gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 320, damping: 24 }}
            >
              <motion.span
                className="text-[#00d4ff] mt-1.5 shrink-0"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              >
                ›
              </motion.span>
              <span>{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      )
    case "ol":
      return (
        <motion.ol
          ref={ref}
          className="my-4 space-y-2 pl-4 list-none"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          {(s.items ?? []).map((item, i) => (
            <motion.li
              key={i}
              className="text-[#94a3b8] leading-relaxed flex items-start gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 24 }}
            >
              <motion.span
                className="text-[#00d4ff] font-mono text-xs font-bold mt-1 shrink-0 w-5 text-right"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                {i + 1}.
              </motion.span>
              <span>{item}</span>
            </motion.li>
          ))}
        </motion.ol>
      )
    case "table":
      return (
        <motion.div
          ref={ref}
          className="rounded-xl border border-white/[0.07] overflow-x-auto my-5 relative group"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          whileHover={{ borderColor: "rgba(0,212,255,0.12)" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/[0.03] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />
          <table className="w-full text-sm relative z-10">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                {(s.headers ?? []).map((h, i) => (
                  <motion.th
                    key={h}
                    className="text-left px-4 py-2.5 text-[#94a3b8] font-semibold text-xs uppercase tracking-wide"
                    initial={{ opacity: 0, y: -8 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.05 + 0.1, type: "spring", stiffness: 320, damping: 24 }}
                  >
                    {h}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(s.rows ?? []).map((row, ri) => (
                <motion.tr
                  key={ri}
                  className="border-b border-white/[0.04] transition-colors last:border-0"
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: ri * 0.04 + 0.15, type: "spring", stiffness: 300, damping: 26 }}
                  whileHover={{ backgroundColor: "rgba(0,212,255,0.03)" }}
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-2.5 text-[#94a3b8] font-mono text-xs leading-6 ${ci === 0 ? "text-[#e2e8f0] font-semibold" : ""}`}>
                      {cell}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )
    case "callout":
      return (
        <motion.div
          ref={ref}
          className="my-5 rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/5 px-5 py-4 flex items-start gap-3 relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/[0.08] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />
          <motion.svg
            className="w-5 h-5 text-[#00d4ff] shrink-0 mt-0.5 relative z-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </motion.svg>
          <p className="text-[#94a3b8] text-sm leading-relaxed relative z-10">{s.text}</p>
        </motion.div>
      )
    case "tip":
      return (
        <motion.div
          ref={ref}
          className="my-5 rounded-xl border border-[#00ff88]/20 bg-[#00ff88]/5 px-5 py-4 flex items-start gap-3 relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/[0.08] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />
          <motion.svg
            className="w-5 h-5 text-[#00ff88] shrink-0 mt-0.5 relative z-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </motion.svg>
          <p className="text-[#94a3b8] text-sm leading-relaxed relative z-10">{s.text}</p>
        </motion.div>
      )
    case "warn":
      return (
        <motion.div
          ref={ref}
          className="my-5 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 px-5 py-4 flex items-start gap-3 relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#ef4444]/[0.08] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />
          <motion.svg
            className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5 relative z-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </motion.svg>
          <p className="text-[#94a3b8] text-sm leading-relaxed relative z-10">{s.text}</p>
        </motion.div>
      )
    default:
      return null
  }
}

// ─── Main DocPage component with scroll parallax ──────────────────────────────
export default function DocPage({ page }: { page: DocPageType }) {
  const headerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: headerRef })
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -30])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <article className="omni-prose pb-16">
      {/* Header with parallax */}
      <motion.header
        ref={headerRef}
        className="mb-8 pb-8 border-b border-white/[0.06] relative"
        style={{ y: headerY, opacity: headerOpacity }}
      >
        {page.badge && (
          <motion.div
            className="inline-flex items-center gap-1.5 text-xs font-mono rounded-full px-3 py-1 mb-4 border relative overflow-hidden group"
            style={{
              color: page.badgeColor ?? "#00d4ff",
              backgroundColor: `${page.badgeColor ?? "#00d4ff"}15`,
              borderColor: `${page.badgeColor ?? "#00d4ff"}30`,
            }}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.6 }}
              aria-hidden="true"
            />
            <span className="relative z-10">{page.badge}</span>
          </motion.div>
        )}
        <motion.h1
          className="text-3xl md:text-4xl font-black text-[#e2e8f0] mb-3 leading-tight text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.05 }}
        >
          {page.title}
        </motion.h1>
        <motion.p
          className="text-[#64748b] text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {page.description}
        </motion.p>
      </motion.header>

      {/* Sections */}
      {page.sections.map((s, i) => (
        <Section key={i} s={s} index={i} />
      ))}

      {/* Prev / Next navigation */}
      {(page.prev || page.next) && (
        <motion.div
          className="mt-12 pt-8 border-t border-white/[0.06] grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px 0px" }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          {page.prev ? (
            <Link
              href={page.prev.href}
              className="group flex flex-col gap-1 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/[0.06] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden="true"
              />
              <motion.span
                className="text-xs text-[#475569] flex items-center gap-1 relative z-10"
                whileHover={{ x: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Previous
              </motion.span>
              <span className="text-sm font-semibold text-[#e2e8f0] group-hover:text-[#00d4ff] transition-colors relative z-10">{page.prev.label}</span>
            </Link>
          ) : <div />}
          {page.next ? (
            <Link
              href={page.next.href}
              className="group flex flex-col gap-1 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] text-right relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-bl from-[#00d4ff]/[0.06] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden="true"
              />
              <motion.span
                className="text-xs text-[#475569] flex items-center gap-1 justify-end relative z-10"
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Next
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.span>
              <span className="text-sm font-semibold text-[#e2e8f0] group-hover:text-[#00d4ff] transition-colors relative z-10">{page.next.label}</span>
            </Link>
          ) : <div />}
        </motion.div>
      )}
    </article>
  )
}
