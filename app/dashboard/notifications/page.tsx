// @ts-nocheck
"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

const sp = { type: "spring", stiffness: 300, damping: 26 } as const

interface Notification {
  id: string; type: string; title: string; message: string
  ts: number; read: boolean; meta?: string
}

const TYPE_CFG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  success: {
    color: "#00ff88", bg: "rgba(0,255,136,0.1)",
    icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  warning: {
    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",
    icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 6v5M10 14h.01M3.5 16.5l6.5-12 6.5 12H3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  error: {
    color: "#ef4444", bg: "rgba(239,68,68,0.1)",
    icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 6v5M10 14h.01M18 10a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  },
  info: {
    color: "#00d4ff", bg: "rgba(0,212,255,0.1)",
    icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 9v5M10 6h.01M18 10a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  },
  deploy: {
    color: "#a855f7", bg: "rgba(168,85,247,0.1)",
    icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v10M5 8l5-5 5 5M4 16h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function NotifCard({ notif, index, onRead, onDelete }: {
  notif: Notification; index: number
  onRead: (id: string) => void; onDelete: (id: string) => void
}) {
  const cfg = TYPE_CFG[notif.type] ?? TYPE_CFG.info
  return (
    <motion.div
      layout
      key={notif.id}
      className="relative flex items-start gap-4 p-4 rounded-2xl border overflow-hidden group"
      style={{
        background: notif.read ? "rgba(8,11,18,0.5)" : "rgba(13,17,23,0.9)",
        borderColor: notif.read ? "rgba(255,255,255,0.05)" : `${cfg.color}18`,
      }}
      initial={{ opacity: 0, x: -20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0,   scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ ...sp, delay: index * 0.04 }}
      whileHover={{ borderColor: `${cfg.color}30`, boxShadow: `0 0 24px ${cfg.color}08` }}
    >
      {/* unread dot */}
      {!notif.read && (
        <motion.span
          className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ background: cfg.color }}
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        />
      )}

      {/* shimmer on hover */}
      <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.015), transparent)" }}
        whileHover={{ translateX: "100%" }} transition={{ duration: 0.55 }} aria-hidden="true" />

      {/* icon */}
      <motion.div
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
        style={{ background: cfg.bg, color: cfg.color }}
        whileHover={{ scale: 1.1, rotate: 6 }}
        transition={sp}
      >
        {cfg.icon}
      </motion.div>

      {/* body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className={`text-[13px] font-semibold ${notif.read ? "text-[#64748b]" : "text-[#e2e8f0]"}`}>{notif.title}</p>
          <span className="text-[10px] font-mono text-[#334155] shrink-0">{timeAgo(notif.ts)}</span>
        </div>
        <p className={`text-[12px] leading-relaxed ${notif.read ? "text-[#334155]" : "text-[#475569]"}`}>{notif.message}</p>
        {notif.meta && (
          <p className="text-[10px] font-mono mt-1.5 px-2 py-0.5 rounded-md inline-block"
            style={{ background: `${cfg.color}0a`, color: cfg.color }}>
            {notif.meta}
          </p>
        )}
      </div>

      {/* actions */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.read && (
          <motion.button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#00ff88] hover:bg-[#00ff88]/10 transition-colors"
            onClick={() => onRead(notif.id)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            title="Mark as read" aria-label="Mark as read"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        )}
        <motion.button
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
          onClick={() => onDelete(notif.id)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          title="Dismiss" aria-label="Dismiss notification"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function NotificationsPage() {
  const [items,   setItems]  = useState<Notification[]>([])
  const [loading, setLoad]   = useState(true)
  const [filter,  setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setItems(d?.notifications ?? []); setLoad(false) })
      .catch(() => setLoad(false))
  }, [])

  const unreadCount = items.filter(n => !n.read).length

  function markRead(id: string) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }
  function deleteNotif(id: string) {
    setItems(prev => prev.filter(n => n.id !== id))
  }
  function clearAll() {
    setItems([])
  }

  const displayed = filter === "unread" ? items.filter(n => !n.read) : items

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* header */}
      <motion.div className="flex items-center justify-between"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={sp}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#e2e8f0]">Notifications</h1>
            {unreadCount > 0 && (
              <motion.span
                className="px-2.5 py-0.5 rounded-full text-xs font-black"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                {unreadCount} new
              </motion.span>
            )}
          </div>
          <p className="text-[#475569] text-sm font-mono mt-0.5">Build alerts, deployments &amp; system events</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <motion.button
              onClick={markAllRead}
              className="px-3 py-1.5 rounded-xl text-[11px] font-mono text-[#00ff88] border border-[#00ff88]/20 bg-[#00ff88]/05 hover:bg-[#00ff88]/10 transition-colors"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={sp}
            >
              Mark all read
            </motion.button>
          )}
          {items.length > 0 && (
            <motion.button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl text-[11px] font-mono text-[#475569] border border-white/[0.07] hover:text-[#ef4444] hover:border-[#ef4444]/25 transition-colors"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={sp}
            >
              Clear all
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* filter tabs */}
      <motion.div
        className="flex items-center gap-1 bg-[#0d1117]/80 border border-white/[0.07] rounded-xl p-1 w-fit"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...sp, delay: 0.06 }}
      >
        {(["all", "unread"] as const).map(f => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative px-4 py-1.5 rounded-lg text-[12px] font-mono capitalize ${filter === f ? "text-[#00d4ff]" : "text-[#475569]"}`}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            {filter === f && (
              <motion.div layoutId="notif-filter-bg"
                className="absolute inset-0 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/25"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} aria-hidden="true" />
            )}
            <span className="relative z-10">
              {f === "unread" ? `Unread (${unreadCount})` : "All"}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl border border-white/[0.05] bg-[#0d1117]/60 animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-24 gap-4"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={sp}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl border border-white/[0.08] flex items-center justify-center text-[#334155]"
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 17H20L18.6 15.6A1 1 0 0118 14.8V11C18 8.4 16.4 6.2 14 5.3V5A2 2 0 0010 5V5.3C7.6 6.2 6 8.4 6 11V14.8A1 1 0 015.4 15.6L4 17H9M15 17V18A3 3 0 019 18V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <p className="text-[#334155] text-sm font-mono">
            {filter === "unread" ? "No unread notifications" : "All clear — no notifications"}
          </p>
        </motion.div>
      ) : (
        <motion.div className="flex flex-col gap-3" layout>
          <AnimatePresence mode="popLayout">
            {displayed.map((n, i) => (
              <NotifCard key={n.id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
