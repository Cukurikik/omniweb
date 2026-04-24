"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react"

interface Project { id:string; name:string; description:string; lang:string[]; status:string; visibility:string; stars:number; lastDeploy:string; branch:string; builds:number; deploys:number; size:string; coldStart:string; createdAt:string }

const sp = { type: "spring", stiffness: 300, damping: 26 } as const

const LANG_COLORS: Record<string,string> = {
  Rust:"#ef4444",Go:"#00d4ff",Python:"#f59e0b",TypeScript:"#3178c6",Julia:"#a855f7","C++":"#00ff88",Swift:"#f97316",Kotlin:"#7c3aed",
}
const STATUS_CFG: Record<string,{color:string;label:string}> = {
  live:     { color:"#00ff88", label:"Live" },
  building: { color:"#f59e0b", label:"Building" },
  failed:   { color:"#ef4444", label:"Failed" },
  paused:   { color:"#475569", label:"Paused" },
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const mx  = useMotionValue(0); const my = useMotionValue(0)
  const rx  = useTransform(my, [-0.5, 0.5], [5,-5])
  const ry  = useTransform(mx, [-0.5, 0.5], [-5, 5])
  const srx = useSpring(rx, { stiffness: 160, damping: 20 })
  const sry = useSpring(ry, { stiffness: 160, damping: 20 })
  const st  = STATUS_CFG[project.status] ?? { color:"#475569", label: project.status }
  const primaryLang  = project.lang[0]
  const primaryColor = LANG_COLORS[primaryLang] ?? "#64748b"

  return (
    <motion.div
      className="relative rounded-2xl border border-white/[0.07] p-5 overflow-hidden cursor-pointer group"
      style={{ background: "rgba(13,17,23,0.85)", rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ ...sp, delay: index * 0.06 }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX-r.left)/r.width-0.5); my.set((e.clientY-r.top)/r.height-0.5)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      whileHover={{ borderColor: `${primaryColor}25`, boxShadow: `0 0 40px ${primaryColor}12, 0 8px 32px rgba(0,0,0,0.3)` }}
    >
      {/* top corner accent */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }} aria-hidden="true" />

      {/* shimmer on hover */}
      <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)" }}
        whileHover={{ translateX: "100%" }} transition={{ duration: 0.6 }} aria-hidden="true" />

      <div className="relative z-10">
        {/* header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <motion.div
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
              style={{ background: `${primaryColor}15`, color: primaryColor, border: `1.5px solid ${primaryColor}22` }}
              whileHover={{ scale: 1.1, rotate: 8 }} transition={sp}
            >
              {project.name[0].toUpperCase()}
            </motion.div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#e2e8f0] truncate">{project.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded`}
                  style={{ color: project.visibility==="public" ? "#00d4ff":"#475569", background: project.visibility==="public" ? "rgba(0,212,255,0.08)":"rgba(71,85,105,0.1)" }}>
                  {project.visibility}
                </span>
                <span className="text-[9px] font-mono text-[#334155]">branch: {project.branch}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <motion.span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
              style={{ color: st.color, background: `${st.color}12` }}
              animate={project.status==="building" ? { opacity:[1,0.5,1] } : {}}
              transition={project.status==="building" ? { duration:1.4, repeat:Infinity } : {}}
            >
              {["live","building"].includes(project.status) && (
                <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.color }}
                  animate={{ scale:[1,1.4,1], opacity:[1,0.5,1] }}
                  transition={{ duration:1.8, repeat:Infinity }} aria-hidden="true" />
              )}
              {st.label}
            </motion.span>
          </div>
        </div>

        {/* description */}
        <p className="text-[11px] text-[#475569] leading-relaxed mb-4 line-clamp-2">{project.description}</p>

        {/* lang tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.lang.map(l => (
            <span key={l} className="px-2 py-0.5 rounded-md text-[10px] font-mono"
              style={{ color: LANG_COLORS[l]??"#64748b", background:`${LANG_COLORS[l]??"#64748b"}10`, border:`1px solid ${LANG_COLORS[l]??"#64748b"}18` }}>
              {l}
            </span>
          ))}
        </div>

        {/* stats row */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.05]">
          {[
            { label:"builds",  val: project.builds,    color:"#00d4ff" },
            { label:"deploys", val: project.deploys,   color:"#00ff88" },
            { label:"cold",    val: project.coldStart,  color:"#f59e0b" },
            { label:"size",    val: project.size,       color:"#a855f7" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[13px] font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[9px] text-[#334155] font-mono">{s.label}</p>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1 text-[10px] text-[#334155] font-mono">
            <svg className="w-3 h-3 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            {project.stars}
          </div>
          <p className="text-[10px] text-[#334155] font-mono">{timeAgo(project.lastDeploy)}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState("all")
  const [q,        setQ]        = useState("")

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setProjects(d?.projects ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    const matchF = filter==="all" || p.status===filter
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())
    return matchF && matchQ
  })

  const FILTERS = ["all","live","building","failed","paused"]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* header */}
      <motion.div className="flex items-center justify-between"
        initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={sp}>
        <div>
          <h1 className="text-2xl font-black text-[#e2e8f0]">Projects</h1>
          <p className="text-[#475569] text-sm font-mono mt-0.5">{projects.length} repositories · OMNI Runtime</p>
        </div>
        <motion.button
          className="relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background:"rgba(0,212,255,0.1)", color:"#00d4ff", border:"1px solid rgba(0,212,255,0.2)" }}
          whileHover={{ scale:1.03, boxShadow:"0 0 24px rgba(0,212,255,0.25)" }}
          whileTap={{ scale:0.97 }} transition={sp}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          New Project
        </motion.button>
      </motion.div>

      {/* search + filters */}
      <motion.div className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ ...sp, delay:0.08 }}>
        <motion.input
          type="text" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search projects..."
          className="flex-1 bg-[#0d1117]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#e2e8f0] placeholder-[#334155] outline-none font-mono"
          whileFocus={{ borderColor:"rgba(0,212,255,0.4)", boxShadow:"0 0 0 3px rgba(0,212,255,0.08)" }}
          transition={{ duration:0.18 }}
        />
        <div className="flex items-center gap-1.5 bg-[#0d1117]/60 border border-white/[0.07] rounded-xl p-1">
          {FILTERS.map(f => (
            <motion.button key={f} onClick={() => setFilter(f)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-mono capitalize ${filter===f?"text-[#00d4ff]":"text-[#475569]"}`}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}>
              {filter===f && (
                <motion.div layoutId="proj-filter-bg"
                  className="absolute inset-0 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/25"
                  transition={{ type:"spring", stiffness:380, damping:30 }} aria-hidden="true" />
              )}
              <span className="relative z-10">{f}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i) => (
            <div key={i} className="h-60 rounded-2xl border border-white/[0.06] bg-[#0d1117]/60 animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" layout>
            {filtered.map((p,i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
