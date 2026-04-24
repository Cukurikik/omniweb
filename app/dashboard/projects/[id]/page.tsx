"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "motion/react"
import OmniLogo from "@/components/omni-logo"

interface Project {
  id: string
  name: string
  slug: string
  description: string
  lang: string[]
  status: string
  visibility: string
  stars: number
  last_deploy: string
  branch: string
  builds: number
  deploys: number
  size: string
  cold_start: string
  created_at: string
}

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  live:     { color: "#00ff88", label: "Live" },
  building: { color: "#00d4ff", label: "Building" },
  failed:   { color: "#ef4444", label: "Failed" },
  paused:   { color: "#f59e0b", label: "Paused" },
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => { if (data.project) setProject(data.project) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    router.push("/dashboard/projects")
  }

  const handleStatus = async (status: string) => {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setProject(p => p ? { ...p, status } : p)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <OmniLogo size={32} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[#94a3b8]">Project not found.</p>
        <button onClick={() => router.push("/dashboard/projects")} className="text-[#00d4ff] text-sm underline">
          Back to Projects
        </button>
      </div>
    )
  }

  const cfg = STATUS_CFG[project.status] ?? STATUS_CFG.paused

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-[#94a3b8] text-sm">{project.description}</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/10 transition-colors"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Builds", value: project.builds },
          { label: "Deploys", value: project.deploys },
          { label: "Stars", value: project.stars },
          { label: "Size", value: project.size },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1117] rounded-xl p-4 border border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-wider text-[#64748b] mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d1117] rounded-xl p-5 border border-white/[0.06] space-y-3">
        <h2 className="text-sm font-bold text-white">Details</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-[#64748b]">Branch</span>
          <span className="text-white font-mono">{project.branch}</span>
          <span className="text-[#64748b]">Languages</span>
          <span className="text-white">{project.lang.join(", ")}</span>
          <span className="text-[#64748b]">Visibility</span>
          <span className="text-white capitalize">{project.visibility}</span>
          <span className="text-[#64748b]">Cold Start</span>
          <span className="text-white">{project.cold_start}</span>
          <span className="text-[#64748b]">Last Deploy</span>
          <span className="text-white">{new Date(project.last_deploy).toLocaleString()}</span>
          <span className="text-[#64748b]">Created</span>
          <span className="text-white">{new Date(project.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-3">
        {project.status !== "live" && (
          <button
            onClick={() => handleStatus("live")}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 hover:bg-[#00ff88]/20 transition-colors"
          >
            Deploy
          </button>
        )}
        {project.status === "live" && (
          <button
            onClick={() => handleStatus("paused")}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 transition-colors"
          >
            Pause
          </button>
        )}
        {project.status === "failed" && (
          <button
            onClick={() => handleStatus("building")}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 hover:bg-[#00d4ff]/20 transition-colors"
          >
            Rebuild
          </button>
        )}
      </div>
    </motion.div>
  )
}
