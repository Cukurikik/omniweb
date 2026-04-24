import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"

export interface Project {
  id:          string
  name:        string
  slug:        string
  description: string
  lang:        string[]
  status:      "live" | "building" | "failed" | "paused"
  visibility:  "public" | "private"
  stars:       number
  lastDeploy:  string
  branch:      string
  builds:      number
  deploys:     number
  createdAt:   string
  size:        string
  coldStart:   string
}

const DEMO_PROJECTS: Project[] = [
  {
    id: "prj_001", name: "omni-api-gateway", slug: "omni-api-gateway",
    description: "High-performance API gateway with Rust + Go polyglot routing and zero-copy request handling.",
    lang: ["Rust", "Go"], status: "live", visibility: "public",
    stars: 128, lastDeploy: new Date(Date.now() - 3_600_000).toISOString(),
    branch: "main", builds: 84, deploys: 31, size: "4.2 MB", coldStart: "6ms",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "prj_002", name: "ml-inference-core", slug: "ml-inference-core",
    description: "Real-time ML inference pipeline using Python + Julia with CUDA/Metal acceleration.",
    lang: ["Python", "Julia"], status: "building", visibility: "private",
    stars: 47, lastDeploy: new Date(Date.now() - 86400000).toISOString(),
    branch: "feat/gpu-v2", builds: 52, deploys: 18, size: "12.8 MB", coldStart: "22ms",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "prj_003", name: "omni-ui-dashboard", slug: "omni-ui-dashboard",
    description: "Type-safe reactive dashboard UI with TypeScript + Rust WASM rendering engine.",
    lang: ["TypeScript", "Rust"], status: "live", visibility: "public",
    stars: 234, lastDeploy: new Date(Date.now() - 7200000).toISOString(),
    branch: "main", builds: 112, deploys: 45, size: "2.1 MB", coldStart: "8ms",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "prj_004", name: "crypto-vault", slug: "crypto-vault",
    description: "Zero-knowledge cryptography vault built with Rust + C++ for maximum security.",
    lang: ["Rust", "C++"], status: "live", visibility: "private",
    stars: 91, lastDeploy: new Date(Date.now() - 172800000).toISOString(),
    branch: "main", builds: 38, deploys: 14, size: "3.4 MB", coldStart: "5ms",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: "prj_005", name: "data-stream-engine", slug: "data-stream-engine",
    description: "Real-time data streaming engine using Go + Python with Kafka integration.",
    lang: ["Go", "Python"], status: "failed", visibility: "private",
    stars: 15, lastDeploy: new Date(Date.now() - 3 * 86400000).toISOString(),
    branch: "hotfix/mem-leak", builds: 29, deploys: 8, size: "5.7 MB", coldStart: "14ms",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "prj_006", name: "native-bridge-sdk", slug: "native-bridge-sdk",
    description: "OMNI native bridge SDK for iOS/macOS/Android using Swift + Kotlin + Rust.",
    lang: ["Swift", "Kotlin"], status: "paused", visibility: "public",
    stars: 63, lastDeploy: new Date(Date.now() - 7 * 86400000).toISOString(),
    branch: "dev", builds: 21, deploys: 6, size: "7.3 MB", coldStart: "11ms",
    createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
  },
]

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  /* Allow unauthenticated for demo — swap to 401 guard in production */
  void session

  const { searchParams } = new URL(req.url)
  const q      = searchParams.get("q")?.toLowerCase() ?? ""
  const status = searchParams.get("status") ?? ""
  const sort   = searchParams.get("sort") ?? "lastDeploy"

  let results = DEMO_PROJECTS.filter(p => {
    const matchQ      = !q      || p.name.includes(q) || p.description.toLowerCase().includes(q)
    const matchStatus = !status || p.status === status
    return matchQ && matchStatus
  })

  if (sort === "stars")      results.sort((a, b) => b.stars      - a.stars)
  if (sort === "lastDeploy") results.sort((a, b) => new Date(b.lastDeploy).getTime() - new Date(a.lastDeploy).getTime())
  if (sort === "builds")     results.sort((a, b) => b.builds     - a.builds)
  if (sort === "name")       results.sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ projects: results, total: results.length })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: "Project name required." }, { status: 400 })

  const project: Project = {
    id:          `prj_${Date.now()}`,
    name:        body.name.trim(),
    slug:        body.name.trim().toLowerCase().replace(/\s+/g, "-"),
    description: body.description ?? "",
    lang:        body.lang ?? ["TypeScript"],
    status:      "paused",
    visibility:  body.visibility ?? "private",
    stars:       0,
    lastDeploy:  new Date().toISOString(),
    branch:      body.branch ?? "main",
    builds:      0,
    deploys:     0,
    size:        "0 KB",
    coldStart:   "—",
    createdAt:   new Date().toISOString(),
  }

  return NextResponse.json({ ok: true, project }, { status: 201 })
}
