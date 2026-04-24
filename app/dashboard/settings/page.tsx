"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useDash } from "../layout"

const sp = { type: "spring", stiffness: 300, damping: 26 } as const

type Tab = "profile" | "security" | "notifications" | "api" | "billing"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",        icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { id: "security",      label: "Security",       icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2l6 3v5c0 4-2.7 7-6 8-3.3-1-6-4-6-8V5l6-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg> },
  { id: "notifications", label: "Alerts",         icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 15.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: "api",           label: "API Keys",       icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8" cy="11" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M11.5 7.5l6 6M15 8l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { id: "billing",       label: "Billing",        icon: <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M2 9h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
]

/* ─── input field ────────────────────────────────────────── */
function Field({ label, value, onChange, type = "text", placeholder = "", disabled = false }: {
  label: string; value: string; onChange?: (v: string) => void
  type?: string; placeholder?: string; disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-mono text-[#475569] uppercase tracking-wider">{label}</label>
      <motion.input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[#080b12] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#e2e8f0] placeholder-[#334155] outline-none font-mono disabled:opacity-40 disabled:cursor-not-allowed"
        whileFocus={{ borderColor: "rgba(0,212,255,0.4)", boxShadow: "0 0 0 3px rgba(0,212,255,0.08)" }}
        transition={{ duration: 0.18 }}
      />
    </div>
  )
}

/* ─── toggle switch ──────────────────────────────────────── */
function Toggle({ label, sub, value, onChange, color = "#00d4ff" }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; color?: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <div>
        <p className="text-[13px] font-medium text-[#e2e8f0]">{label}</p>
        {sub && <p className="text-[11px] text-[#334155] font-mono mt-0.5">{sub}</p>}
      </div>
      <motion.button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full border flex-shrink-0"
        animate={{
          background: value ? `${color}22` : "rgba(255,255,255,0.04)",
          borderColor: value ? `${color}40` : "rgba(255,255,255,0.08)",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={sp}
      >
        <motion.span
          className="absolute top-0.5 w-5 h-5 rounded-full"
          animate={{
            x: value ? 20 : 2,
            background: value ? color : "#334155",
            boxShadow: value ? `0 0 8px ${color}60` : "none",
          }}
          transition={sp}
          aria-hidden="true"
        />
      </motion.button>
    </div>
  )
}

/* ─── save button ────────────────────────────────────────── */
function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={saving}
      className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
      style={{ background: "rgba(0,212,255,0.12)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.22)" }}
      whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,212,255,0.22)", borderColor: "rgba(0,212,255,0.4)" }}
      whileTap={{ scale: 0.97 }}
      transition={sp}
    >
      <motion.div className="absolute inset-0 -translate-x-full pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.07), transparent)" }}
        whileHover={{ translateX: "100%" }} transition={{ duration: 0.5 }} aria-hidden="true" />
      <AnimatePresence mode="wait">
        {saving ? (
          <motion.svg key="spin" className="w-4 h-4 animate-spin relative z-10" viewBox="0 0 20 20" fill="none"
            initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} aria-hidden="true">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.8" strokeDasharray="22 22" strokeLinecap="round" />
          </motion.svg>
        ) : saved ? (
          <motion.svg key="check" className="w-4 h-4 relative z-10" viewBox="0 0 20 20" fill="none"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
            <path d="M4 10l4 4 8-8" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        ) : (
          <motion.svg key="save" className="w-4 h-4 relative z-10" viewBox="0 0 20 20" fill="none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
            <path d="M4 4h9l3 3v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4zM8 17v-6h4v6M8 4v4h6V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </AnimatePresence>
      <span className="relative z-10">{saving ? "Saving…" : saved ? "Saved!" : "Save changes"}</span>
    </motion.button>
  )
}

/* ─── api key row ─────────────────────────────────────────── */
function ApiKeyRow({ label, keyVal, created }: { label: string; keyVal: string; created: string }) {
  const [revealed, setRevealed] = useState(false)
  const [copied,   setCopied]   = useState(false)
  const masked = keyVal.slice(0, 12) + "•".repeat(24)
  function copy() {
    navigator.clipboard.writeText(keyVal).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#080b12]/60"
      whileHover={{ borderColor: "rgba(0,212,255,0.15)" }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-[#94a3b8]">{label}</p>
        <p className="text-[11px] font-mono text-[#334155] mt-0.5">Created {created}</p>
        <motion.p
          className="text-[11px] font-mono text-[#475569] mt-1 truncate"
          animate={{ opacity: revealed ? 1 : 0.7 }}
        >
          {revealed ? keyVal : masked}
        </motion.p>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => setRevealed(r => !r)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#e2e8f0] border border-white/[0.07] hover:border-white/[0.14] transition-colors"
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          aria-label={revealed ? "Hide key" : "Reveal key"}
        >
          {revealed
            ? <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 3l14 14M8.5 8.9A3 3 0 0011 13.5M4.5 5.9A9 9 0 002 10s3 6 8 6a8 8 0 003.9-1.1M7 4.3A9 9 0 0110 4c5 0 8 6 8 6a13 13 0 01-1.5 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
          }
        </motion.button>
        <motion.button
          onClick={copy}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.07] transition-colors"
          style={{ color: copied ? "#00ff88" : "#475569", borderColor: copied ? "rgba(0,255,136,0.25)" : undefined }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          aria-label="Copy API key"
        >
          {copied
            ? <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="8" y="8" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 12H3a1 1 0 01-1-1V3a1 1 0 011-1h8a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function SettingsPage() {
  const { user } = useDash()
  const [tab,    setTab]    = useState<Tab>("profile")
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const [profile, setProfile] = useState({ name: "", email: "", username: "", bio: "", website: "" })
  const [notifPrefs, setNotifPrefs] = useState({
    builds:   true, deploys:  true, failures: true,
    security: true, news:     false, digest:   true,
  })

  useEffect(() => {
    if (user) {
      setProfile(p => ({
        ...p,
        name:  user.name  ?? "",
        email: user.email ?? "",
        username: user.name?.toLowerCase().replace(/\s+/g, "") ?? "",
      }))
    }
  }, [user])

  async function handleSave() {
    setSaving(true)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={sp}>
        <h1 className="text-2xl font-black text-[#e2e8f0]">Settings</h1>
        <p className="text-[#475569] text-sm font-mono mt-0.5">Manage your account, security, and preferences</p>
      </motion.div>

      {/* tab rail */}
      <motion.div
        className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto pb-px"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ ...sp, delay: 0.06 }}
      >
        {TABS.map(t => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors ${tab === t.id ? "text-[#00d4ff]" : "text-[#475569] hover:text-[#94a3b8]"}`}
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          >
            {tab === t.id && (
              <motion.div
                layoutId="settings-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: "#00d4ff" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <span style={{ color: tab === t.id ? "#00d4ff" : undefined }}>{t.icon}</span>
            {t.label}
          </motion.button>
        ))}
      </motion.div>

      {/* content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
          exit={{    opacity: 0, y: -8,  filter: "blur(4px)" }}
          transition={sp}
        >
          {/* PROFILE */}
          {tab === "profile" && (
            <div className="rounded-2xl border border-white/[0.07] p-6 space-y-6"
              style={{ background: "rgba(13,17,23,0.85)" }}>
              {/* avatar */}
              <div className="flex items-center gap-5">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                  style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.25),rgba(0,255,136,0.15))", color: "#00d4ff", border: "2px solid rgba(0,212,255,0.2)" }}
                  whileHover={{ scale: 1.06, rotate: 5, boxShadow: "0 0 24px rgba(0,212,255,0.3)" }}
                  transition={sp}
                >
                  {profile.name?.[0]?.toUpperCase() ?? "U"}
                </motion.div>
                <div>
                  <p className="text-[13px] font-semibold text-[#e2e8f0]">Profile Avatar</p>
                  <p className="text-[11px] text-[#334155] font-mono mt-0.5">Auto-generated from name initials</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name"   value={profile.name}     onChange={v => setProfile(p=>({...p,name:v}))} placeholder="Ada Lovelace" />
                <Field label="Username"    value={profile.username} onChange={v => setProfile(p=>({...p,username:v}))} placeholder="ada_lovelace" />
                <Field label="Email"       value={profile.email}    onChange={v => setProfile(p=>({...p,email:v}))} type="email" placeholder="ada@omni.dev" />
                <Field label="Website"     value={profile.website}  onChange={v => setProfile(p=>({...p,website:v}))} placeholder="https://omni.dev" />
              </div>
              <Field label="Bio" value={profile.bio} onChange={v => setProfile(p=>({...p,bio:v}))} placeholder="Senior compiler engineer obsessed with performance." />
              <div className="flex justify-end pt-2">
                <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
              </div>
            </div>
          )}

          {/* SECURITY */}
          {tab === "security" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.07] p-6 space-y-4"
                style={{ background: "rgba(13,17,23,0.85)" }}>
                <h2 className="text-[14px] font-bold text-[#e2e8f0] mb-3">Change Password</h2>
                <Field label="Current Password" value="" type="password" placeholder="••••••••" />
                <Field label="New Password"     value="" type="password" placeholder="min 8 characters" />
                <Field label="Confirm Password" value="" type="password" placeholder="repeat new password" />
                <div className="flex justify-end">
                  <SaveBtn onClick={async () => {}} saving={false} saved={false} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.07] p-6"
                style={{ background: "rgba(13,17,23,0.85)" }}>
                <h2 className="text-[14px] font-bold text-[#e2e8f0] mb-4">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-[#64748b] font-mono">Status: <span className="text-[#ef4444]">Disabled</span></p>
                    <p className="text-[11px] text-[#334155] mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <motion.button
                    className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#00d4ff] border border-[#00d4ff]/22 bg-[#00d4ff]/08"
                    whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(0,212,255,0.2)" }}
                    whileTap={{ scale: 0.97 }} transition={sp}
                  >
                    Enable 2FA
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifications" && (
            <div className="rounded-2xl border border-white/[0.07] p-6"
              style={{ background: "rgba(13,17,23,0.85)" }}>
              <h2 className="text-[14px] font-bold text-[#e2e8f0] mb-5">Notification Preferences</h2>
              <Toggle label="Build Alerts"      sub="Notify on build success or failure"  value={notifPrefs.builds}   onChange={v=>setNotifPrefs(p=>({...p,builds:v}))}   />
              <Toggle label="Deployment Events" sub="Edge deploys and rollbacks"           value={notifPrefs.deploys}  onChange={v=>setNotifPrefs(p=>({...p,deploys:v}))}  />
              <Toggle label="Build Failures"    sub="Immediate alert on error"             value={notifPrefs.failures} onChange={v=>setNotifPrefs(p=>({...p,failures:v}))} color="#ef4444" />
              <Toggle label="Security Alerts"   sub="Login from new device or location"    value={notifPrefs.security} onChange={v=>setNotifPrefs(p=>({...p,security:v}))} color="#a855f7" />
              <Toggle label="Product News"      sub="Framework updates and announcements"  value={notifPrefs.news}     onChange={v=>setNotifPrefs(p=>({...p,news:v}))}     color="#f59e0b" />
              <Toggle label="Weekly Digest"     sub="Summary of your build activity"       value={notifPrefs.digest}   onChange={v=>setNotifPrefs(p=>({...p,digest:v}))}   color="#00ff88" />
              <div className="flex justify-end mt-5">
                <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
              </div>
            </div>
          )}

          {/* API KEYS */}
          {tab === "api" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.07] p-6 space-y-3"
                style={{ background: "rgba(13,17,23,0.85)" }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[14px] font-bold text-[#e2e8f0]">API Keys</h2>
                  <motion.button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono text-[#00d4ff] border border-[#00d4ff]/22 bg-[#00d4ff]/08"
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={sp}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    Generate key
                  </motion.button>
                </div>
                <ApiKeyRow label="Production Key"    keyVal="omni_live_sk_xK93mNp2Qr7vZ1TlYdCbWoEaFuHjGs04" created="Jan 12, 2025" />
                <ApiKeyRow label="Development Key"   keyVal="omni_dev_sk_Ac6nMxRt8pLvQ2FzYkWbJdUeGsHoNi31"  created="Feb 4, 2025"  />
                <ApiKeyRow label="CI/CD Pipeline Key" keyVal="omni_ci_sk_BrZ7yKvMxTq4PwDnEsLaFcGhUiJoOp90"  created="Mar 1, 2025"  />
              </div>
            </div>
          )}

          {/* BILLING */}
          {tab === "billing" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#00d4ff]/15 p-6"
                style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.04), rgba(0,255,136,0.02))" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-[#475569] uppercase tracking-wider mb-1">Current Plan</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-[#e2e8f0]">{user?.plan?.toUpperCase() ?? "COMMUNITY"}</span>
                      <motion.span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: "rgba(0,212,255,0.12)", color: "#00d4ff" }}
                        animate={{ boxShadow: ["0 0 0 0 rgba(0,212,255,0)", "0 0 0 4px rgba(0,212,255,0.08)", "0 0 0 0 rgba(0,212,255,0)"] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        ACTIVE
                      </motion.span>
                    </div>
                    <p className="text-[#475569] text-[12px] font-mono mt-2">Next billing: May 1, 2025 · $0.00</p>
                  </div>
                  <motion.a href="/register"
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#080b12]"
                    style={{ background: "linear-gradient(135deg, #00d4ff, #00ff88)" }}
                    whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(0,212,255,0.35)" }}
                    whileTap={{ scale: 0.97 }} transition={sp}
                  >
                    Upgrade to Pro
                  </motion.a>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.07] p-6"
                style={{ background: "rgba(13,17,23,0.85)" }}>
                <h2 className="text-[14px] font-bold text-[#e2e8f0] mb-4">Usage This Month</h2>
                {[
                  { label: "Build minutes", used: 340, max: 500, color: "#00d4ff" },
                  { label: "Deployments",   used: 12,  max: 50,  color: "#00ff88" },
                  { label: "Unikernel slots", used: 1,  max: 1,   color: "#a855f7" },
                ].map((item, i) => (
                  <div key={item.label} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-[#475569]">{item.label}</span>
                      <span style={{ color: item.color }}>{item.used} / {item.max}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.used / item.max) * 100}%` }}
                        transition={{ ...sp, delay: 0.15 + i * 0.08 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
