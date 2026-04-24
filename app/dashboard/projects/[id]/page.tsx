"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { useDash } from "@/app/dashboard/layout"

interface Project {
  id: string
  name: string
  slug: string
  description: string
  languages: string[]
  status: "live" | "building" | "failed" | "paused"
  visibility: "public" | "private"
  stars: number
  last_deploy: string | null
  branch: string
  builds: number
  deploys: number
  size: string
  cold_start: string
  created_at: string
}

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  live:     { color: "#00ff88", bg: "rgba(0,255,136,0.1)",  label: "Live" },
  building: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Building" },
  failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  label: "Failed" },
  paused:   { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: "Paused" },
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useDash()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.project) setProject(d.project)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (res.ok) router.push("/dashboard/projects")
    } finally {
      setDeleting(false)
    }
  }

  async function handleStatusChange(status: Project["status"]) {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const d = await res.json()
      if (d.project) setProject(d.project)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <motion.div className="w-6 h-6 border-2 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
    </div>
  )

  if (!project) return (
    <div className="text-center py-20">
      <p className="text-[#475569] text-lg mb-4">Project not found.</p>
      <Link href="/dashboard/projects" className="text-[#00d4ff] text-sm font-semibold hover:underline">Back to Projects</Link>
    </div>
  )

  const statusCfg = STATUS_CFG[project.status] || STATUS_CFG.paused

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-[#e2e8f0]">{project.name}</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest" style={{ color: statusCfg.color, background: statusCfg.bg }}>
              {statusCfg.label}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#475569] border border-white/[0.08]">
              {project.visibility}
            </span>
          </div>
          <p className="text-[#475569] text-sm">{project.description || "No description"}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/[0.2] hover:bg-red-500/10 transition-all disabled:opacity-40"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Builds", value: project.builds, color: "#00d4ff" },
          { label: "Deploys", value: project.deploys, color: "#00ff88" },
          { label: "Stars", value: project.stars, color: "#f59e0b" },
          { label: "Cold Start", value: project.cold_start, color: "#a855f7" },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest mb-3">Details</p>
          <div className="space-y-2.5">
            {[
              { label: "Branch", value: project.branch },
              { label: "Size", value: project.size },
              { label: "Last Deploy", value: project.last_deploy ? new Date(project.last_deploy).toLocaleDateString() : "Never" },
              { label: "Created", value: new Date(project.created_at).toLocaleDateString() },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-xs text-[#475569]">{row.label}</span>
                <span className="text-xs text-[#e2e8f0] font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest mb-3">Languages</p>
          <div className="flex flex-wrap gap-2">
            {project.languages.map(lang => (
              <span key={lang} className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border border-white/[0.08] text-[#94a3b8] bg-white/[0.03]">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status controls */}
      <div className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
        <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest mb-3">Change Status</p>
        <div className="flex flex-wrap gap-2">
          {(["live", "building", "paused", "failed"] as const).map(status => {
            const cfg = STATUS_CFG[status]
            const isActive = project.status === status
            return (
              <motion.button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${isActive ? "border-white/[0.15]" : "border-white/[0.07]"}`}
                style={{
                  color: isActive ? cfg.color : "#475569",
                  background: isActive ? cfg.bg : "transparent",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {cfg.label}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
