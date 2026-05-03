"use client"
import Link from "next/link"
import { useRef, useState } from "react"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "motion/react"

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────── */
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const fadeUp    = { hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } } }

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const LANGUAGE_MATRIX = [
  { lang: "Rust",       domain: "Systems / Safety",   icon: "@rust",    color: "#e05d44", bg: "#1a0c0a", use: "Runtime core, memory management, cryptography, zero-copy buffers" },
  { lang: "Go",         domain: "Networking / APIs",   icon: "@go",      color: "#00aed8", bg: "#001a20", use: "HTTP/3 gateway, gRPC servers, concurrent I/O, service mesh" },
  { lang: "Python",     domain: "ML / Data Science",  icon: "@python",  color: "#ffd43b", bg: "#1a1600", use: "Machine learning, NumPy arrays, Pandas DataFrames, scripting" },
  { lang: "TypeScript", domain: "Frontend / UI",       icon: "@ts",      color: "#3178c6", bg: "#00081a", use: "React components, Next.js routes, type-safe API clients" },
  { lang: "C",          domain: "Low-level / Embeds",  icon: "@c",       color: "#555599", bg: "#090910", use: "Hardware drivers, SIMD intrinsics, embedded firmware" },
  { lang: "C++",        domain: "Performance / Game",  icon: "@cpp",     color: "#004488", bg: "#00020f", use: "Game engines, physics, real-time DSP, HPC workloads" },
  { lang: "Julia",      domain: "Scientific / HPC",   icon: "@julia",   color: "#9558b2", bg: "#130016", use: "Numerical analysis, linear algebra, climate simulations" },
  { lang: "Swift",      domain: "Native Mobile/macOS", icon: "@swift",   color: "#ff5c00", bg: "#1a0900", use: "iOS native UI, macOS apps, SwiftUI bridging" },
  { lang: "R",          domain: "Statistics / BI",    icon: "@r",       color: "#276dc3", bg: "#00071a", use: "Statistical modeling, ggplot2 charting, R Markdown reports" },
  { lang: "HTML",       domain: "Markup / Templates",  icon: "@html",    color: "#e44d26", bg: "#1a0900", use: "Server-side templates, email rendering, static docs" },
  { lang: "GraphQL",    domain: "API Schema / Query",  icon: "@graphql", color: "#e10098", bg: "#1a0010", use: "Type-safe API schemas, resolver generation, subscriptions" },
  { lang: "C#",         domain: "Enterprise / .NET",  icon: "@cs",      color: "#512bd4", bg: "#0d001a", use: "Enterprise services, Azure interop, Unity game scripting" },
  { lang: "Ruby",       domain: "DSL / Scripting",    icon: "@ruby",    color: "#cc342d", bg: "#1a0400", use: "CLI tools, configuration DSLs, meta-programming" },
  { lang: "PHP",        domain: "Web / Legacy",       icon: "@php",     color: "#777bb4", bg: "#0d0c18", use: "WordPress plugins, legacy web, server-side rendering" },
  { lang: "JavaScript", domain: "Web / Node.js",      icon: "@js",      color: "#f7df1e", bg: "#1a1900", use: "Browser scripting, Node.js microservices, Deno workers" },
]

const ARCHITECTURE_LAYERS = [
  {
    layer: "Layer 1 — Source",
    color: "#00d4ff",
    desc: "Developer writes .omni files with language-annotated blocks (@rust, @go, @python…). Native syntax per block, no wrappers.",
    detail: "The OMNI CLI tool validates file structure and ensures each language block follows that language's own syntax rules.",
  },
  {
    layer: "Layer 2 — UAST",
    color: "#a855f7",
    desc: "Each block is lexed and parsed independently. The resulting ASTs are merged into a Universal Abstract Syntax Tree with cross-language type contracts.",
    detail: "UAST stores nodes as typed IR with provenance — you always know which source language produced each node. 1,247 node types across 15 grammars.",
  },
  {
    layer: "Layer 3 — LLVM-Omni",
    color: "#f59e0b",
    desc: "The UAST is lowered to LLVM IR. Optimization passes (vectorize, inline, unroll, LTO) run across the entire mixed codebase.",
    detail: "4.1x SIMD speedup from automatic vectorization. Dead-code elimination removes on average 12 KB from each build.",
  },
  {
    layer: "Layer 4 — Runtime",
    color: "#00ff88",
    desc: "The linked binary runs on OMNI Runtime — a Rust-core event loop with Go goroutine scheduler and Python GIL bypass via native threads.",
    detail: "Zero-copy shared memory between language domains. No JSON serialization between Rust and Python — raw pointer passing via DomainBridge.",
  },
  {
    layer: "Layer 5 — Deploy",
    color: "#e05d44",
    desc: "Output as native binary, OCI container, unikernel, or WASM module. Deploy to any cloud, edge network, or embedded target.",
    detail: "Unikernel images boot in < 10ms. Edge mode targets Vercel, Cloudflare Workers, Fastly Compute@Edge, and Deno Deploy.",
  },
]

const CODE_EXAMPLES = [
  {
    title: "Hello World — 3 Languages in 1 File",
    desc:  "The simplest OMNI program demonstrating polyglot syntax",
    lang:  "omni",
    code: `/// hello.omni — multi-language hello world
module hello_world

@rust
fn greet(name: &str) -> String {
    format!("Hello, {}! From Rust.", name)
}

@python
def analyze(text: str) -> dict:
    words = text.split()
    return {"words": len(words), "chars": len(text)}

fn main() -> Result<(), Error> {
    let msg = greet("OMNI")          // calls Rust fn
    println("{msg}")

    let stats = python::analyze(msg) // zero-copy call to Python
    println("Word count: {}", stats.words)

    return Ok(())
}`,
  },
  {
    title: "HTTP API with Go Gateway + Rust Auth",
    desc:  "Production-ready API using each language for its strength",
    lang:  "omni",
    code: `/// api_server.omni
module payment_api

@rust
use sha2::{Sha256, Digest};

@rust
fn verify_token(token: &[u8], secret: &[u8]) -> bool {
    let mut mac = Hmac::<Sha256>::new_from_slice(secret).unwrap();
    mac.update(token);
    mac.verify_slice(token).is_ok()
}

@go
import (
    "net/http"
    "encoding/json"
)

@go
func HandleCharge(w http.ResponseWriter, r *http.Request) {
    token := r.Header.Get("Authorization")
    if !omni_bridge.VerifyToken([]byte(token), secretKey) {
        http.Error(w, "Unauthorized", 401)
        return
    }
    // Process payment...
    json.NewEncoder(w).Encode(map[string]string{
        "status": "charged",
    })
}

@python
import sklearn.ensemble as ens

def detect_fraud(features: list[float]) -> float:
    model = ens.RandomForestClassifier()
    return float(model.predict_proba([features])[0][1])

fn main() -> Result<(), Error> {
    let server = go::http::ListenAndServe(":8080", go::HandleCharge)
    return server
}`,
  },
  {
    title: "ML Pipeline — Python Model + Rust Inference",
    desc:  "Train in Python, serve at Rust speed",
    lang:  "omni",
    code: `/// ml_pipeline.omni
module sentiment_engine

@python
import numpy as np
from transformers import pipeline

class SentimentModel:
    def __init__(self):
        self.pipe = pipeline("sentiment-analysis",
                             model="distilbert-base-uncased")

    def predict(self, texts: list[str]) -> list[dict]:
        return self.pipe(texts, batch_size=32)

    def batch_embeddings(self, texts: list[str]) -> np.ndarray:
        return np.array([self.embed(t) for t in texts])

@rust
use std::sync::Arc;

struct InferenceServer {
    model:  Arc<python::SentimentModel>,
    cache:  dashmap::DashMap<String, f32>,
}

impl InferenceServer {
    fn predict_cached(&self, text: &str) -> f32 {
        if let Some(score) = self.cache.get(text) {
            return *score;
        }
        let result = self.model.predict(vec![text.to_string()]);
        let score  = result[0]["score"].as_f64().unwrap() as f32;
        self.cache.insert(text.to_string(), score);
        score
    }
}

@go
func ServeHTTP(w http.ResponseWriter, r *http.Request) {
    text  := r.URL.Query().Get("text")
    score := omni_bridge.InferenceServer.PredictCached(text)
    fmt.Fprintf(w, \`{"score": %f}\`, score)
}`,
  },
  {
    title: "Full-Stack App — TypeScript UI + Go API",
    desc:  "Next.js frontend calling a Go backend, all in one .omni file",
    lang:  "omni",
    code: `/// fullstack.omni
module todo_app

@ts
import React, { useState, useEffect } from "react"

@ts
interface Todo { id: number; title: string; done: boolean }

@ts
export function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([])

    useEffect(() => {
        fetch("/api/todos")
            .then(r => r.json())
            .then(setTodos)
    }, [])

    return (
        <ul className="space-y-2">
            {todos.map(t => (
                <li key={t.id}
                    className={\`p-3 rounded \${t.done ? "opacity-50" : ""}\`}>
                    {t.title}
                </li>
            ))}
        </ul>
    )
}

@go
var todos = []map[string]any{
    {"id": 1, "title": "Learn OMNI", "done": false},
    {"id": 2, "title": "Ship it",    "done": false},
}

@go
func GetTodos(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(todos)
}

@go
func PostTodo(w http.ResponseWriter, r *http.Request) {
    var body map[string]string
    json.NewDecoder(r.Body).Decode(&body)
    todos = append(todos, map[string]any{
        "id":    len(todos) + 1,
        "title": body["title"],
        "done":  false,
    })
    w.WriteHeader(201)
}`,
  },
  {
    title: "Cryptography — C AES + Rust HMAC",
    desc:  "Hardware-accelerated encryption with memory-safe authentication",
    lang:  "omni",
    code: `/// crypto.omni
module secure_storage

@c
#include <openssl/aes.h>
#include <stdint.h>

void aes_encrypt_block(
    const uint8_t *key,
    const uint8_t *plaintext,
    uint8_t       *ciphertext
) {
    AES_KEY aes_key;
    AES_set_encrypt_key(key, 256, &aes_key);
    AES_encrypt(plaintext, ciphertext, &aes_key);
}

@rust
use hmac::{Hmac, Mac};
use sha2::Sha256;

pub fn hmac_sign(data: &[u8], key: &[u8]) -> Vec<u8> {
    let mut mac = Hmac::<Sha256>::new_from_slice(key)
        .expect("HMAC accepts any key size");
    mac.update(data);
    mac.finalize().into_bytes().to_vec()
}

pub fn seal(plaintext: &[u8], enc_key: &[u8], auth_key: &[u8]) -> Vec<u8> {
    let mut ciphertext = vec![0u8; plaintext.len()];
    c::aes_encrypt_block(enc_key, plaintext, &mut ciphertext);
    let tag = hmac_sign(&ciphertext, auth_key);
    [ciphertext, tag].concat()
}

fn main() -> Result<(), Error> {
    let enc_key  = [0x42u8; 32];
    let auth_key = [0x7au8; 32];
    let sealed   = seal(b"secret message", &enc_key, &auth_key);
    println!("Sealed {} bytes", sealed.len());
    Ok(())
}`,
  },
  {
    title: "WebSocket Chat — Go WS + Python NLP",
    desc:  "Real-time chat with automatic toxicity filtering",
    lang:  "omni",
    code: `/// chat_server.omni
module realtime_chat

@python
from detoxify import Detoxify

toxicity_model = Detoxify("original")

def is_toxic(text: str) -> bool:
    scores = toxicity_model.predict(text)
    return scores["toxicity"] > 0.7

def moderate(text: str) -> str:
    if is_toxic(text):
        return "[Message removed by moderation]"
    return text

@go
import (
    "github.com/gorilla/websocket"
    "net/http"
    "sync"
)

var (
    clients   = make(map[*websocket.Conn]bool)
    broadcast = make(chan string, 256)
    mu        sync.Mutex
    upgrader  = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
)

@go
func HandleWS(w http.ResponseWriter, r *http.Request) {
    conn, _ := upgrader.Upgrade(w, r, nil)
    mu.Lock(); clients[conn] = true; mu.Unlock()

    for {
        _, msg, err := conn.ReadMessage()
        if err != nil { break }

        clean := omni_bridge.Moderate(string(msg))
        broadcast <- clean
    }

    mu.Lock(); delete(clients, conn); mu.Unlock()
}

@go
func Broadcaster() {
    for msg := range broadcast {
        mu.Lock()
        for c := range clients {
            c.WriteMessage(websocket.TextMessage, []byte(msg))
        }
        mu.Unlock()
    }
}`,
  },
]

const PRINCIPLES = [
  { n: "01", title: "Best tool for the job",   body: "Not every problem is a nail for the JavaScript hammer. Use Rust for safety, Python for ML, Go for concurrency — within a single codebase." },
  { n: "02", title: "Zero overhead interop",   body: "DomainBridge passes raw pointers across language boundaries. No JSON, no gRPC, no serialization cost — nanosecond-level call latency." },
  { n: "03", title: "Safety by design",        body: "Domain segregation at compile time prevents accidental coupling. Rust ownership rules enforce memory safety even across language borders." },
  { n: "04", title: "One toolchain",           body: "Build, test, benchmark, profile, lint, and deploy with a single CLI. No Makefile, no shell scripts, no Dockerfile required." },
  { n: "05", title: "Gradual adoption",        body: "Wrap existing Rust crates, Go packages, or Python wheels with @-annotations. Migrate incrementally — ship a .omni file alongside your existing code." },
  { n: "06", title: "Observable by default",  body: "Every domain boundary is a tracing point. Flamegraphs, latency histograms, and memory profiles work across all 15 language domains." },
]

const TABLE_DATA = [
  ["Language fragmentation",     "15 languages in 1 runtime, 1 executable",              "#ef4444", "#00ff88"],
  ["Microservice spaghetti",     "Performant monolith with compile-time domain isolation","#ef4444", "#00ff88"],
  ["Serialization overhead",     "Zero-copy DomainBridge — raw pointer passing",          "#ef4444", "#00ff88"],
  ["Dependency hell",            "OMNI-NEXUS: one registry for all languages",            "#ef4444", "#00ff88"],
  ["Build toolchain chaos",      "`omni build` — one command, zero config",               "#ef4444", "#00ff88"],
  ["Cloud cold starts",          "Unikernel 3–8 MB, cold start < 10 ms on 43 edges",     "#ef4444", "#00ff88"],
  ["Cross-team language wars",   "Each team uses their best language, ships together",    "#ef4444", "#00ff88"],
  ["Performance profiling hell", "Unified flamegraph across all 15 language domains",     "#ef4444", "#00ff88"],
]

const METRICS = [
  { label: "Languages", value: "15",     color: "#00d4ff", sub: "Fully integrated"   },
  { label: "Cold Start",value: "< 10ms", color: "#00ff88", sub: "Unikernel deploy"   },
  { label: "SIMD Gain", value: "4.1x",   color: "#a855f7", sub: "Auto-vectorization" },
  { label: "Packages",  value: "540+",   color: "#f59e0b", sub: "OMNI-NEXUS registry" },
  { label: "Regions",   value: "43",     color: "#00d4ff", sub: "Edge PoPs"          },
  { label: "Uptime",    value: "99.99%", color: "#00ff88", sub: "SLA guarantee"      },
]

const QUICK_LINKS = [
  { href: "/docs/quick-start",      label: "Quick Start",          desc: "Build your first .omni app in 5 minutes",                color: "#00d4ff" },
  { href: "/docs/architecture",     label: "5-Layer Architecture", desc: "Deep dive into Source → UAST → LLVM → Runtime → Deploy", color: "#a855f7" },
  { href: "/docs/compiler",         label: "LLVM-Omni Compiler",   desc: "Optimization passes, vectorization, and LTO",            color: "#00ff88" },
  { href: "/docs/language-guide",   label: "OMNI Syntax",          desc: "Module system, types, closures, pattern matching",       color: "#f59e0b" },
  { href: "/docs/rust-bridge",      label: "Rust Bridge",          desc: "Zero-copy memory, ownership across bridges",             color: "#e05d44" },
  { href: "/docs/python-bridge",    label: "Python Bridge",        desc: "NumPy arrays, PyTorch tensors, scikit-learn",            color: "#ffd43b" },
  { href: "/docs/go-bridge",        label: "Go Bridge",            desc: "Goroutines, channels, HTTP/3 gateway",                   color: "#00aed8" },
  { href: "/docs/unikernel",        label: "Unikernel Deploy",     desc: "3–8 MB boot images, < 10ms cold start",                 color: "#00d4ff" },
  { href: "/playground",            label: "Live Playground",      desc: "Write and run OMNI code directly in your browser",       color: "#00ff88" },
  { href: "/docs/nexus",            label: "OMNI-NEXUS Registry",  desc: "540+ packages across all 15 language domains",           color: "#a855f7" },
]

/* ─────────────────────────────────────────────────────────────
   CODE BLOCK COMPONENT
───────────────────────────────────────────────────────────── */
function CodeBlock({ code, title, desc }: { code: string; title: string; desc: string }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl border border-white/[0.07] overflow-hidden bg-[#0d1117] mb-6"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#080b12]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} aria-hidden="true" />
            ))}
          </div>
          <div>
            <span className="text-xs font-bold text-[#e2e8f0]">{title}</span>
            <span className="text-[10px] text-[#475569] ml-2">{desc}</span>
          </div>
        </div>
        <motion.button
          onClick={copy}
          className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#475569] hover:text-[#94a3b8] hover:border-white/[0.14] transition-all flex items-center gap-1.5"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          aria-label="Copy code"
        >
          {copied ? (
            <><svg className="w-3 h-3" fill="none" stroke="#00ff88" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg><span style={{ color: "#00ff88" }}>Copied!</span></>
          ) : (
            <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>Copy</>
          )}
        </motion.button>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto p-5 text-[12px] leading-[1.7] font-mono text-[#94a3b8]">
        <code>{code}</code>
      </pre>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LANGUAGE MATRIX ROW
───────────────────────────────────────────────────────────── */
function LangRow({ lang, i }: { lang: typeof LANGUAGE_MATRIX[0]; i: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20px 0px" })

  return (
    <motion.div
      ref={ref}
      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] group"
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: (i % 5) * 0.05 }}
      whileHover={{ borderColor: `${lang.color}30`, backgroundColor: `${lang.color}06`, y: -2 }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono text-[10px] font-bold"
        style={{ background: lang.bg, color: lang.color, border: `1px solid ${lang.color}30` }}>
        {lang.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-[#e2e8f0]">{lang.lang}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest"
            style={{ background: `${lang.color}15`, color: lang.color, border: `1px solid ${lang.color}30` }}>
            {lang.domain}
          </span>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">{lang.use}</p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ARCHITECTURE LAYER
───────────────────────────────────────────────────────────── */
function ArchLayer({ layer, i }: { layer: typeof ARCHITECTURE_LAYERS[0]; i: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20px 0px" })
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      ref={ref}
      className="relative flex gap-5 cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.08 }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Spine */}
      <div className="flex flex-col items-center">
        <motion.div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 z-10"
          style={{ background: `${layer.color}18`, border: `2px solid ${layer.color}50`, color: layer.color }}
          whileHover={{ scale: 1.1, boxShadow: `0 0 16px ${layer.color}50` }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {i + 1}
        </motion.div>
        {i < ARCHITECTURE_LAYERS.length - 1 && (
          <div className="flex-1 w-px mt-1" style={{ background: `${layer.color}20` }} aria-hidden="true" />
        )}
      </div>
      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <h4 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: layer.color }}>
          {layer.layer}
          <motion.svg
            className="w-3.5 h-3.5 opacity-50"
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </motion.svg>
        </h4>
        <p className="text-sm text-[#64748b] leading-relaxed">{layer.desc}</p>
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="mt-2 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <p className="text-xs text-[#475569] leading-relaxed">{layer.detail}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   QUICK LINK CARD
───────────────────────────────────────────────────────────── */
function QuickCard({ q, i }: { q: typeof QUICK_LINKS[0]; i: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20px 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: (i % 3) * 0.07 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={q.href}
        className="block p-5 rounded-xl border border-white/[0.07] bg-[#0d1117] relative overflow-hidden group h-full transition-all"
        style={{}}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{ background: `radial-gradient(circle at 0% 0%, ${q.color}0a, transparent 60%)` }}
          initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${q.color}60, transparent)` }}
          initial={{ opacity: 0, scaleX: 0 }}
          whileHover={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4 }}
          aria-hidden="true"
        />
        <span className="text-xs font-mono font-bold mb-1.5 block" style={{ color: q.color }}>
          {q.label} →
        </span>
        <p className="text-xs text-[#475569] leading-relaxed relative z-10">{q.desc}</p>
      </Link>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   EXAMPLE TABS
───────────────────────────────────────────────────────────── */
function CodeExamples() {
  const [active, setActive] = useState(0)
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })

  return (
    <motion.div
      ref={ref}
      className="not-prose"
      initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
    >
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CODE_EXAMPLES.map((ex, i) => (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              active === i ? "text-[#e2e8f0]" : "text-[#475569] hover:text-[#94a3b8]"
            }`}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {active === i && (
              <motion.div
                layoutId="code-tab-bg"
                className="absolute inset-0 bg-[#00d4ff]/10 border border-[#00d4ff]/25 rounded-lg"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{ex.title.split("—")[0].trim()}</span>
          </motion.button>
        ))}
      </div>

      {/* Code panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          <CodeBlock
            title={CODE_EXAMPLES[active].title}
            desc={CODE_EXAMPLES[active].desc}
            code={CODE_EXAMPLES[active].code}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function DocsIntroPage() {
  const heroRef    = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })
  const { scrollYProgress } = useScroll()
  const badgeOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0.5])

  return (
    <div className="omni-prose">

      {/* ── HERO ── */}
      <motion.div ref={heroRef} className="mb-12" initial="hidden" animate={heroInView ? "visible" : "hidden"} variants={container as any}>
        <motion.div variants={fadeUp as any} style={{ opacity: badgeOpacity }}
          className="inline-flex items-center gap-2 text-xs text-[#00d4ff] font-mono bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-3 py-1 mb-5">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
            animate={{ scale: [1,1.5,1], opacity: [1,0.4,1] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden="true" />
          Documentation — Introduction
        </motion.div>

        <motion.h1 variants={fadeUp as any} className="text-3xl md:text-4xl lg:text-5xl font-black text-[#e2e8f0] mb-5 leading-tight text-balance">
          What is{" "}
          <motion.span className="gradient-text"
            animate={{ backgroundPosition: ["0% 50%","100% 50%","0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}>
            OMNI Framework?
          </motion.span>
        </motion.h1>

        <motion.p variants={fadeUp as any} className="text-[#64748b] leading-relaxed text-lg max-w-3xl">
          OMNI is the world&apos;s first polylingual runtime — unifying{" "}
          <strong className="text-[#e2e8f0]">15 programming languages</strong> into a single binary powered by{" "}
          <span className="text-[#00d4ff] font-semibold">LLVM-Omni</span>.
          Write Rust for performance, Python for ML, Go for networking, and TypeScript for UI — all in one{" "}
          <code className="text-[#a855f7] bg-[#a855f7]/10 px-1.5 py-0.5 rounded text-sm">.omni</code> file.
        </motion.p>

        {/* Metrics strip */}
        <motion.div variants={fadeUp as any} className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-8 not-prose">
          {METRICS.map((m, i) => (
            <motion.div key={m.label}
              className="flex flex-col items-center p-4 rounded-xl border border-white/[0.07] bg-[#0d1117] text-center"
              initial={{ opacity: 0, y: 16 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 300, damping: 22 }}
              whileHover={{ y: -3, borderColor: `${m.color}30`, boxShadow: `0 8px 24px ${m.color}10` }}
            >
              <span className="text-xl font-black tabular-nums leading-none mb-1" style={{ color: m.color }}>{m.value}</span>
              <span className="text-[9px] font-bold text-[#e2e8f0] uppercase tracking-widest leading-none">{m.label}</span>
              <span className="text-[8px] text-[#334155] mt-0.5">{m.sub}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── THE PROBLEM ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        The Problem OMNI Solves
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
        Modern software development is held back by fragmentation. Teams fight language wars, microservice architectures create
        cascading failures, and every language ecosystem demands its own toolchain, package manager, and runtime. The cost is real:
      </motion.p>
      <motion.ul variants={container as any} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px 0px" }}>
        {[
          "Rust for the backend, Python for ML, TypeScript for UI — three runtimes, three build systems, three deployment pipelines",
          "gRPC, Protobuf, and JSON serialization waste CPU cycles crossing language boundaries",
          "npm, pip, cargo, go mod — each ecosystem is an island with no bridge to the others",
          "Microservice spaghetti: 47 services, 47 CI/CD pipelines, 47 points of failure",
          "Cold-start latency: 2–4 seconds for Node.js containers; milliseconds lost forever",
        ].map(t => <motion.li key={t} variants={fadeUp as any}>{t}</motion.li>)}
      </motion.ul>

      {/* ── SOLUTION TABLE ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        The OMNI Solution
      </motion.h2>
      <motion.div
        className="rounded-2xl border border-white/[0.07] overflow-hidden mb-8 not-prose"
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px 0px" }} transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <table className="w-full">
          <thead>
            <tr className="bg-[#0d1117] border-b border-white/[0.07]">
              <th className="text-left px-5 py-3 text-xs font-bold text-[#475569] uppercase tracking-widest">Problem</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-[#475569] uppercase tracking-widest">OMNI Solution</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_DATA.map(([prob, sol, pc, sc], i) => (
              <motion.tr key={prob}
                className="border-b border-white/[0.04] last:border-0"
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-16px 0px" }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.04 }}
                whileHover={{ backgroundColor: "rgba(0,212,255,0.03)" }}
              >
                <td className="px-5 py-3.5 text-sm" style={{ color: pc }}>{prob}</td>
                <td className="px-5 py-3.5 text-sm text-[#94a3b8]">{sol}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ── LANGUAGE MATRIX ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        The 15 Language Matrix
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
        OMNI integrates 15 languages through a shared compiler pipeline. Each language handles what it does best — and they call
        each other with zero serialization overhead through the DomainBridge.
      </motion.p>

      <div className="not-prose grid grid-cols-1 lg:grid-cols-2 gap-2.5 mb-8">
        {LANGUAGE_MATRIX.map((lang, i) => <LangRow key={lang.lang} lang={lang} i={i} />)}
      </div>

      {/* ── CODE EXAMPLES ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        Code Examples
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
        Six complete, production-quality OMNI programs spanning web APIs, ML inference, real-time chat, cryptography, and
        full-stack applications. Each example uses the best language for each domain.
      </motion.p>

      <CodeExamples />

      {/* ── 5-LAYER ARCHITECTURE ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        5-Layer Architecture
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
        OMNI&apos;s compiler pipeline has five distinct stages. Click any layer to expand its implementation details.
      </motion.p>

      <div className="not-prose mt-6 mb-8">
        {ARCHITECTURE_LAYERS.map((layer, i) => <ArchLayer key={layer.layer} layer={layer} i={i} />)}
      </div>

      {/* ── CORE PHILOSOPHY ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        Core Philosophy
      </motion.h2>

      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {PRINCIPLES.map((p, i) => {
          const ref    = useRef<HTMLDivElement>(null)
          const inView = useInView(ref, { once: true, margin: "-20px 0px" })
          return (
            <motion.div key={p.n} ref={ref}
              className="flex gap-4 p-5 rounded-xl border border-white/[0.07] bg-[#0d1117] relative overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 280, damping: 22, delay: (i % 2) * 0.08 }}
              whileHover={{ y: -3, borderColor: "rgba(0,212,255,0.2)", boxShadow: "0 8px 28px rgba(0,212,255,0.07)" }}
            >
              <span className="text-[#00d4ff]/35 font-mono text-xs font-black mt-0.5 shrink-0">{p.n}</span>
              <div>
                <strong className="text-[#e2e8f0] text-sm block mb-1">{p.title}</strong>
                <p className="text-[#64748b] text-xs leading-relaxed">{p.body}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── QUICK LINKS ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        Explore the Documentation
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
        Jump to any section — from the 5-minute quick start to advanced topics like the Quantum Bridge, Immortality Mesh, and
        formal verification.
      </motion.p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {QUICK_LINKS.map((q, i) => <QuickCard key={q.href} q={q} i={i} />)}
      </div>

      {/* ── STUDY PATH ── */}
      <motion.h2 initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        Recommended Learning Path
      </motion.h2>

      <div className="not-prose space-y-2 mb-10">
        {[
          { step: "01", title: "Introduction",         href: "/docs",                time: "5 min",  badge: "You are here" },
          { step: "02", title: "Quick Start",          href: "/docs/quick-start",    time: "10 min", badge: "Start here" },
          { step: "03", title: "Installation",         href: "/docs/installation",   time: "5 min",  badge: null },
          { step: "04", title: "5-Layer Architecture", href: "/docs/architecture",   time: "20 min", badge: "Core concept" },
          { step: "05", title: "OMNI Syntax Guide",    href: "/docs/language-guide", time: "30 min", badge: null },
          { step: "06", title: "Rust + Go Bridges",    href: "/docs/rust-bridge",    time: "20 min", badge: "Most used" },
          { step: "07", title: "Python ML Bridge",     href: "/docs/python-bridge",  time: "15 min", badge: null },
          { step: "08", title: "NEXUS Package Manager",href: "/docs/nexus",          time: "10 min", badge: null },
          { step: "09", title: "Deploy to Edge",       href: "/docs/edge-deploy",    time: "15 min", badge: "Ship it" },
          { step: "10", title: "Live Playground",      href: "/playground",          time: "—",      badge: "Try it now" },
        ].map((s, i) => {
          const ref    = useRef<HTMLDivElement>(null)
          const inView = useInView(ref, { once: true, margin: "-10px 0px" })
          return (
            <motion.div key={s.step} ref={ref}
              initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: (i % 5) * 0.05 }}
            >
              <Link href={s.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group">
                <span className="text-[10px] font-mono text-[#334155] w-5 shrink-0">{s.step}</span>
                <span className="text-sm font-semibold text-[#94a3b8] group-hover:text-[#e2e8f0] transition-colors flex-1">{s.title}</span>
                {s.badge && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#00d4ff]/30 text-[#00d4ff] bg-[#00d4ff]/08 shrink-0 uppercase tracking-widest">
                    {s.badge}
                  </span>
                )}
                <span className="text-[10px] text-[#2d3748] font-mono shrink-0">{s.time}</span>
                <svg className="w-3.5 h-3.5 text-[#2d3748] group-hover:text-[#64748b] transition-colors shrink-0"
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* ── CTA ── */}
      <motion.div className="not-prose mt-10 flex items-center gap-4 flex-wrap"
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }} transition={{ type: "spring", stiffness: 280, damping: 24 }}>
        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          <Link href="/docs/quick-start"
            className="relative inline-flex items-center gap-2 bg-[#00d4ff] text-[#080b12] font-black px-6 py-3 rounded-xl text-sm overflow-hidden">
            <motion.div className="absolute inset-0 -translate-x-full"
              style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)" }}
              whileHover={{ translateX: "100%" }} transition={{ duration: 0.45 }} aria-hidden="true" />
            <span className="relative z-10">Start Quick Start</span>
            <motion.svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </motion.svg>
          </Link>
        </motion.div>
        <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          <Link href="/playground" className="text-[#00d4ff] text-sm font-semibold hover:underline underline-offset-4">
            Try Playground →
          </Link>
        </motion.div>
        <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          <Link href="/study" className="text-[#a855f7] text-sm font-semibold hover:underline underline-offset-4">
            Study Hub →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
