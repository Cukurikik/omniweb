import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"

/* types match the dashboard page TYPE_CFG exactly:
   success | warning | error | info | deploy              */
function getNotifications(userId: string) {
  return [
    {
      id: `n_${userId}_01`, type: "deploy",
      title: "Deployment live",
      message: "omni-api-gateway deployed to Edge (us-east-1) — cold start 6ms.",
      read: false, ts: Date.now() - 1_800_000, meta: "us-east-1 · 6ms",
    },
    {
      id: `n_${userId}_02`, type: "error",
      title: "Build failed",
      message: "data-stream-engine: out-of-memory on linker step (hotfix/mem-leak).",
      read: false, ts: Date.now() - 5_400_000, meta: "hotfix/mem-leak",
    },
    {
      id: `n_${userId}_03`, type: "success",
      title: "Build passed",
      message: "ml-inference-core compiled in 4.2s — 3 stages, 0 warnings.",
      read: false, ts: Date.now() - 12_600_000, meta: "feat/gpu-v2 · 4.2s",
    },
    {
      id: `n_${userId}_04`, type: "warning",
      title: "High build time detected",
      message: "Python+ML build took 8.1s — above your p99 threshold of 6s.",
      read: false, ts: Date.now() - 28_800_000, meta: "bld_x02 · Python",
    },
    {
      id: `n_${userId}_05`, type: "info",
      title: "New sign-in from device",
      message: "New sign-in detected from Chrome on macOS · San Francisco, CA.",
      read: true, ts: Date.now() - 86_400_000, meta: "Chrome / macOS",
    },
    {
      id: `n_${userId}_06`, type: "success",
      title: "Package published",
      message: "omni-queue v1.3.1 published to NEXUS public registry.",
      read: true, ts: Date.now() - 2 * 86_400_000, meta: "NEXUS · public",
    },
    {
      id: `n_${userId}_07`, type: "info",
      title: "OMNI v2.1.0 released",
      message: "New LLVM-Omni backend: 40% faster compilation, Kotlin support, LSP fixes.",
      read: true, ts: Date.now() - 3 * 86_400_000, meta: "changelog",
    },
    {
      id: `n_${userId}_08`, type: "deploy",
      title: "Deployment rolled back",
      message: "ap-tokyo-1 deploy auto-rolled back — P99 latency exceeded 50ms.",
      read: true, ts: Date.now() - 4 * 86_400_000, meta: "dep_x04 · auto-rollback",
    },
    {
      id: `n_${userId}_09`, type: "success",
      title: "Cold start record",
      message: "New personal best: 4.8ms cold start on Edge · ARM64.",
      read: true, ts: Date.now() - 5 * 86_400_000, meta: "Edge · ARM64",
    },
    {
      id: `n_${userId}_10`, type: "warning",
      title: "NEXUS package deprecated",
      message: "omni-native v1.1.x is deprecated — upgrade to v1.2.0 immediately.",
      read: true, ts: Date.now() - 6 * 86_400_000, meta: "omni-native · v1.1.x",
    },
    {
      id: `n_${userId}_11`, type: "error",
      title: "Security advisory",
      message: "CVE-2025-1234 affects C++ FFI bridge < v2.9.1 — update recommended.",
      read: true, ts: Date.now() - 7 * 86_400_000, meta: "CVE-2025-1234",
    },
    {
      id: `n_${userId}_12`, type: "info",
      title: "Scheduled maintenance",
      message: "NEXUS registry read-only Apr 28 01:00–03:00 UTC. Plan accordingly.",
      read: true, ts: Date.now() - 8 * 86_400_000, meta: "Apr 28 · UTC",
    },
  ]
}

export async function GET() {
  const session = await getSessionFromCookie()
  const userId  = session?.userId ?? "usr_demo_0001"
  const notifications = getNotifications(userId)
  return NextResponse.json({
    notifications,
    unread: notifications.filter(n => !n.read).length,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })
  const { id } = await req.json()
  return NextResponse.json({ ok: true, id, message: "Notification marked as read." })
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })
  const { id } = await req.json()
  return NextResponse.json({ ok: true, id, message: "Notification dismissed." })
}
