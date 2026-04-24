import { NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateStats(userId: string) {
  const seed    = userId.charCodeAt(4) || 42
  const builds  = 120 + (seed % 128)
  const deploys = 38  + (seed % 53)
  const pkgs    = 14  + (seed % 23)

  /* 14-day build/deploy history */
  const buildHistory = Array.from({ length: 14 }, (_, i) => ({
    date:     daysAgo(13 - i),
    builds:   rng(6, 28),
    deploys:  rng(2, 14),
    duration: rng(1800, 8200),
  }))

  /* Language distribution */
  const langDist = [
    { lang: "Rust",       pct: 34 },
    { lang: "Go",         pct: 24 },
    { lang: "Python",     pct: 18 },
    { lang: "TypeScript", pct: 14 },
    { lang: "Julia",      pct: 7  },
    { lang: "C++",        pct: 3  },
  ]

  /* Error/warning rate (14 days) */
  const errorRate = Array.from({ length: 14 }, (_, i) => ({
    date:     daysAgo(13 - i),
    errors:   rng(0, 4),
    warnings: rng(1, 9),
  }))

  /* Cold start latency (14 days) */
  const coldStarts = Array.from({ length: 14 }, (_, i) => ({
    date: daysAgo(13 - i),
    avg:  parseFloat((4.8 + Math.random() * 4.2).toFixed(1)),
    p99:  parseFloat((7.5 + Math.random() * 8.5).toFixed(1)),
  }))

  /* Peak hours (24h UTC) */
  const peakHours = Array.from({ length: 24 }, (_, i) => ({
    hour:     `${String(i).padStart(2, "0")}:00`,
    activity: (i >= 8 && i <= 20) ? rng(22, 100) : rng(2, 20),
  }))

  /* Recent builds */
  const recentBuilds = [
    { id: `bld_${seed}01`, lang: "Rust + Go",          status: "success", duration: 1240, branch: "main",         ts: Date.now() - 3_600_000   },
    { id: `bld_${seed}02`, lang: "Python + TypeScript", status: "success", duration: 2100, branch: "feat/ml-v2",   ts: Date.now() - 7_200_000   },
    { id: `bld_${seed}03`, lang: "C++ + Julia",         status: "failed",  duration: 890,  branch: "hotfix/oom",   ts: Date.now() - 14_400_000  },
    { id: `bld_${seed}04`, lang: "Go + TypeScript",     status: "success", duration: 1680, branch: "main",         ts: Date.now() - 28_800_000  },
    { id: `bld_${seed}05`, lang: "Rust",                status: "running", duration: null, branch: "dev",          ts: Date.now() - 120_000     },
    { id: `bld_${seed}06`, lang: "Julia",               status: "success", duration: 3340, branch: "feat/stats",   ts: Date.now() - 43_200_000  },
  ]

  /* Recent deploys */
  const recentDeploys = [
    { id: `dep_${seed}01`, target: "Edge · us-east-1",  status: "live",    size: "4.2 MB", coldStart: "7ms",  ts: Date.now() - 3_600_000   },
    { id: `dep_${seed}02`, target: "Edge · eu-west-1",  status: "live",    size: "3.8 MB", coldStart: "8ms",  ts: Date.now() - 7_200_000   },
    { id: `dep_${seed}03`, target: "WASM (Browser)",     status: "live",    size: "1.1 MB", coldStart: "22ms", ts: Date.now() - 86_400_000  },
    { id: `dep_${seed}04`, target: "Bare Metal",         status: "stopped", size: "6.1 MB", coldStart: "5ms",  ts: Date.now() - 172_800_000 },
    { id: `dep_${seed}05`, target: "Edge · ap-tokyo-1", status: "live",    size: "2.7 MB", coldStart: "9ms",  ts: Date.now() - 21_600_000  },
  ]

  return {
    summary: {
      totalBuilds:   builds,
      totalDeploys:  deploys,
      installedPkgs: pkgs,
      coldStartAvg:  "7.3ms",
      uptimeSLA:     "99.98%",
      lastActive:    new Date().toISOString(),
    },
    buildHistory,
    langDist,
    errorRate,
    coldStarts,
    peakHours,
    recentBuilds,
    recentDeploys,
  }
}

export async function GET() {
  const session = await getSessionFromCookie()
  /* Allow unauthenticated for demo — swap to 401 in production */
  const userId = session?.userId ?? "usr_demo_0001"
  return NextResponse.json(generateStats(userId))
}
