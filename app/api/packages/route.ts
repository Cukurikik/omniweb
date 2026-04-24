import { NextRequest, NextResponse } from "next/server"

const PACKAGES = [
  {
    id: "omni-http", name: "omni-http", version: "3.1.2", lang: "Go",
    description: "HTTP/3 server + router with zero-copy request handling and middleware chaining.",
    downloads: 142_000, stars: 2840, license: "Apache-2.0", verified: true,
    author: "omni-core", size: "48 KB",
    tags: ["http", "server", "router", "http3"],
  },
  {
    id: "omni-crypto", name: "omni-crypto", version: "2.0.1", lang: "Rust",
    description: "AEAD encryption, Ed25519 signatures, X25519 key exchange — FIPS 140-2 compliant.",
    downloads: 98_000, stars: 1920, license: "MIT", verified: true,
    author: "omni-security", size: "112 KB",
    tags: ["crypto", "aead", "ed25519", "security"],
  },
  {
    id: "omni-ml", name: "omni-ml", version: "1.4.0", lang: "Python",
    description: "ML pipeline builder — tensors, autodiff backprop, CUDA/Metal GPU acceleration.",
    downloads: 76_000, stars: 3100, license: "Apache-2.0", verified: true,
    author: "omni-ai", size: "8.4 MB",
    tags: ["ml", "tensor", "cuda", "autograd"],
  },
  {
    id: "omni-ui", name: "omni-ui", version: "4.0.0", lang: "TypeScript",
    description: "Type-safe reactive UI components with SSR, streaming, and zero-runtime CSS.",
    downloads: 210_000, stars: 5400, license: "MIT", verified: true,
    author: "omni-core", size: "220 KB",
    tags: ["ui", "react", "ssr", "components"],
  },
  {
    id: "omni-db", name: "omni-db", version: "2.3.0", lang: "Go",
    description: "Zero-allocation SQL/NoSQL client with connection pooling and prepared statement caching.",
    downloads: 88_000, stars: 1760, license: "MIT", verified: true,
    author: "omni-data", size: "64 KB",
    tags: ["database", "sql", "orm", "pool"],
  },
  {
    id: "omni-stats", name: "omni-stats", version: "1.1.0", lang: "Julia",
    description: "Bayesian inference, Monte Carlo sampling, GLM — GPU-accelerated via CUDA.jl.",
    downloads: 34_000, stars: 890, license: "MIT", verified: false,
    author: "omni-science", size: "3.1 MB",
    tags: ["stats", "bayesian", "julia", "gpu"],
  },
  {
    id: "omni-graph", name: "omni-graph", version: "1.0.3", lang: "Rust",
    description: "Petgraph-compatible directed/undirected graph engine with UAST serialisation support.",
    downloads: 22_000, stars: 540, license: "Apache-2.0", verified: false,
    author: "omni-core", size: "92 KB",
    tags: ["graph", "data-structure", "uast"],
  },
  {
    id: "omni-proto", name: "omni-proto", version: "3.0.0", lang: "C++",
    description: "Protobuf / gRPC bindings with zero-copy UAST integration and streaming support.",
    downloads: 58_000, stars: 1230, license: "BSD-3", verified: true,
    author: "omni-rpc", size: "180 KB",
    tags: ["protobuf", "grpc", "rpc", "streaming"],
  },
  {
    id: "omni-wasm", name: "omni-wasm", version: "2.1.0", lang: "TypeScript",
    description: "WASM runner for all OMNI targets: browser sandbox, Node.js, Deno, and Bun.",
    downloads: 65_000, stars: 2100, license: "MIT", verified: true,
    author: "omni-runtime", size: "340 KB",
    tags: ["wasm", "browser", "runtime", "sandbox"],
  },
  {
    id: "omni-native", name: "omni-native", version: "1.2.0", lang: "Swift",
    description: "Native iOS/macOS bindings using OMNI Interface domain — UIKit and SwiftUI ready.",
    downloads: 28_000, stars: 740, license: "MIT", verified: false,
    author: "omni-mobile", size: "520 KB",
    tags: ["ios", "swift", "native", "macos"],
  },
  {
    id: "omni-queue", name: "omni-queue", version: "1.3.1", lang: "Rust",
    description: "Lock-free MPMC queue optimised for OMNI's async runtime — zero-copy, cache-line aligned.",
    downloads: 41_000, stars: 980, license: "Apache-2.0", verified: true,
    author: "omni-concurrency", size: "28 KB",
    tags: ["queue", "concurrency", "lock-free", "mpmc"],
  },
  {
    id: "omni-image", name: "omni-image", version: "2.0.0", lang: "Go",
    description: "Image processing: resize, transcode, SIMD-optimised filters, AVIF/WebP support.",
    downloads: 53_000, stars: 1340, license: "MIT", verified: true,
    author: "omni-media", size: "2.8 MB",
    tags: ["image", "avif", "webp", "simd"],
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = searchParams.get("q")?.toLowerCase() ?? ""
  const lang = searchParams.get("lang") ?? ""
  const sort = searchParams.get("sort") ?? "downloads" // downloads | stars | name
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const per  = parseInt(searchParams.get("per")  ?? "12", 10)

  let results = PACKAGES.filter(p => {
    const matchQ    = !q    || p.name.includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))
    const matchLang = !lang || p.lang === lang
    return matchQ && matchLang
  })

  if (sort === "stars")     results = results.sort((a, b) => b.stars     - a.stars)
  if (sort === "downloads") results = results.sort((a, b) => b.downloads - a.downloads)
  if (sort === "name")      results = results.sort((a, b) => a.name.localeCompare(b.name))

  const total   = results.length
  const sliced  = results.slice((page - 1) * per, page * per)

  return NextResponse.json({
    packages: sliced,
    total,
    page,
    per,
    pages: Math.ceil(total / per),
  })
}
