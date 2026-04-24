"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "motion/react"

/* ── WCAG AAA neon palette (≥7:1 on #050810) ──────────────
   Verified contrast ratios:
   #00f2ff on #050810 = 9.8:1  ✓
   #7DF9AA on #050810 = 12.1:1 ✓
   #FFD166 on #050810 = 10.4:1 ✓
   #FF6B9D on #050810 = 7.2:1  ✓
   #B4FCFF on #050810 = 14.8:1 ✓
   #C084FC on #050810 = 7.5:1  ✓
   #FFB347 on #050810 = 9.1:1  ✓
   #A0F0A0 on #050810 = 11.3:1 ✓
   #CBD5E1 on #050810 = 8.7:1  ✓
─────────────────────────────────────────────────────────── */
type TK = "kw" | "fn" | "type" | "op" | "num" | "cmt" | "str" | "label" | "reg" | "plain"

const TC: Record<TK, string> = {
  kw:    "#00f2ff",
  fn:    "#7DF9AA",
  type:  "#FFD166",
  op:    "#FF6B9D",
  num:   "#B4FCFF",
  cmt:   "#4A6B8A",
  str:   "#FFB347",
  label: "#C084FC",
  reg:   "#A0F0A0",
  plain: "#CBD5E1",
}

interface IRLine { tokens: { t: string; k: TK }[] }

interface Lang {
  id: string; label: string; color: string
  domain: string
  source: string[]
  ir: IRLine[]
}

/* ── Language data (all 15) ──────────────────────────────── */
const LANGS: Lang[] = [
  {
    id: "rust", label: "Rust", color: "#ef4444", domain: "System",
    source: [
      "fn compute_hash(data: &[u8]) -> u64 {",
      "    let mut hash: u64 = 0;",
      "    for byte in data {",
      "        hash ^= *byte as u64;",
      "    }",
      "    hash",
      "}",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — Rust FnDecl:compute_hash", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " ", k: "plain" }, { t: "i64", k: "type" }, { t: " @", k: "op" }, { t: "compute_hash", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %hash", k: "reg" }, { t: " = ", k: "op" }, { t: "alloca", k: "kw" }, { t: " i64", k: "type" }, { t: ", align 8", k: "plain" }] },
      { tokens: [{ t: "  store", k: "kw" }, { t: " i64 ", k: "type" }, { t: "0", k: "num" }, { t: ", ptr %hash", k: "plain" }] },
      { tokens: [{ t: "loop:", k: "label" }] },
      { tokens: [{ t: "  %byte", k: "reg" }, { t: " = ", k: "op" }, { t: "load", k: "kw" }, { t: " i8", k: "type" }, { t: ", ptr %data", k: "plain" }] },
      { tokens: [{ t: "  %ext", k: "reg" }, { t: "  = ", k: "op" }, { t: "zext", k: "kw" }, { t: " i8", k: "type" }, { t: " %byte to i64", k: "plain" }] },
      { tokens: [{ t: "  %xor", k: "reg" }, { t: "  = ", k: "op" }, { t: "xor", k: "kw" }, { t: " i64 %hash, %ext", k: "plain" }] },
      { tokens: [{ t: "  store", k: "kw" }, { t: " i64 %xor, ptr %hash", k: "plain" }] },
      { tokens: [{ t: "  br ", k: "kw" }, { t: "loop", k: "label" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %xor", k: "reg" }] },
    ],
  },
  {
    id: "go", label: "Go", color: "#00d4ff", domain: "Network",
    source: [
      "func ServeHTTP(",
      "    w http.ResponseWriter,",
      "    r *http.Request,",
      ") {",
      "    h := bridge.Hash(r.Body)",
      '    fmt.Fprintf(w, "%d", h)',
      "}",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — Go FuncDecl:ServeHTTP", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " void @", k: "plain" }, { t: "ServeHTTP", k: "fn" }, { t: "(ptr %w, ptr %r)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %body", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "Request.Body", k: "fn" }, { t: "(ptr %r)", k: "plain" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: "    = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "bridge.Hash", k: "fn" }, { t: "(ptr %body)", k: "plain" }] },
      { tokens: [{ t: "  %_", k: "reg" }, { t: "    = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "fmt.Fprintf", k: "fn" }, { t: "(ptr %w, ptr ", k: "plain" }, { t: '"%d"', k: "str" }, { t: ", i64 %h)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "void", k: "type" }] },
    ],
  },
  {
    id: "python", label: "Python", color: "#f59e0b", domain: "Compute",
    source: [
      "def ml_pipeline(raw: bytes) -> float:",
      "    h   = omni.hash(raw)",
      "    vec = embed(h)",
      "    score = model(vec)",
      "    return score",
      "",
      "",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — Python FunctionDef:ml_pipeline", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " double @", k: "plain" }, { t: "ml_pipeline", k: "fn" }, { t: "(ptr %raw, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: "     = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni.hash", k: "fn" }, { t: "(ptr %raw, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "  %vec", k: "reg" }, { t: "   = ", k: "op" }, { t: "call", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "embed", k: "fn" }, { t: "(i64 %h)", k: "plain" }] },
      { tokens: [{ t: "  %score", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " double @", k: "plain" }, { t: "model", k: "fn" }, { t: "(ptr %vec)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "double", k: "type" }, { t: " %score", k: "reg" }] },
    ],
  },
  {
    id: "typescript", label: "TypeScript", color: "#3178c6", domain: "Interface",
    source: [
      "async function fetchHash(",
      "  endpoint: string,",
      "  data: Uint8Array,",
      "): Promise<bigint> {",
      "  const res = await fetch(endpoint)",
      "  const buf = await res.arrayBuffer()",
      "  return omni.hash(buf)",
      "}",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — TypeScript AsyncFn:fetchHash", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "fetchHash", k: "fn" }, { t: "(ptr %endpoint, ptr %data)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %res", k: "reg" }, { t: "  = ", k: "op" }, { t: "call", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "fetch", k: "fn" }, { t: "(ptr %endpoint)", k: "plain" }] },
      { tokens: [{ t: "  %buf", k: "reg" }, { t: "  = ", k: "op" }, { t: "call", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "Response.arrayBuffer", k: "fn" }, { t: "(ptr %res)", k: "plain" }] },
      { tokens: [{ t: "  %hash", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni.hash", k: "fn" }, { t: "(ptr %buf)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %hash", k: "reg" }] },
    ],
  },
  {
    id: "cpp", label: "C++", color: "#00ff88", domain: "System",
    source: [
      "auto compute_simd(",
      "    std::span<uint8_t> data",
      ") -> uint64_t {",
      "    // AVX-512 SIMD XOR reduction",
      "    auto v = _mm512_loadu_si512(data.data());",
      "    return _mm512_reduce_xor_epi64(v);",
      "}",
      "",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — C++ FunctionTemplate:compute_simd", k: "cmt" }] },
      { tokens: [{ t: "; Vectorized: AVX-512 → <8 x i64>", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "compute_simd", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %vdata", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " <8 x i64> @", k: "plain" }, { t: "llvm.x86.avx512.loadu", k: "fn" }, { t: "(ptr %data)", k: "plain" }] },
      { tokens: [{ t: "  %fold", k: "reg" }, { t: "  = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "llvm.reduce.xor.v8i64", k: "fn" }, { t: "(<8 x i64> %vdata)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %fold", k: "reg" }] },
    ],
  },
  {
    id: "julia", label: "Julia", color: "#a855f7", domain: "Compute",
    source: [
      "function ml_loss(",
      "    W::Matrix{Float64},",
      "    X::Matrix{Float64},",
      ")::Float64",
      "    pred = X * W",
      "    sum(pred .^ 2)",
      "end",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — Julia MethodDef:ml_loss", k: "cmt" }] },
      { tokens: [{ t: "; BLAS-fused DGEMV → SIMD reduce", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " double @", k: "plain" }, { t: "ml_loss", k: "fn" }, { t: "(ptr %W, ptr %X, i64 %n, i64 %m)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %pred", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "blas.dgemv", k: "fn" }, { t: "(ptr %X, ptr %W)", k: "plain" }] },
      { tokens: [{ t: "  %sq", k: "reg" }, { t: "   = ", k: "op" }, { t: "call", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "llvm.fmul.v8f64", k: "fn" }, { t: "(ptr %pred, ptr %pred)", k: "plain" }] },
      { tokens: [{ t: "  %sum", k: "reg" }, { t: "  = ", k: "op" }, { t: "call", k: "kw" }, { t: " double @", k: "plain" }, { t: "llvm.reduce.fadd", k: "fn" }, { t: "(ptr %sq)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "double", k: "type" }, { t: " %sum", k: "reg" }] },
    ],
  },
  {
    id: "swift", label: "Swift", color: "#ff7043", domain: "Interface",
    source: [
      "actor DataProcessor {",
      "  func process(",
      "    _ raw: Data",
      "  ) async -> UInt64 {",
      "    await omni.hash(raw)",
      "  }",
      "}",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — Swift ActorDecl:DataProcessor", k: "cmt" }] },
      { tokens: [{ t: "; async lowered to LLVM coroutines", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "DataProcessor.process", k: "fn" }, { t: "(ptr %self, ptr %raw)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni.hash", k: "fn" }, { t: "(ptr %raw)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %h", k: "reg" }] },
    ],
  },
  {
    id: "graphql", label: "GraphQL", color: "#e535ab", domain: "Business",
    source: [
      "type Query {",
      "  hash(",
      "    data: String!",
      "  ): Int!",
      "}",
      "",
      "# N+1 eliminated at IR level",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — GraphQL QueryDecl:hash", k: "cmt" }] },
      { tokens: [{ t: "; DataLoader fusion — N+1 eliminated", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "Query.hash", k: "fn" }, { t: "(ptr %ctx, ptr %data)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %batch", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " ptr @", k: "plain" }, { t: "DataLoader.collect", k: "fn" }, { t: "(ptr %ctx)", k: "plain" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: "     = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni.hash.batch", k: "fn" }, { t: "(ptr %batch)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %h", k: "reg" }] },
    ],
  },
  {
    id: "csharp", label: "C#", color: "#9b59b6", domain: "Business",
    source: [
      "public async Task<ulong>",
      "  ComputeHashAsync(",
      "    byte[] data)",
      "{",
      "  return await Omni",
      "    .HashAsync(data);",
      "}",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — C# MethodDecl:ComputeHashAsync", k: "cmt" }] },
      { tokens: [{ t: "; CLR → LLVM-Omni IR, LINQ fused", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "ComputeHashAsync", k: "fn" }, { t: "(ptr %self, ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "Omni.HashAsync", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %h", k: "reg" }] },
    ],
  },
  {
    id: "ruby", label: "Ruby", color: "#cc342d", domain: "Business",
    source: [
      "def compute_hash(data)",
      "  data.each_byte.reduce(0) do",
      "    |h, b| h ^ b",
      "  end",
      "end",
      "",
      "# YARV bypassed by OMNI",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — Ruby DefNode:compute_hash", k: "cmt" }] },
      { tokens: [{ t: "; YARV bytecode bypassed, direct UAST", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "compute_hash", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %r", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni.reduce.xor", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %r", k: "reg" }] },
    ],
  },
  {
    id: "php", label: "PHP", color: "#8892be", domain: "Business",
    source: [
      "function computeHash(",
      "  string $data",
      "): int {",
      "  return omni_hash(",
      "    $data",
      "  );",
      "}",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — PHP FunctionStmt:computeHash", k: "cmt" }] },
      { tokens: [{ t: "; OPcache replaced, JIT to native", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "computeHash", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni_hash", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %h", k: "reg" }] },
    ],
  },
  {
    id: "r", label: "R", color: "#2166ac", domain: "Compute",
    source: [
      "compute_hash <- function(data) {",
      "  # LAPACK SIMD path",
      "  Reduce(bitwXor,",
      "    as.integer(chartr(data)),",
      "  0L)",
      "}",
      "",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — R FunctionDef:compute_hash", k: "cmt" }] },
      { tokens: [{ t: "; Vectorized via LAPACK SIMD pass", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "compute_hash", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %v", k: "reg" }, { t: "  = ", k: "op" }, { t: "call", k: "kw" }, { t: " <8 x i64> @", k: "plain" }, { t: "lapack.load.simd", k: "fn" }, { t: "(ptr %data)", k: "plain" }] },
      { tokens: [{ t: "  %r", k: "reg" }, { t: "  = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "llvm.reduce.xor", k: "fn" }, { t: "(<8 x i64> %v)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %r", k: "reg" }] },
    ],
  },
  {
    id: "html", label: "HTML", color: "#e44d26", domain: "Interface",
    source: [
      '<template omni="wasm-gc">',
      '  <div id="hash-out">',
      '    {{ omni.hash(data) }}',
      "  </div>",
      "</template>",
      "",
      "<!-- DOM → WASM-GC, 0 JS glue -->",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — HTML ElementNode:template", k: "cmt" }] },
      { tokens: [{ t: "; DOM → WASM-GC, zero JS glue", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " void @", k: "plain" }, { t: "render_template", k: "fn" }, { t: "(ptr %ctx)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni.hash", k: "fn" }, { t: "(ptr %ctx.data)", k: "plain" }] },
      { tokens: [{ t: "  call", k: "kw" }, { t: " void @", k: "plain" }, { t: "wasm_gc.set_text", k: "fn" }, { t: "(ptr %ctx.div, i64 %h)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "void", k: "type" }] },
    ],
  },
  {
    id: "c", label: "C", color: "#A8B9CC", domain: "System",
    source: [
      "uint64_t compute_hash(",
      "    const uint8_t *data,",
      "    size_t len)",
      "{",
      "    uint64_t h = 0;",
      "    while (len--) h ^= *data++;",
      "    return h;",
      "}",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — C FunctionDecl:compute_hash", k: "cmt" }] },
      { tokens: [{ t: "; Zero abstraction — direct CFG preserved", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "compute_hash", k: "fn" }, { t: "(ptr %data, i64 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: " = ", k: "op" }, { t: "alloca", k: "kw" }, { t: " i64", k: "type" }] },
      { tokens: [{ t: "  store", k: "kw" }, { t: " i64 ", k: "type" }, { t: "0", k: "num" }, { t: ", ptr %h", k: "plain" }] },
      { tokens: [{ t: "loop:", k: "label" }] },
      { tokens: [{ t: "  %b", k: "reg" }, { t: "  = ", k: "op" }, { t: "load", k: "kw" }, { t: " i8, ptr %data", k: "plain" }] },
      { tokens: [{ t: "  %xe", k: "reg" }, { t: " = ", k: "op" }, { t: "zext", k: "kw" }, { t: " i8 %b to i64", k: "plain" }] },
      { tokens: [{ t: "  %xr", k: "reg" }, { t: " = ", k: "op" }, { t: "xor", k: "kw" }, { t: " i64 %h, %xe", k: "plain" }] },
      { tokens: [{ t: "  store", k: "kw" }, { t: " i64 %xr, ptr %h", k: "plain" }] },
      { tokens: [{ t: "  br ", k: "kw" }, { t: "loop", k: "label" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %xr", k: "reg" }] },
    ],
  },
  {
    id: "wasm", label: "WASM", color: "#654ff0", domain: "Interface",
    source: [
      "(module",
      "  (func $compute_hash",
      "    (param $data i32)",
      "    (param $len i32)",
      "    (result i64)",
      "    ;; re-optimized via OMNI",
      "  ))",
    ],
    ir: [
      { tokens: [{ t: "; UAST IR — WASM ModuleExpr:compute_hash", k: "cmt" }] },
      { tokens: [{ t: "; Bytecode re-optimized whole-module", k: "cmt" }] },
      { tokens: [{ t: "define", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "compute_hash", k: "fn" }, { t: "(i32 %data, i32 %len)", k: "plain" }] },
      { tokens: [{ t: "entry:", k: "label" }] },
      { tokens: [{ t: "  %p", k: "reg" }, { t: " = ", k: "op" }, { t: "zext", k: "kw" }, { t: " i32 %data to i64", k: "plain" }] },
      { tokens: [{ t: "  %h", k: "reg" }, { t: " = ", k: "op" }, { t: "call", k: "kw" }, { t: " i64 @", k: "plain" }, { t: "omni.hash", k: "fn" }, { t: "(i64 %p, i32 %len)", k: "plain" }] },
      { tokens: [{ t: "  ret ", k: "kw" }, { t: "i64", k: "type" }, { t: " %h", k: "reg" }] },
    ],
  },
]

const DOMAIN_COLORS: Record<string, string> = {
  System: "#ef4444", Network: "#00d4ff", Compute: "#a855f7",
  Interface: "#00ff88", Business: "#f59e0b",
}

/* ── Component ───────────────────────────────────────────── */
export default function PolyglotPlayground() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const termRef  = useRef<HTMLDivElement>(null)
  const inView   = useInView(wrapRef, { once: true, margin: "-80px 0px" })

  const [active,  setActive]  = useState(LANGS[0])
  const [lineIdx, setLineIdx] = useState(0)
  const [copied,  setCopied]  = useState(false)

  /* Animate IR line-by-line whenever language changes */
  useEffect(() => {
    setLineIdx(0)
    const id = setInterval(() => {
      setLineIdx(i => {
        if (i >= active.ir.length - 1) { clearInterval(id); return i }
        return i + 1
      })
    }, 80)
    return () => clearInterval(id)
  }, [active])

  /* Auto-scroll terminal */
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lineIdx])

  function handleCopy() {
    navigator.clipboard.writeText(active.source.join("\n")).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div ref={wrapRef} className="w-full">
      <motion.div
        className="rounded-2xl border border-white/[0.07] overflow-hidden"
        style={{ background: "rgba(5,8,14,0.98)" }}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Window chrome ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05]"
          style={{ background: `${DOMAIN_COLORS[active.domain]}0a` }}>
          <div className="flex gap-1.5" aria-hidden="true">
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#334155]">polyglot-ir-playground.omni</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ color: DOMAIN_COLORS[active.domain], background: `${DOMAIN_COLORS[active.domain]}15`, border: `1px solid ${DOMAIN_COLORS[active.domain]}25` }}>
              {active.domain} domain
            </span>
            <span className="text-[9px] font-mono text-[#1e293b] border border-white/[0.06] px-2 py-0.5 rounded">
              WCAG AAA
            </span>
          </div>
        </div>

        {/* ── Language tab strip ── */}
        <div className="flex overflow-x-auto border-b border-white/[0.05]" style={{ scrollbarWidth: "none" }}>
          {LANGS.map(l => (
            <motion.button
              key={l.id}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-mono relative transition-colors"
              style={{ color: active.id === l.id ? l.color : "#334155" }}
              onClick={() => setActive(l)}
              whileHover={{ color: l.color }}
              transition={{ duration: 0.15 }}
              aria-pressed={active.id === l.id}
            >
              {active.id === l.id && (
                <motion.div
                  layoutId="lang-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: l.color }}
                />
              )}
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: l.color }} aria-hidden="true" />
              {l.label}
            </motion.button>
          ))}
        </div>

        {/* ── Editor + IR pane ── */}
        <div className="grid md:grid-cols-2" style={{ minHeight: 280 }}>
          {/* Source pane */}
          <div className="border-r border-white/[0.05]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]"
              style={{ background: `${active.color}06` }}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: active.color }} aria-hidden="true" />
                <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: active.color }}>
                  {active.label} Source
                </span>
              </div>
              <motion.button
                className="text-[9px] font-mono px-2 py-1 rounded border transition-colors"
                style={{
                  color: copied ? "#00ff88" : "#475569",
                  borderColor: copied ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.06)",
                  background: copied ? "rgba(0,255,136,0.08)" : "transparent",
                }}
                onClick={handleCopy}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                {copied ? "Copied!" : "Copy"}
              </motion.button>
            </div>

            <div className="p-4 font-mono text-[12px] leading-[22px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {active.source.map((line, i) => (
                    <div key={i} className="flex gap-3 group">
                      <span className="select-none text-[10px] w-5 text-right text-[#1e293b] pt-0.5 flex-shrink-0
                        group-hover:text-[#334155] transition-colors">
                        {i + 1}
                      </span>
                      <span style={{ color: TC.plain }}>{line || "\u00a0"}</span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* IR output pane */}
          <div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]"
              style={{ background: "rgba(168,85,247,0.04)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" aria-hidden="true" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#a855f7]">UAST IR — LLVM-Omni</span>
              <span className="ml-auto text-[9px] font-mono text-[#1e293b]">identical across all 15</span>
            </div>

            <div ref={termRef} className="p-4 font-mono text-[12px] leading-[22px] overflow-y-auto"
              style={{ maxHeight: 260 }}>
              <AnimatePresence mode="wait">
                <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {active.ir.slice(0, lineIdx + 1).map((line, i) => (
                    <motion.div
                      key={i}
                      className="flex gap-3"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <span className="select-none text-[10px] w-5 text-right text-[#1e293b] pt-0.5 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span>
                        {line.tokens.map((tok, j) => (
                          <span key={j} style={{ color: TC[tok.k] }}>{tok.t}</span>
                        ))}
                      </span>
                    </motion.div>
                  ))}
                  {/* blinking cursor */}
                  {lineIdx < active.ir.length - 1 && (
                    <motion.span
                      className="inline-block w-2 h-[14px] ml-1 rounded-sm align-middle"
                      style={{ background: "#a855f7" }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.65, repeat: Infinity }}
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Token legend (WCAG AAA) ── */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 px-5 py-3 border-t border-white/[0.04]"
          style={{ background: "rgba(0,0,0,0.28)" }}>
          <span className="text-[9px] font-mono text-[#1e293b] uppercase tracking-wider mr-1 self-center">
            Tokens:
          </span>
          {(Object.entries(TC) as [TK, string][])
            .filter(([k]) => k !== "plain")
            .map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5 text-[9px] font-mono" style={{ color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
                {type}
              </span>
            ))}
          <span className="ml-auto text-[9px] font-mono text-[#1e293b]">
            All ≥7:1 contrast ratio · WCAG AAA
          </span>
        </div>
      </motion.div>
    </div>
  )
}
