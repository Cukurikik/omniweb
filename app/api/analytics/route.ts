import { NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export async function GET() {
  const session = await getSessionFromCookie()
  const userId  = session?.userId ?? "usr_demo"

  const buildHistory = Array.from({ length: 30 }, (_, i) => ({
    date:     daysAgo(29 - i),
    builds:   Math.floor(4 + Math.random() * 22),
    deploys:  Math.floor(1 + Math.random() * 10),
    duration: Math.floor(1200 + Math.random() * 6800),
  }))

  const langDist = [
    { lang: "Rust",       pct: 34, color: "#ef4444" },
    { lang: "Go",         pct: 24, color: "#00d4ff" },
    { lang: "Python",     pct: 18, color: "#f59e0b" },
    { lang: "TypeScript", pct: 14, color: "#3178c6" },
    { lang: "Julia",      pct: 7,  color: "#a855f7" },
    { lang: "C++",        pct: 3,  color: "#00ff88" },
  ]

  const errorRate = Array.from({ length: 30 }, (_, i) => ({
    date:     daysAgo(29 - i),
    errors:   Math.floor(Math.random() * 5),
    warnings: Math.floor(1 + Math.random() * 10),
  }))

  const coldStarts = Array.from({ length: 30 }, (_, i) => ({
    date: daysAgo(29 - i),
    avg:  parseFloat((4.5 + Math.random() * 4).toFixed(1)),
    p99:  parseFloat((7.2 + Math.random() * 9).toFixed(1)),
  }))

  const peakHours = Array.from({ length: 24 }, (_, i) => ({
    hour:     `${String(i).padStart(2, "0")}:00`,
    activity: i >= 8 && i <= 20 ? Math.floor(22 + Math.random() * 78) : Math.floor(2 + Math.random() * 18),
  }))

  return NextResponse.json({
    userId,
    summary: {
      totalBuilds:   buildHistory.reduce((a, b) => a + b.builds, 0),
      successRate:   97,
      avgBuildTime:  3.9,
      coldStartP99:  8.6,
    },
    buildHistory,
    langDist,
    errorRate,
    coldStarts,
    peakHours,
  })
}
