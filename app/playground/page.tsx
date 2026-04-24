"use client"
import { useState, useEffect, useRef } from "react"
import OmniNav from "@/components/omni-nav"
import { motion, AnimatePresence } from "motion/react"

const EXAMPLES = [
  {
    label: "Hello World",
    file: "hello.omni",
    code: `/// OMNI Hello World — 3 languages in 1 file
module hello_world

@rust
fn create_greeting(name: &str) -> String {
    format!("Hello from OMNI, {}!", name)
}

@python
def analyze_text(text: str) -> dict:
    words = text.split()
    return {
        "word_count": len(words),
        "char_count": len(text),
        "unique_words": len(set(words)),
    }

fn main() {
    let greeting = create_greeting("World")
    println(greeting)
    let stats = python::analyze_text(greeting)
    println("Stats: {stats}")
    return Ok()
}`,
    output: [
      { t: 0,    text: "[LLVM-Omni] Parsing OMNI source...",                  color: "#475569" },
      { t: 300,  text: "[LLVM-Omni] Rust AST → UAST: 4 nodes",               color: "#475569" },
      { t: 500,  text: "[LLVM-Omni] Python AST → UAST: 8 nodes",             color: "#475569" },
      { t: 700,  text: "[LLVM-Omni] Linking domains via DomainBridge...",     color: "#475569" },
      { t: 950,  text: "[LLVM-Omni] Compilation complete (Tier 1, 83ms)",     color: "#00ff88" },
      { t: 1100, text: "",                                                     color: "" },
      { t: 1200, text: "Hello from OMNI, World!",                             color: "#e2e8f0" },
      { t: 1350, text: "Stats: {'word_count': 4, 'char_count': 22, 'unique_words': 4}", color: "#e2e8f0" },
      { t: 1500, text: "",                                                     color: "" },
      { t: 1600, text: "[Runtime] Process exited with code 0",                color: "#00d4ff" },
    ],
  },
  {
    label: "Polyglot Scraper",
    file: "scraper.omni",
    code: `/// Web scraper using Go HTTP + Python parsing
module web_scraper

import { html } from "@omni/python-bs4"
import { fetch } from "@omni/go-http"

export class Scraper {
    baseUrl: string
    visited: Set<string>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.visited = new Set()
    }

    async scrape(maxPages: int = 15) -> Result<Vec<Data>, Error> {
        let queue = [this.baseUrl]
        let results = []

        while queue.len() > 0 && self.visited.len() < maxPages {
            let url = queue.shift()
            if self.visited.contains(url) { continue }
            self.visited.insert(url)

            // Go engine: high throughput concurrent HTTP
            let resp = await fetch(url)

            // Python engine: structured HTML parsing
            let soup = html.parse(resp.body)
            results.push({
                url,
                title: soup.title.text,
                links: soup.find_all("a").map(a => a.href),
            })
        }
        return Ok(results)
    }
}`,
    output: [
      { t: 0,    text: "[LLVM-Omni] Resolving NEXUS packages...",                    color: "#475569" },
      { t: 250,  text: "[NEXUS]     @omni/go-http       v3.2.1  ✓",                  color: "#475569" },
      { t: 400,  text: "[NEXUS]     @omni/python-bs4    v4.12.3 ✓",                  color: "#475569" },
      { t: 600,  text: "[LLVM-Omni] Compiling polyglot bridge...",                   color: "#475569" },
      { t: 850,  text: "[LLVM-Omni] Go AST → UAST: 12 nodes",                       color: "#475569" },
      { t: 1000, text: "[LLVM-Omni] Python AST → UAST: 21 nodes",                   color: "#475569" },
      { t: 1200, text: "[LLVM-Omni] DomainBridge: zero-copy ptr exchange enabled",   color: "#00ff88" },
      { t: 1400, text: "[LLVM-Omni] Build success (Tier 1, 127ms)",                  color: "#00ff88" },
      { t: 1600, text: "",                                                            color: "" },
      { t: 1700, text: "[Scraper]   Fetching https://example.com ...",               color: "#e2e8f0" },
      { t: 1900, text: "[Go/HTTP]   200 OK — 3.4 KB (14ms)",                         color: "#00d4ff" },
      { t: 2100, text: "[Python/BS4] Parsed 41 links, title: 'Example Domain'",      color: "#00d4ff" },
      { t: 2300, text: "[Runtime]   Scraped 1 page. Queue empty.",                   color: "#e2e8f0" },
      { t: 2500, text: "[Runtime]   Process exited with code 0",                     color: "#00d4ff" },
    ],
  },
  {
    label: "ML Pipeline",
    file: "ml.omni",
    code: `/// ML pipeline: Python training + Rust inference
module ml_pipeline

import { numpy as np } from "@omni/python-numpy"
import { torch } from "@omni/python-torch"

@python
class TextClassifier:
    def __init__(self, vocab_size: int, embed_dim: int):
        self.model = torch.nn.Sequential(
            torch.nn.Embedding(vocab_size, embed_dim),
            torch.nn.LSTM(embed_dim, 128, batch_first=True),
            torch.nn.Linear(128, 2),
            torch.nn.Softmax(dim=1),
        )

    def train(self, X, y, epochs: int = 10):
        optimizer = torch.optim.Adam(self.model.parameters())
        for epoch in range(epochs):
            loss = self.step(X, y, optimizer)
            omni::log(f"Epoch {epoch+1}: loss={loss:.4f}")

    def predict(self, text: str) -> str:
        tokens = self.tokenize(text)
        probs = self.model(tokens)
        return "positive" if probs[0][1] > 0.5 else "negative"

@rust
fn batch_infer(texts: Vec<String>, model: &PyObject) -> Vec<String> {
    texts.par_iter()
         .map(|t| python::TextClassifier::predict(model, t))
         .collect()
}

fn main() {
    let clf = python::TextClassifier::new(50_000, 128)
    clf.train(X_train, y_train, epochs=20)
    let results = batch_infer(test_texts, &clf)
    println("Accuracy: {eval(results, y_test):.2f}%")
}`,
    output: [
      { t: 0,    text: "[LLVM-Omni] Resolving NEXUS packages...",              color: "#475569" },
      { t: 200,  text: "[NEXUS]     @omni/python-numpy  v1.26.0 ✓",           color: "#475569" },
      { t: 350,  text: "[NEXUS]     @omni/python-torch  v2.2.0  ✓",           color: "#475569" },
      { t: 550,  text: "[LLVM-Omni] Singularity Tier: GPU offload enabled",   color: "#a855f7" },
      { t: 750,  text: "[LLVM-Omni] Rust parallel iterator → SIMD + rayon",   color: "#475569" },
      { t: 1000, text: "[LLVM-Omni] Build success (Tier 2, 342ms)",            color: "#00ff88" },
      { t: 1200, text: "",                                                      color: "" },
      { t: 1300, text: "[Python]    Epoch  1/20: loss=0.6931",                 color: "#e2e8f0" },
      { t: 1450, text: "[Python]    Epoch  5/20: loss=0.4201",                 color: "#e2e8f0" },
      { t: 1600, text: "[Python]    Epoch 10/20: loss=0.2847",                 color: "#e2e8f0" },
      { t: 1750, text: "[Python]    Epoch 20/20: loss=0.1092",                 color: "#e2e8f0" },
      { t: 1900, text: "[Rust]      Batch inference: 1000 samples (rayon 8x)", color: "#00d4ff" },
      { t: 2100, text: "[Runtime]   Accuracy: 94.30%",                         color: "#00ff88" },
      { t: 2300, text: "[Runtime]   Process exited with code 0",               color: "#00d4ff" },
    ],
  },
  {
    label: "HTTP Server",
    file: "server.omni",
    code: `/// HTTP/3 server: Go routing + TypeScript handlers
module http_server

import { http } from "@omni/go-http"
import { z } from "@omni/ts-zod"

// TypeScript schema validation
const UserSchema = z.object({
    name:  z.string().min(1).max(100),
    email: z.string().email(),
    role:  z.enum(["admin", "user", "viewer"]),
})

type User = z.infer<typeof UserSchema>

// Go HTTP handler
@go
func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    user, err := ts::UserSchema.parse(body)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }
    id := db::users.insert(user)
    json.NewEncoder(w).Encode(map[string]any{"id": id, "user": user})
}

#[entry]
fn main() {
    let mux = http.NewServeMux()
    mux.HandleFunc("POST /api/users", go::HandleCreateUser)
    mux.HandleFunc("GET  /health",    go::HealthCheck)
    http.ListenAndServe(":8080", mux)
    Runtime.log("Server running on :8080")
}`,
    output: [
      { t: 0,    text: "[LLVM-Omni] Resolving NEXUS packages...",             color: "#475569" },
      { t: 250,  text: "[NEXUS]     @omni/go-http    v3.2.1  ✓",             color: "#475569" },
      { t: 400,  text: "[NEXUS]     @omni/ts-zod     v3.22.4 ✓",             color: "#475569" },
      { t: 600,  text: "[LLVM-Omni] Go AST → UAST: 18 nodes",                color: "#475569" },
      { t: 750,  text: "[LLVM-Omni] TypeScript AST → UAST: 14 nodes",        color: "#475569" },
      { t: 950,  text: "[LLVM-Omni] Nexus Router: 2 endpoints registered",   color: "#475569" },
      { t: 1150, text: "[LLVM-Omni] Build success (Tier 1, 98ms)",            color: "#00ff88" },
      { t: 1300, text: "",                                                     color: "" },
      { t: 1400, text: "[Runtime]   Server running on :8080",                 color: "#00d4ff" },
      { t: 1500, text: "[HTTP/3]    POST /api/users  201  12ms",              color: "#e2e8f0" },
      { t: 1650, text: "[HTTP/3]    GET  /health     200   1ms",              color: "#e2e8f0" },
      { t: 1800, text: "[Zod]       Validated: { name, email, role } ✓",      color: "#00ff88" },
    ],
  },
]

function OmniCodeLine({ text, color }: { text: string; color: string }) {
  if (!text) return <div className="h-3" />
  return (
    <div className="font-mono text-xs leading-5" style={{ color }}>
      {text}
    </div>
  )
}

function Terminal({ lines }: { lines: typeof EXAMPLES[0]["output"] }) {
  const [shown, setShown] = useState<number[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShown([])
    const timers = lines.map((l, i) => setTimeout(() => setShown(s => [...s, i]), l.t))
    return () => timers.forEach(clearTimeout)
  }, [lines])

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [shown])

  return (
    <div ref={ref} className="h-full overflow-y-auto p-5 space-y-0.5">
      {shown.map(i => (
        <OmniCodeLine key={i} text={lines[i].text} color={lines[i].color} />
      ))}
      {shown.length < lines.length && (
        <span className="inline-block w-2 h-3.5 bg-[#00d4ff] cursor-blink align-middle" />
      )}
    </div>
  )
}

function CodeArea({ code }: { code: string }) {
  const keywords = ["module","import","export","class","fn","async","await","return","let","const","type","if","while","for","in","from"]
  const lines = code.split("\n")
  return (
    <div className="h-full overflow-auto p-5 font-mono text-xs leading-6">
      {lines.map((line, li) => {
        if (line.startsWith("///") || line.startsWith("//"))
          return <div key={li} className="sh-cmt">{line || "\u00a0"}</div>
        if (line.startsWith("    #") || line.startsWith("#"))
          return <div key={li} className="sh-dec">{line || "\u00a0"}</div>
        if (!line.trim()) return <div key={li}>&nbsp;</div>
        const parts: React.ReactNode[] = []
        let rest = line
        let key = 0
        while (rest.length > 0) {
          let matched = false
          for (const kw of keywords) {
            const re = new RegExp(`^(${kw})\\b`)
            const m = rest.match(re)
            if (m) { parts.push(<span key={key++} className="sh-kw">{m[0]}</span>); rest = rest.slice(m[0].length); matched = true; break }
          }
          if (!matched) {
            const strM = rest.match(/^(["'`]).*?\1/)
            if (strM) { parts.push(<span key={key++} className="sh-str">{strM[0]}</span>); rest = rest.slice(strM[0].length) }
            else { parts.push(<span key={key++} className="sh-var">{rest[0]}</span>); rest = rest.slice(1) }
          }
        }
        return <div key={li}>{parts}</div>
      })}
    </div>
  )
}

export default function PlaygroundPage() {
  const [active, setActive] = useState(0)
  const [runKey, setRunKey] = useState(0)
  const [running, setRunning] = useState(false)
  const [panel, setPanel] = useState<"output" | "ast">("output")

  const run = () => {
    setRunning(true)
    setRunKey(k => k + 1)
    const maxT = Math.max(...EXAMPLES[active].output.map(l => l.t))
    setTimeout(() => setRunning(false), maxT + 400)
  }

  const ast = `// Universal AST — ${EXAMPLES[active].file}
{
  "type": "Program",
  "version": "UAST-2.0",
  "domains": [
    {
      "layer": "System",
      "lang": "rust",
      "nodes": 4,
      "optimized": true
    },
    {
      "layer": "Compute",
      "lang": "python",
      "nodes": 8,
      "gpu_offload": false
    }
  ],
  "bridges": [
    {
      "from": "rust::create_greeting",
      "to":   "main",
      "cost": "0ns (zero-copy)"
    }
  ],
  "target": "x86_64-unknown-linux-gnu",
  "size_estimate": "4.1 MB"
}`

  return (
    <motion.div
      className="min-h-screen bg-[#080b12] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <OmniNav />

      <div className="flex-1 flex flex-col pt-16">
        {/* Header bar */}
        <motion.div
          className="border-b border-white/[0.06] bg-[#0d1117] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
        >
          <div>
            <motion.h1
              className="text-lg font-bold text-[#e2e8f0]"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.18 }}
            >
              OMNI Playground
            </motion.h1>
            <motion.p
              className="text-[#475569] text-xs mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
            >
              Write polyglot code — compiled &amp; executed by LLVM-Omni in-browser
            </motion.p>
          </div>
          <div className="sm:ml-auto flex items-center gap-3 flex-wrap">
            {/* Example tabs */}
            <motion.div
              className="flex items-center gap-1 bg-[#080b12] border border-white/[0.07] rounded-lg p-1"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.22 }}
            >
              {EXAMPLES.map((ex, i) => (
                <motion.button
                  key={i}
                  onClick={() => { setActive(i); setRunKey(0); setRunning(false) }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium relative ${
                    active === i ? "text-[#00d4ff]" : "text-[#475569] hover:text-[#94a3b8]"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  {active === i && (
                    <motion.div
                      layoutId="playground-tab-bg"
                      className="absolute inset-0 rounded-md bg-[#00d4ff]/15 border border-[#00d4ff]/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{ex.label}</span>
                </motion.button>
              ))}
            </motion.div>

            <motion.button
              onClick={run}
              disabled={running}
              className="relative flex items-center gap-2 bg-[#00d4ff] text-[#080b12] font-bold px-5 py-2 rounded-lg text-sm overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed glow-sm"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.28 }}
              whileHover={running ? {} : { scale: 1.04, boxShadow: "0 0 24px rgba(0,212,255,0.5)" }}
              whileTap={running ? {} : { scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 -translate-x-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                whileHover={running ? {} : { translateX: "100%" }}
                transition={{ duration: 0.45 }}
                aria-hidden="true"
              />
              <AnimatePresence mode="wait">
                {running ? (
                  <motion.span key="compiling" className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <motion.svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </motion.svg>
                    Compiling...
                  </motion.span>
                ) : (
                  <motion.span key="run" className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                    Run
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Editor + Output */}
        <motion.div
          className="flex-1 grid md:grid-cols-2 min-h-0 overflow-hidden"
          style={{ height: "calc(100vh - 8rem)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {/* Code panel */}
          <motion.div
            className="border-r border-white/[0.06] flex flex-col min-h-0"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d1117] border-b border-white/[0.06] shrink-0">
              <div className="flex gap-1.5">
                {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                  <motion.span
                    key={c}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: c }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.35 + i * 0.05 }}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={EXAMPLES[active].file}
                  className="text-[#475569] text-xs font-mono ml-1"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.18 }}
                >
                  {EXAMPLES[active].file}
                </motion.span>
              </AnimatePresence>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] text-[#334155] border border-white/[0.05] px-2 py-0.5 rounded font-mono">OMNI 2.0</span>
                <span className="text-[10px] text-[#334155] border border-white/[0.05] px-2 py-0.5 rounded font-mono">UTF-8</span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="flex-1 overflow-auto bg-[#080b12]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <CodeArea code={EXAMPLES[active].code} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Output panel */}
          <motion.div
            className="flex flex-col min-h-0"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.35 }}
          >
            <div className="flex items-center gap-1 px-4 py-2 bg-[#0d1117] border-b border-white/[0.06] shrink-0">
              {(["output", "ast"] as const).map(p => (
                <motion.button
                  key={p}
                  onClick={() => setPanel(p)}
                  className={`relative px-3 py-1 rounded text-xs font-medium ${
                    panel === p ? "text-[#00d4ff]" : "text-[#475569] hover:text-[#e2e8f0]"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {panel === p && (
                    <motion.div
                      layoutId="output-tab-bg"
                      className="absolute inset-0 rounded bg-[#00d4ff]/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{p === "output" ? "Output" : "UAST Inspector"}</span>
                </motion.button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <AnimatePresence mode="wait">
                  {running ? (
                    <motion.span key="compiling-status"
                      className="text-[10px] text-[#f59e0b] font-mono"
                      initial={{ opacity: 0 }} animate={{ opacity: [1, 0.4, 1] }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, repeat: Infinity }}>
                      Compiling...
                    </motion.span>
                  ) : runKey > 0 ? (
                    <motion.span key="done-status"
                      className="text-[10px] text-[#00ff88] font-mono"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                      Done
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-[#0a0d14]">
              <AnimatePresence mode="wait">
                {panel === "output" ? (
                  <motion.div key={`output-${active}-${runKey}`} className="h-full"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <Terminal
                      lines={runKey > 0
                        ? EXAMPLES[active].output
                        : [{ t: 0, text: "// Click Run to execute with LLVM-Omni", color: "#334155" }]}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="ast" className="h-full overflow-auto p-5 font-mono text-xs text-[#64748b] leading-6 whitespace-pre sh-cmt"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    {ast}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Status bar */}
        <motion.div
          className="border-t border-white/[0.05] bg-[#0d1117] px-6 py-2 flex items-center gap-6 text-[10px] font-mono text-[#334155]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.span
            className="text-[#00d4ff]"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            OMNI v2.0.0
          </motion.span>
          <span>LLVM-Omni Tier 1</span>
          <span>Target: x86_64</span>
          <span>NEXUS: connected</span>
          <span className="ml-auto">Delta-Compilation: enabled</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
