import Link from "next/link"

interface Breadcrumb { label: string; href?: string }
interface DocPageProps {
  title: string
  description?: string
  breadcrumb?: Breadcrumb[]
  prev?: { label: string; href: string }
  next?: { label: string; href: string }
  children: React.ReactNode
}

export default function DocPage({ title, description, breadcrumb, prev, next, children }: DocPageProps) {
  return (
    <article className="omni-prose max-w-none">
      {breadcrumb && (
        <nav className="flex items-center gap-2 text-xs text-[#475569] mb-6" aria-label="Breadcrumb">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#1e293b]" aria-hidden="true">/</span>}
              {b.href
                ? <Link href={b.href} className="hover:text-[#00d4ff] transition-colors no-underline">{b.label}</Link>
                : <span className="text-[#94a3b8]">{b.label}</span>
              }
            </span>
          ))}
        </nav>
      )}

      <h1 className="!mt-0">{title}</h1>
      {description && <p className="text-[#94a3b8] text-base mt-0 mb-8 leading-relaxed">{description}</p>}

      {children}

      {(prev || next) && (
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex items-center justify-between gap-4">
          {prev ? (
            <Link href={prev.href} className="group flex items-center gap-2 text-sm no-underline text-[#64748b] hover:text-[#00d4ff] transition-colors">
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>{prev.label}</span>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={next.href} className="group flex items-center gap-2 text-sm no-underline text-[#64748b] hover:text-[#00d4ff] transition-colors">
              <span>{next.label}</span>
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : <div />}
        </div>
      )}
    </article>
  )
}

/* Reusable code highlight block */
export function CodeBlock({ filename, children }: { filename?: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-6">
      {filename && (
        <div className="flex items-center gap-2 bg-[#0d1117] border border-white/[0.07] border-b-0 rounded-t-lg px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[#475569] text-xs font-mono">{filename}</span>
        </div>
      )}
      <pre className={`code-block text-sm leading-relaxed ${filename ? "rounded-t-none" : ""}`}>
        {children}
      </pre>
    </div>
  )
}

/* Callout blocks */
export function Callout({ type = "info", children }: { type?: "info" | "warn" | "error" | "tip"; children: React.ReactNode }) {
  const styles = {
    info:  { cls: "omni-card-glow", icon: "ℹ", color: "#00d4ff" },
    warn:  { cls: "callout-warn border border-[#f59e0b]/20 bg-[#f59e0b]/05 rounded-xl", icon: "⚠", color: "#f59e0b" },
    error: { cls: "callout-error border border-[#ef4444]/20 bg-[#ef4444]/05 rounded-xl", icon: "✖", color: "#ef4444" },
    tip:   { cls: "border border-[#00ff88]/20 bg-[#00ff88]/05 rounded-xl", icon: "✦", color: "#00ff88" },
  }[type]
  return (
    <div className={`not-prose flex gap-3 p-4 my-5 ${styles.cls}`}>
      <span className="shrink-0 mt-0.5 text-sm" style={{ color: styles.color }} aria-hidden="true">{styles.icon}</span>
      <div className="text-sm text-[#94a3b8] leading-relaxed">{children}</div>
    </div>
  )
}
