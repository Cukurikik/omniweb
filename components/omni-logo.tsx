"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

interface OmniLogoProps {
  size?: number
  interactive?: boolean
  heroMode?: boolean
}

/**
 * OMNI Logo — 5 counter-rotating rings with satellite dots.
 * Now powered by Motion spring physics for cursor repulsion.
 * heroMode adds: ambient halo, pulse rings, 3D tilt, and a stronger field.
 */
export function OmniLogo({ size = 36, interactive = false, heroMode = false }: OmniLogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)

  /* Spring-physics position */
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: heroMode ? 80  : 140, damping: heroMode ? 14 : 18, mass: heroMode ? 0.6 : 0.4 })
  const springY = useSpring(rawY, { stiffness: heroMode ? 80  : 140, damping: heroMode ? 14 : 18, mass: heroMode ? 0.6 : 0.4 })

  /* 3D tilt for heroMode */
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const sTiltX = useSpring(tiltX, { stiffness: 160, damping: 22 })
  const sTiltY = useSpring(tiltY, { stiffness: 160, damping: 22 })
  const rotateX = useTransform(sTiltX, v => `${v}deg`)
  const rotateY = useTransform(sTiltY, v => `${v}deg`)

  const [touched, setTouched] = useState(false)

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = wrapRef.current
    if (!el) return
    const rect  = el.getBoundingClientRect()
    const cx    = rect.left + rect.width  / 2
    const cy    = rect.top  + rect.height / 2
    const dx    = e.clientX - cx
    const dy    = e.clientY - cy
    const dist  = Math.hypot(dx, dy)
    const zone  = heroMode ? 220 : 90
    const push  = heroMode ? 44  : 22

    if (dist < zone) {
      setTouched(true)
      const t        = 1 - dist / zone
      const strength = t * t * push
      rawX.set(-(dx / (dist || 1)) * strength)
      rawY.set(-(dy / (dist || 1)) * strength)
      if (heroMode) {
        tiltX.set(-(dy / zone) * 18)
        tiltY.set( (dx / zone) * 18)
      }
    } else {
      setTouched(false)
      rawX.set(0); rawY.set(0)
      if (heroMode) { tiltX.set(0); tiltY.set(0) }
    }
  }, [heroMode, rawX, rawY, tiltX, tiltY])

  useEffect(() => {
    if (!interactive) return
    window.addEventListener("mousemove", onMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMouseMove)
  }, [interactive, onMouseMove])

  const s     = size
  const r1    = s * 0.46
  const r2    = s * 0.36
  const r3    = s * 0.27
  const r4    = s * 0.19
  const r5    = s * 0.12
  const coreR = s * 0.07

  /* ── HERO MODE ─────────────────────────────────────────── */
  if (heroMode) {
    return (
      <div
        ref={wrapRef}
        className="relative flex items-center justify-center select-none hero-orb-float"
        style={{ width: s, height: s }}
        aria-hidden="true"
      >
        {/* Ambient halo */}
        <div
          className="absolute inset-0 rounded-full logo-halo"
          style={{ background: "radial-gradient(circle, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0.04) 50%, transparent 75%)" }}
        />
        {/* Pulse rings */}
        <div className="absolute rounded-full pulse-ring"
          style={{ width: s * 0.18, height: s * 0.18, background: "rgba(0,212,255,0.2)" }} />
        <div className="absolute rounded-full pulse-ring-delay"
          style={{ width: s * 0.18, height: s * 0.18, background: "rgba(0,212,255,0.12)" }} />

        {/* Orb — spring repulsion + 3D tilt via Motion */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            x: springX,
            y: springY,
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            perspective: 600,
          }}
        >
          {/* Ring 1 — slow CW, cyan dashes */}
          <svg className="absolute inset-0 ring-cw-1" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
            style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
            <circle cx={s/2} cy={s/2} r={r1} fill="none"
              stroke="rgba(0,212,255,0.38)" strokeWidth="1.4" strokeDasharray="6 5" />
            <circle cx={s/2} cy={s/2 - r1} r={s * 0.025} fill="#00d4ff" opacity="0.95" />
            <circle cx={s/2 + r1 * 0.866} cy={s/2 + r1 * 0.5} r={s * 0.018} fill="#00d4ff" opacity="0.6" />
          </svg>

          {/* Ring 2 — medium CCW, green dashes */}
          <svg className="absolute inset-0 ring-ccw-1" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
            style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
            <circle cx={s/2} cy={s/2} r={r2} fill="none"
              stroke="rgba(0,255,136,0.32)" strokeWidth="1.2" strokeDasharray="4 7" />
            <circle cx={s/2} cy={s/2 - r2} r={s * 0.02} fill="#00ff88" opacity="0.9" />
            <circle cx={s/2 - r2} cy={s/2} r={s * 0.016} fill="#00ff88" opacity="0.55" />
          </svg>

          {/* Ring 3 — faster CW, purple */}
          <svg className="absolute inset-0 ring-cw-2" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
            style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
            <circle cx={s/2} cy={s/2} r={r3} fill="none"
              stroke="rgba(168,85,247,0.35)" strokeWidth="1" strokeDasharray="3 6" />
            <circle cx={s/2} cy={s/2 - r3} r={s * 0.017} fill="#a855f7" opacity="0.85" />
          </svg>

          {/* Ring 4 — medium CCW, amber */}
          <svg className="absolute inset-0 ring-ccw-2" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
            style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
            <circle cx={s/2} cy={s/2} r={r4} fill="none"
              stroke="rgba(245,158,11,0.28)" strokeWidth="1" strokeDasharray="2 5" />
            <circle cx={s/2} cy={s/2 - r4} r={s * 0.014} fill="#f59e0b" opacity="0.8" />
          </svg>

          {/* Ring 5 — fast CW, solid cyan */}
          <svg className="absolute inset-0 ring-cw-3" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
            style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
            <circle cx={s/2} cy={s/2} r={r5} fill="none"
              stroke="rgba(0,212,255,0.55)" strokeWidth="1.5" />
            <circle cx={s/2} cy={s/2 - r5} r={s * 0.012} fill="#00d4ff" />
          </svg>

          {/* Pulsing core */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: coreR * 2, height: coreR * 2,
              background: "radial-gradient(circle, #ffffff 0%, #00d4ff 60%)",
              left: s/2 - coreR, top: s/2 - coreR,
            }}
            animate={{
              scale: [1, 1.35, 1],
              boxShadow: [
                "0 0 8px rgba(0,212,255,0.6)",
                "0 0 24px rgba(0,212,255,0.9)",
                "0 0 8px rgba(0,212,255,0.6)",
              ],
            }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          />
        </motion.div>
      </div>
    )
  }

  /* ── NAV / SMALL LOGO MODE ────────────────────────────── */
  return (
    <div
      ref={wrapRef}
      className="relative shrink-0 select-none"
      style={{ width: s, height: s }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: springX, y: springY }}
      >
        {/* Ring 1 */}
        <svg className="absolute inset-0 ring-cw-1" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
          style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
          <circle cx={s/2} cy={s/2} r={r1} fill="none"
            stroke="rgba(0,212,255,0.45)" strokeWidth="1.3" strokeDasharray="4 3" />
          <circle cx={s/2} cy={s/2 - r1} r={s * 0.09} fill="#00d4ff" opacity="0.95" />
        </svg>
        {/* Ring 2 */}
        <svg className="absolute inset-0 ring-ccw-1" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
          style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
          <circle cx={s/2} cy={s/2} r={r2} fill="none"
            stroke="rgba(0,255,136,0.35)" strokeWidth="1.1" strokeDasharray="3 5" />
          <circle cx={s/2} cy={s/2 - r2} r={s * 0.07} fill="#00ff88" opacity="0.85" />
        </svg>
        {/* Ring 3 */}
        <svg className="absolute inset-0 ring-cw-2" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
          style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
          <circle cx={s/2} cy={s/2} r={r3} fill="none"
            stroke="rgba(168,85,247,0.3)" strokeWidth="0.9" strokeDasharray="2 4" />
          <circle cx={s/2} cy={s/2 - r3} r={s * 0.055} fill="#a855f7" opacity="0.8" />
        </svg>
        {/* Ring 4 */}
        <svg className="absolute inset-0 ring-ccw-2" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
          style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
          <circle cx={s/2} cy={s/2} r={r4} fill="none"
            stroke="rgba(245,158,11,0.25)" strokeWidth="0.8" />
          <circle cx={s/2} cy={s/2 - r4} r={s * 0.045} fill="#f59e0b" opacity="0.75" />
        </svg>
        {/* Ring 5 */}
        <svg className="absolute inset-0 ring-cw-3" width={s} height={s} viewBox={`0 0 ${s} ${s}`}
          style={{ transformOrigin: `${s/2}px ${s/2}px` }}>
          <circle cx={s/2} cy={s/2} r={r5} fill="none"
            stroke="rgba(0,212,255,0.6)" strokeWidth="1.2" />
        </svg>
        {/* Core */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: coreR * 2, height: coreR * 2,
            left: s/2 - coreR, top: s/2 - coreR,
            background: "radial-gradient(circle, #ffffff 0%, #00d4ff 70%)",
          }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}

export default OmniLogo
