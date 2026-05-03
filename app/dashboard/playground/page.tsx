// @ts-nocheck
"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"

const sp = { type: "spring", stiffness: 300, damping: 26 } as const

/* ─── starter templates ───────────────────────────────────── */
const TEMPLATES: Record<string, { lang: string; code: string }> = {
  "Hello World – Rust": {
    lang: "rust",
    code: `// OMNI Rust — polyglot hello world
fn main() {
    println!("Hello from OMNI Runtime!");
    let langs = vec!["Rust", "Go", "Python", "TypeScript", "Julia"];
    for lang in &langs {
        println!("  → {} is supported", lang);
    }
    let cold_start_ms: f64 = 7.3;
    println!("\\nCold start: {cold_start_ms}ms ⚡");
}`,
  },
  "Fibonacci – Go": {
    lang: "go",
    code: `// OMNI Go — fast fibonacci
package main

import "fmt"

func fib(n int) int {
    if n <= 1 { return n }
    a, b := 0, 1
    for i := 2; i <= n; i++ {
        a, b = b, a+b
    }
    return b
}

func main() {
    fmt.Println("Fibonacci sequence:")
    for i := 0; i <= 15; i++ {
        fmt.Printf("  fib(%d) = %d\\n", i, fib(i))
    }
}`,
  },
  "Data Pipeline – Python": {
    lang: "python",
    code: `# OMNI Python — data pipeline example
import json
from datetime import datetime

data = [
    {"lang": "Rust",       "builds": 142, "success_rate": 0.98},
    {"lang": "Go",         "builds": 97,  "success_rate": 0.97},
    {"lang": "Python",     "builds": 83,  "success_rate": 0.95},
    {"lang": "TypeScript", "builds": 71,  "success_rate": 0.96},
]

print("OMNI Build Report —", datetime.now().strftime("%Y-%m-%d"))
print("-" * 44)

total_builds  = sum(d["builds"] for d in data)
avg_success   = sum(d["success_rate"] for d in data) / len(data)

for d in sorted(data, key=lambda x: x["builds"], reverse=True):
    bar = "█" * int(d["builds"] / 5)
    print(f"  {d['lang']:<14} {d['builds']:>3} builds  {bar}")

print(f"\\nTotal builds : {total_builds}")
print(f"Avg success  : {avg_success:.1%}")
`,
  },
  "Polyglot FFI – TypeScript": {
    lang: "typescript",
    code: `// OMNI TypeScript — cross-language interop
import { OmniRuntime } from "@omni/runtime"

const runtime = new OmniRuntime({ version: "2.0.0" })

async function benchmark() {
  const languages = ["rust", "go", "python", "julia"] as const

  console.log("OMNI Cross-Language Benchmark")
  console.log("=".repeat(40))

  for (const lang of languages) {
    const { coldStart, throughput } = await runtime.profile(lang, {
      task: "matrix_multiply",
      size: 512,
    })
    console.log(\`\${lang.padEnd(12)} cold=\${coldStart}ms  tps=\${throughput}\`)
  }
}

benchmark().catch(console.error)
`,
  },
}

/* ─── lang colors ─────────────────────────────────────────── */
const LANG_CFG: Record<string, { color: string; bg: string }> = {
  rust:       { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  go:         { color: "#00d4ff", bg: "rgba(0,212,255,0.1)" },
  python:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  typescript: { color: "#3178c6", bg: "rgba(49,120,198,0.12)" },
  julia:      { color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
}

/* ─── fake output generator ─────────────────────────────────── */
function simulateRun(template: string): string[] {
  const lines: Record<string, string[]> = {
    "Hello World – Rust": [
      "\x1b[32m→ Compiled with LLVM-Omni 16.0.3 in 0.8s\x1b[0m",
      "\x1b[90m→ Unikernel cold start: 7.3ms\x1b[0m",
      "\x1b[90m───────────────────────────────\x1b[0m",
      "Hello from OMNI Runtime!",
      "  → Rust is supported",
      "  → Go is supported",
      "  → Python is supported",
      "  → TypeScript is supported",
      "  → Julia is supported",
      "",
      "Cold start: 7.3ms ⚡",
      "\x1b[32m\nProcess exited with code 0\x1b[0m",
    ],
    "Fibonacci – Go": [
      "\x1b[32m→ Compiled with LLVM-Omni 16.0.3 in 0.4s\x1b[0m",
      "\x1b[90m→ Unikernel cold start: 5.1ms\x1b[0m",
      "\x1b[90m───────────────────────────────\x1b[0m",
      "Fibonacci sequence:",
      "  fib(0) = 0",  "  fib(1) = 1",  "  fib(2) = 1",
      "  fib(3) = 2",  "  fib(4) = 3",  "  fib(5) = 5",
      "  fib(6) = 8",  "  fib(7) = 13", "  fib(8) = 21",
      "  fib(9) = 34", "  fib(10) = 55","  fib(11) = 89",
      "  fib(12) = 144","  fib(13) = 233","  fib(14) = 377",
      "  fib(15) = 610",
      "\x1b[32m\nProcess exited with code 0\x1b[0m",
    ],
    "Data Pipeline – Python": [
      "\x1b[32m→ Compiled with LLVM-Omni 16.0.3 in 1.1s\x1b[0m",
      "\x1b[90m→ Unikernel cold start: 8.9ms\x1b[0m",
      "\x1b[90m───────────────────────────────\x1b[0m",
      `OMNI Build Report — ${new Date().toISOString().slice(0,10)}`,
      "--------------------------------------------",
      "  Rust           142 builds  ████████████████████████████",
      "  Go              97 builds  ███████████████████",
      "  Python          83 builds  ████████████████",
      "  TypeScript      71 builds  ██████████████",
      "",
      "Total builds : 393",
      "Avg success  : 96.5%",
      "\x1b[32m\nProcess exited with code 0\x1b[0m",
    ],
    "Polyglot FFI – TypeScript": [
      "\x1b[32m→ Compiled with LLVM-Omni 16.0.3 in 1.4s\x1b[0m",
      "\x1b[90m→ Unikernel cold start: 6.2ms\x1b[0m",
      "\x1b[90m───────────────────────────────\x1b[0m",
      "OMNI Cross-Language Benchmark",
      "========================================",
      "rust         cold=7ms  tps=4,200,000",
      "go           cold=5ms  tps=3,800,000",
      "python       cold=9ms  tps=890,000",
      "julia        cold=11ms tps=2,100,000",
      "\x1b[32m\nProcess exited with code 0\x1b[0m",
    ],
  }
  return lines[template] ?? ["\x1b[90mNo output.\x1b[0m"]
}

/* ─── ansi → react ───────────────────────────────────────── */
function AnsiLine({ text }: { text: string }) {
  if (text.includes("\x1b[32m"))  return <span className="text-[#00ff88]">{text.replace(/\x1b\[\d+m/g, "")}</span>
  if (text.includes("\x1b[90m"))  return <span className="text-[#475569]">{text.replace(/\x1b\[\d+m/g, "")}</span>
  if (text.includes("\x1b[31m"))  return <span className="text-[#ef4444]">{text.replace(/\x1b\[\d+m/g, "")}</span>
  return <span className="text-[#94a3b8]">{text}</span>
}

/* ─── main page ──────────────────────────────────────────── */
export default function PlaygroundPage() {
  const [templateName, setTemplateName] = useState("Hello World – Rust")
  const [code,     setCode]    = useState(TEMPLATES["Hello World – Rust"].code)
  const [running,  setRunning] = useState(false)
  const [output,   setOutput]  = useState<string[]>([])
  const [ran,      setRan]     = useState(false)
  const [fontSize, setFontSize]= useState(13)
  const outputRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lang = TEMPLATES[templateName]?.lang ?? "text"
  const cfg  = LANG_CFG[lang] ?? { color: "#64748b", bg: "rgba(100,116,139,0.1)" }

  // auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  function loadTemplate(name: string) {
    setTemplateName(name)
    setCode(TEMPLATES[name].code)
    setOutput([])
    setRan(false)
  }

  const runCode = useCallback(async () => {
    setRunning(true)
    setOutput([])
    setRan(false)
    const lines = simulateRun(templateName)
    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 55 + Math.random() * 60))
      setOutput(prev => [...prev, lines[i]])
    }
    setRunning(false)
    setRan(true)
  }, [templateName])

  // cmd/ctrl+enter to run
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); runCode() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [runCode])

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* header */}
      <motion.div className="flex items-center justify-between"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={sp}>
        <div>
          <h1 className="text-2xl font-black text-[#e2e8f0]">Playground</h1>
          <p className="text-[#475569] text-sm font-mono mt-0.5">Write &amp; run polyglot code in the browser — OMNI Runtime v2.0</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#334155]">Ctrl+Enter to run</span>
        </div>
      </motion.div>

      {/* toolbar */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...sp, delay: 0.06 }}
      >
        {/* template picker */}
        <div className="flex items-center gap-1.5 bg-[#0d1117]/80 border border-white/[0.07] rounded-xl p-1 flex-wrap">
          {Object.keys(TEMPLATES).map(name => (
            <motion.button
              key={name}
              onClick={() => loadTemplate(name)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap ${templateName === name ? "text-[#e2e8f0]" : "text-[#475569]"}`}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            >
              {templateName === name && (
                <motion.div layoutId="template-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }} aria-hidden="true" />
              )}
              <span className="relative z-10">{name}</span>
            </motion.button>
          ))}
        </div>

        {/* font size */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-mono text-[#334155]">Font</span>
          {[11, 13, 15].map(s => (
            <motion.button
              key={s}
              onClick={() => setFontSize(s)}
              className={`w-7 h-7 rounded-lg text-[11px] font-mono border ${fontSize === s ? "border-[#00d4ff]/30 text-[#00d4ff] bg-[#00d4ff]/08" : "border-white/[0.07] text-[#475569]"}`}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* editor + output split */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...sp, delay: 0.1 }}
      >
        {/* editor pane */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col"
          style={{ background: "rgba(8,11,18,0.95)", minHeight: 500 }}>
          {/* pane header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" aria-hidden="true" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" aria-hidden="true" />
              <div className="w-3 h-3 rounded-full bg-[#00ff88]/60" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-mono text-[#334155]">main.{lang === "typescript" ? "ts" : lang}</span>
            <motion.span
              className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold"
              style={{ color: cfg.color, background: cfg.bg }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {lang.toUpperCase()}
            </motion.span>
          </div>

          {/* code editor */}
          <div className="flex-1 flex relative">
            {/* line numbers */}
            <div className="select-none py-4 px-3 text-right border-r border-white/[0.05] min-w-[44px] shrink-0">
              {code.split("\n").map((_, i) => (
                <div key={i} className="leading-6 text-[#1e293b] font-mono"
                  style={{ fontSize: fontSize - 2 }}>
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent text-[#94a3b8] font-mono resize-none outline-none py-4 px-4 leading-6 w-full"
              style={{ fontSize, tabSize: 2 }}
              aria-label="Code editor"
            />
          </div>

          {/* run button */}
          <div className="border-t border-white/[0.05] p-3 flex items-center gap-3">
            <motion.button
              onClick={runCode}
              disabled={running}
              className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: running ? "rgba(0,255,136,0.06)" : "rgba(0,255,136,0.12)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.25)" }}
              whileHover={!running ? { scale: 1.03, boxShadow: "0 0 24px rgba(0,255,136,0.25)" } : {}}
              whileTap={!running ? { scale: 0.97 } : {}}
              transition={sp}
              aria-label="Run code"
            >
              <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.07), transparent)" }}
                whileHover={{ translateX: "100%" }} transition={{ duration: 0.5 }} aria-hidden="true" />
              <AnimatePresence mode="wait">
                {running ? (
                  <motion.div key="spin" className="w-4 h-4 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true" />
                ) : (
                  <motion.svg key="play" className="w-4 h-4 relative z-10" viewBox="0 0 20 20" fill="none"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
                    <path d="M6 4.5l8 5.5-8 5.5V4.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </AnimatePresence>
              <span className="relative z-10">{running ? "Running…" : "Run"}</span>
            </motion.button>
            <motion.button
              onClick={() => { setCode(TEMPLATES[templateName].code); setOutput([]); setRan(false) }}
              className="px-3 py-2.5 rounded-xl text-[11px] font-mono text-[#475569] border border-white/[0.07] hover:text-[#e2e8f0] hover:border-white/[0.14] transition-colors"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Reset
            </motion.button>
            <span className="ml-auto text-[10px] font-mono text-[#1e293b]">{code.split("\n").length} lines</span>
          </div>
        </div>

        {/* output pane */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col"
          style={{ background: "rgba(4,6,10,0.98)", minHeight: 500 }}>
          {/* pane header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]/40" aria-hidden="true" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]/40" aria-hidden="true" />
              <div className="w-3 h-3 rounded-full bg-[#00ff88]/40" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-mono text-[#334155]">stdout / stderr</span>
            {running && (
              <motion.span
                className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[#f59e0b]"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" aria-hidden="true" />
                RUNNING
              </motion.span>
            )}
            {ran && !running && (
              <motion.span
                className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[#00ff88]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" aria-hidden="true" />
                DONE
              </motion.span>
            )}
          </div>

          {/* output */}
          <div
            ref={outputRef}
            className="flex-1 p-4 font-mono overflow-auto leading-6 scrollbar-hide"
            style={{ fontSize: fontSize - 1 }}
          >
            {output.length === 0 && !running ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl border border-white/[0.06] flex items-center justify-center text-[#1e293b]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 6l4 4 4-4M8 12l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <p className="text-[#1e293b] text-xs">Press Run to execute code</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {output.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="whitespace-pre"
                  >
                    <AnsiLine text={line || " "} />
                  </motion.div>
                ))}
                {running && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-[#00ff88] ml-0.5 align-text-bottom"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
