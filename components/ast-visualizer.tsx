// @ts-nocheck
"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "motion/react"

/* ── Code snippets per language ──────────────────────────── */
const PANELS = [
  {
    id: "rust",
    label: "Rust",
    color: "#ef4444",
    dotColor: "#ff6b6b",
    lines: [
      { t: "fn",      c: "#00f2ff" },
      { t: " compute_hash",  c: "#7DF9AA" },
      { t: "(data: ",  c: "#CBD5E1" },
      { t: "&[u8]",   c: "#FFD166" },
      { t: ") -> ",   c: "#CBD5E1" },
      { t: "u64",     c: "#FFD166" },
      { t: " {",      c: "#CBD5E1" },
    ],
    extra: [
      "  let mut h = 0u64;",
      "  for b in data {",
      "    h ^= *b as u64;",
      "  }",
      "  h",
      "}",
    ],
    astNodes: [
      { id: "r0", label: "FnDecl",    rx: 0.09, ry: 0.14 },
      { id: "r1", label: "ParamList", rx: 0.05, ry: 0.32 },
      { id: "r2", label: "Block",     rx: 0.13, ry: 0.32 },
      { id: "r3", label: "ForStmt",   rx: 0.07, ry: 0.50 },
      { id: "r4", label: "XorExpr",   rx: 0.12, ry: 0.50 },
      { id: "r5", label: "Return",    rx: 0.09, ry: 0.68 },
    ],
    edges: [
      ["r0","r1"],["r0","r2"],["r2","r3"],["r2","r4"],["r3","r5"],["r4","r5"],
    ],
    mergeFrom: "r5",
  },
  {
    id: "go",
    label: "Go",
    color: "#00d4ff",
    dotColor: "#22e0ff",
    lines: [
      { t: "func",    c: "#00f2ff" },
      { t: " ServeHTTP",    c: "#7DF9AA" },
      { t: "(",       c: "#CBD5E1" },
      { t: "w ",      c: "#FFD166" },
      { t: "http.ResponseWriter",  c: "#C084FC" },
      { t: ",",       c: "#CBD5E1" },
    ],
    extra: [
      "    r *http.Request,",
      ") {",
      "  h := bridge.Hash(r.Body)",
      '  fmt.Fprintf(w, h)',
      "}",
      "",
    ],
    astNodes: [
      { id: "g0", label: "FuncDecl",  rx: 0.50, ry: 0.10 },
      { id: "g1", label: "RecvType",  rx: 0.43, ry: 0.27 },
      { id: "g2", label: "BlockStmt", rx: 0.57, ry: 0.27 },
      { id: "g3", label: "CallExpr",  rx: 0.46, ry: 0.44 },
      { id: "g4", label: "FmtCall",   rx: 0.54, ry: 0.44 },
      { id: "g5", label: "RetVoid",   rx: 0.50, ry: 0.62 },
    ],
    edges: [
      ["g0","g1"],["g0","g2"],["g2","g3"],["g2","g4"],["g3","g5"],["g4","g5"],
    ],
    mergeFrom: "g5",
  },
  {
    id: "python",
    label: "Python",
    color: "#f59e0b",
    dotColor: "#fbbf24",
    lines: [
      { t: "def",     c: "#00f2ff" },
      { t: " ml_pipeline",  c: "#7DF9AA" },
      { t: "(",       c: "#CBD5E1" },
      { t: "raw",     c: "#FF6B9D" },
      { t: ": ",      c: "#CBD5E1" },
      { t: "bytes",   c: "#FFD166" },
      { t: ") -> ",   c: "#CBD5E1" },
      { t: "float",   c: "#FFD166" },
      { t: ":",       c: "#CBD5E1" },
    ],
    extra: [
      "  h   = omni.hash(raw)",
      "  vec = embed(h)",
      "  score = model(vec)",
      "  return score",
      "",
      "",
    ],
    astNodes: [
      { id: "p0", label: "FunctionDef", rx: 0.91, ry: 0.14 },
      { id: "p1", label: "ArgList",     rx: 0.85, ry: 0.32 },
      { id: "p2", label: "Suite",       rx: 0.95, ry: 0.32 },
      { id: "p3", label: "Assign",      rx: 0.88, ry: 0.50 },
      { id: "p4", label: "CallExpr",    rx: 0.96, ry: 0.50 },
      { id: "p5", label: "Return",      rx: 0.91, ry: 0.68 },
    ],
    edges: [
      ["p0","p1"],["p0","p2"],["p2","p3"],["p2","p4"],["p3","p5"],["p4","p5"],
    ],
    mergeFrom: "p5",
  },
]

const OMNI_NODE = { id: "ast", label: "OMNI AST", rx: 0.50, ry: 0.88 }

/* ── Canvas renderer ─────────────────────────────────────── */
function ASTCanvas({ hovered }: { hovered: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const tick      = useRef(0)

  const draw = useCallback(() => {
    const cv  = canvasRef.current; if (!cv) return
    const ctx = cv.getContext("2d"); if (!ctx) return
    const W = cv.width, H = cv.height
    tick.current++
    const t = tick.current

    ctx.clearRect(0, 0, W, H)

    /* ── Cyber grid ── */
    const gs = 28
    ctx.lineWidth = 0.6
    for (let x = 0; x <= W; x += gs) {
      ctx.beginPath()
      ctx.strokeStyle = x % (gs * 4) === 0 ? "rgba(0,242,255,0.07)" : "rgba(0,242,255,0.028)"
      ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y <= H; y += gs) {
      ctx.beginPath()
      ctx.strokeStyle = y % (gs * 4) === 0 ? "rgba(0,242,255,0.07)" : "rgba(0,242,255,0.028)"
      ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    /* ── Horizontal pulse scan line ── */
    const scanY = ((t * 1.2) % (H + 60)) - 30
    const sg = ctx.createLinearGradient(0, scanY - 24, 0, scanY + 24)
    sg.addColorStop(0, "transparent")
    sg.addColorStop(0.5, "rgba(0,242,255,0.055)")
    sg.addColorStop(1, "transparent")
    ctx.fillStyle = sg; ctx.fillRect(0, scanY - 24, W, 48)

    /* ── Vertical pulse column ── */
    const scanX = ((t * 0.6 + 80) % (W + 60)) - 30
    const cg = ctx.createLinearGradient(scanX - 24, 0, scanX + 24, 0)
    cg.addColorStop(0, "transparent")
    cg.addColorStop(0.5, "rgba(0,242,255,0.025)")
    cg.addColorStop(1, "transparent")
    ctx.fillStyle = cg; ctx.fillRect(scanX - 24, 0, 48, H)

    /* ── Resolve position ── */
    const pos = (rx: number, ry: number) => ({ x: rx * W, y: ry * H })
    const astPos = pos(OMNI_NODE.rx, OMNI_NODE.ry)

    /* ── Draw all edges + merge edges ── */
    PANELS.forEach(panel => {
      const isLit = hovered === null || hovered === panel.id

      /* Internal edges */
      panel.edges.forEach(([a, b]) => {
        const na = panel.astNodes.find(n => n.id === a)!
        const nb = panel.astNodes.find(n => n.id === b)!
        const pa = pos(na.rx, na.ry), pb = pos(nb.rx, nb.ry)
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y)
        ctx.strokeStyle = isLit ? `${panel.color}50` : `${panel.color}12`
        ctx.lineWidth = isLit ? 1.2 : 0.6
        ctx.setLineDash([3, 4]); ctx.lineDashOffset = -(t * 0.6)
        ctx.stroke(); ctx.setLineDash([])
      })

      /* Merge edge → OMNI AST */
      const mergeNode = panel.astNodes.find(n => n.id === panel.mergeFrom)!
      const mp = pos(mergeNode.rx, mergeNode.ry)

      /* Dashed merge line */
      ctx.beginPath()
      ctx.moveTo(mp.x, mp.y); ctx.lineTo(astPos.x, astPos.y)
      const alpha = isLit ? (hovered === panel.id ? 0.9 : 0.35) : 0.08
      ctx.strokeStyle = `${panel.color}` + Math.round(alpha * 255).toString(16).padStart(2, "0")
      ctx.lineWidth = hovered === panel.id ? 2 : 1
      ctx.setLineDash([5, 5]); ctx.lineDashOffset = -(t * 1.2)
      ctx.stroke(); ctx.setLineDash([])

      /* Travelling particle on merge edge */
      const offsets = { rust: 0, go: 40, python: 80 }
      const pct = ((t * 1.6 + (offsets[panel.id as keyof typeof offsets] ?? 0)) % 100) / 100
      const px = mp.x + (astPos.x - mp.x) * pct
      const py = mp.y + (astPos.y - mp.y) * pct
      const particleR = hovered === panel.id ? 5 : 3
      const pg = ctx.createRadialGradient(px, py, 0, px, py, particleR * 2)
      pg.addColorStop(0, panel.color)
      pg.addColorStop(1, "transparent")
      ctx.fillStyle = pg
      ctx.beginPath(); ctx.arc(px, py, particleR * 2, 0, Math.PI * 2); ctx.fill()
    })

    /* ── AST Nodes ── */
    PANELS.forEach(panel => {
      const isLit = hovered === null || hovered === panel.id
      panel.astNodes.forEach((n, idx) => {
        const { x, y } = pos(n.rx, n.ry)
        const r = 18
        const pulse = Math.sin(t * 0.05 + idx * 0.8) * 0.08

        /* Glow */
        const gr = ctx.createRadialGradient(x, y, 0, x, y, 28)
        gr.addColorStop(0, isLit ? `${panel.color}25` : `${panel.color}08`)
        gr.addColorStop(1, "transparent")
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill()

        /* Circle */
        ctx.beginPath(); ctx.arc(x, y, r * (1 + pulse), 0, Math.PI * 2)
        ctx.fillStyle   = isLit ? `${panel.color}18` : `${panel.color}07`
        ctx.fill()
        ctx.strokeStyle = isLit ? `${panel.color}${hovered === panel.id ? "ee" : "80"}` : `${panel.color}22`
        ctx.lineWidth   = hovered === panel.id ? 1.8 : 1
        ctx.stroke()

        /* Label */
        ctx.fillStyle    = isLit ? "#e2e8f0" : "#1e293b"
        ctx.font         = "9px monospace"
        ctx.textAlign    = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(n.label, x, y)
      })
    })

    /* ── Central OMNI AST node ── */
    const { x: ax, y: ay } = astPos
    const isAnyHovered = hovered !== null
    const astPulse = Math.sin(t * 0.04) * 0.06

    /* Outer glow rings */
    ;[80, 60, 44].forEach((r, i) => {
      const alpha = isAnyHovered ? [0.18, 0.14, 0.10][i] : [0.10, 0.07, 0.05][i]
      const ring = ctx.createRadialGradient(ax, ay, 0, ax, ay, r)
      ring.addColorStop(0, `rgba(0,242,255,${alpha + Math.sin(t * 0.04 + i) * 0.04})`)
      ring.addColorStop(1, "transparent")
      ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(ax, ay, r, 0, Math.PI * 2); ctx.fill()
    })

    /* Rotating orbit rings */
    ;[38, 50].forEach((r, i) => {
      const segments = 8
      for (let s = 0; s < segments; s++) {
        const a0 = ((s / segments) * Math.PI * 2) + t * (i === 0 ? 0.018 : -0.012)
        const a1 = a0 + (Math.PI * 2 / segments) * 0.4
        ctx.beginPath(); ctx.arc(ax, ay, r, a0, a1)
        ctx.strokeStyle = isAnyHovered ? `rgba(0,242,255,0.55)` : "rgba(0,242,255,0.25)"
        ctx.lineWidth = i === 0 ? 1.5 : 1; ctx.stroke()
      }
    })

    /* Core circle */
    ctx.beginPath(); ctx.arc(ax, ay, 28 * (1 + astPulse), 0, Math.PI * 2)
    ctx.fillStyle   = isAnyHovered ? "rgba(0,242,255,0.12)" : "rgba(0,242,255,0.06)"
    ctx.fill()
    ctx.strokeStyle = isAnyHovered ? "rgba(0,242,255,0.9)" : "rgba(0,242,255,0.45)"
    ctx.lineWidth   = 1.8; ctx.stroke()

    /* AST label */
    ctx.fillStyle    = "#00f2ff"
    ctx.font         = "bold 10px monospace"
    ctx.textAlign    = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("OMNI AST", ax, ay - 4)
    ctx.font         = "8px monospace"
    ctx.fillStyle    = "rgba(0,242,255,0.5)"
    ctx.fillText("Zero-FFI", ax, ay + 6)

    rafRef.current = requestAnimationFrame(draw)
  }, [hovered])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    const ro = new ResizeObserver(() => {
      cv.width  = cv.offsetWidth
      cv.height = cv.offsetHeight
    })
    ro.observe(cv)
    cv.width  = cv.offsetWidth
    cv.height = cv.offsetHeight
    return () => ro.disconnect()
  }, [])

  return (
    <canvas ref={canvasRef} className="w-full h-full"
      aria-label="Universal AST flow diagram — hover a language to trace merge path" />
  )
}

/* ── Code panel ──────────────────────────────────────────── */
function CodePanel({
  panel, isActive, onEnter, onLeave,
}: {
  panel: typeof PANELS[0]
  isActive: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  return (
    <motion.div
      className="flex-1 min-w-0 rounded-xl border overflow-hidden cursor-pointer select-none"
      style={{
        borderColor: isActive ? `${panel.color}70` : `${panel.color}18`,
        background: isActive ? `${panel.color}0a` : "rgba(8,11,18,0.96)",
      }}
      animate={{ boxShadow: isActive ? `0 0 28px ${panel.color}22, 0 0 2px ${panel.color}40` : "none" }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.015 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: `${panel.color}18`, background: `${panel.color}06` }}>
        <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: panel.dotColor }}
          animate={{ opacity: isActive ? [0.5, 1, 0.5] : 0.35, scale: isActive ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 1.4, repeat: Infinity }}
          aria-hidden="true" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: panel.color }}>
          {panel.label}
        </span>
        <span className="ml-auto text-[9px] font-mono text-[#1e293b]">@{panel.id}</span>
      </div>

      {/* Code */}
      <div className="px-3 py-2.5 font-mono text-[10px] leading-[18px]">
        {/* Signature line — tokenized */}
        <div className="flex flex-wrap">
          {panel.lines.map((l, i) => (
            <span key={i} style={{ color: l.c }}>{l.t}</span>
          ))}
        </div>
        {/* Body lines */}
        {panel.extra.map((line, i) => (
          <div key={i} style={{ color: "#4A6B8A" }}>{line || "\u00a0"}</div>
        ))}
      </div>

      {/* Hover badge */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="mx-2 mb-2 px-2 py-1 rounded-lg text-[9px] font-mono text-center"
            style={{ background: `${panel.color}12`, color: panel.color, border: `1px solid ${panel.color}22` }}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
          >
            Tracing {panel.label} AST path to OMNI node
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Main export ─────────────────────────────────────────── */
export default function ASTVisualizer() {
  const [hovered, setHovered] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView  = useInView(wrapRef, { once: true, margin: "-80px 0px" })

  return (
    <div ref={wrapRef} className="w-full">
      <motion.div
        className="rounded-2xl border border-white/[0.07] overflow-hidden"
        style={{ background: "rgba(5,8,14,0.98)" }}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05]"
          style={{ background: "rgba(0,242,255,0.02)" }}>
          <div className="flex gap-1.5" aria-hidden="true">
            {["#ff5f57", "#febc2e", "#28c840"].map(c => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#334155]">universal-ast-visualizer.omni</span>
          <div className="ml-auto flex items-center gap-3">
            <motion.div className="flex items-center gap-1.5"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]" aria-hidden="true" />
              <span className="text-[10px] font-mono text-[#00f2ff]">LIVE</span>
            </motion.div>
            <span className="text-[9px] font-mono text-[#1e293b] border border-[#00f2ff]/15 px-2 py-0.5 rounded-full">
              Zero-FFI merge active
            </span>
          </div>
        </div>

        {/* Code panels */}
        <div className="flex gap-2 p-3 pb-2">
          {PANELS.map(p => (
            <CodePanel
              key={p.id}
              panel={p}
              isActive={hovered === p.id}
              onEnter={() => setHovered(p.id)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>

        {/* Canvas */}
        <div className="relative mx-3 mb-3 rounded-xl overflow-hidden border border-white/[0.04]"
          style={{ height: 310 }}>
          <ASTCanvas hovered={hovered} />

          {/* Instruction overlay */}
          <AnimatePresence>
            {hovered === null && (
              <motion.div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              >
                <span className="text-[9px] font-mono text-[#334155] bg-black/40 px-3 py-1.5 rounded-full border border-white/[0.05]">
                  Hover a language panel above to trace the zero-FFI merge path
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active merge label */}
          <AnimatePresence>
            {hovered !== null && (() => {
              const p = PANELS.find(x => x.id === hovered)!
              return (
                <motion.div
                  key={hovered}
                  className="absolute top-3 right-3 text-[9px] font-mono px-2.5 py-1.5 rounded-xl border"
                  style={{ background: `${p.color}10`, color: p.color, borderColor: `${p.color}28` }}
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  {p.label} AST &rarr; OMNI AST &nbsp;·&nbsp; 0 FFI calls &nbsp;·&nbsp; 0 bytes serialized
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>

        {/* Footer metrics */}
        <div className="flex items-center gap-6 px-5 py-3 border-t border-white/[0.04]"
          style={{ background: "rgba(0,242,255,0.015)" }}>
          {[
            { label: "FFI Calls",         val: "0",      color: "#00f2ff" },
            { label: "Serialization Cost", val: "0 bytes", color: "#00ff88" },
            { label: "Cross-lang Inline",  val: "enabled", color: "#a855f7" },
            { label: "IR Format",          val: "LLVM-Omni", color: "#f59e0b" },
          ].map(m => (
            <div key={m.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono font-bold" style={{ color: m.color }}>{m.val}</span>
              <span className="text-[9px] font-mono text-[#334155]">{m.label}</span>
            </div>
          ))}
          <div className="ml-auto text-[9px] font-mono text-[#1e293b]">
            ARM64 · LLVM-Omni 2.0 · -O3 + LTO
          </div>
        </div>
      </motion.div>
    </div>
  )
}
