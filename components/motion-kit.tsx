"use client"
/**
 * OMNI Motion Kit — Extraordinary Animation Library
 * Built with motion/react (Motion for React)
 * Covers: spring, drag, enter/exit, gestures, keyframes, parallax,
 * path drawing, split text, tilt card, cursor trail, scroll velocity,
 * loading states, magnetic hover, smooth tabs, card stack & more.
 */
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useVelocity,
  useInView,
  AnimatePresence,
  MotionValue,
  easeOut,
  cubicBezier,
} from "motion/react"
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  CSSProperties,
} from "react"

/* ─────────────────────────────────────────────────────────────────────────
   VARIANTS LIBRARY — reusable motion variant sets
───────────────────────────────────────────────────────────────────────── */
export const variants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  },
  fadeLeft: {
    hidden:  { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0,  transition: { duration: 0.65, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  },
  fadeRight: {
    hidden:  { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  },
  scalePop: {
    hidden:  { opacity: 0, scale: 0.78 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } },
  },
  blurRise: {
    hidden:  { opacity: 0, filter: "blur(12px)", y: 20 },
    visible: { opacity: 1, filter: "none",        y: 0, transition: { duration: 0.7, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  },
  flipIn: {
    hidden:  { opacity: 0, rotateX: -30, y: 20 },
    visible: { opacity: 1, rotateX: 0,   y: 0, transition: { duration: 0.65, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  },
  slideReveal: {
    hidden:  { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    visible: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 0.7, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  },
  staggerContainer: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  },
  staggerItem: {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: cubicBezier(0.16, 1, 0.3, 1) } },
  },
}

/* ─────────────────────────────────────────────────────────────────────────
   1. FADE + ENTER ANIMATIONS — viewport-triggered
───────────────────────────────────────────────────────────────────────── */
interface RevealProps {
  children: ReactNode
  variant?: keyof typeof variants
  delay?: number
  className?: string
  once?: boolean
}
export function Reveal({ children, variant = "fadeUp", delay = 0, className, once = true }: RevealProps) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: "-60px 0px" })
  const v = variants[variant]
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={v}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   2. STAGGER GRID — children animate in with stagger
───────────────────────────────────────────────────────────────────────── */
interface StaggerGridProps {
  children: ReactNode
  className?: string
  stagger?: number
  variant?: keyof typeof variants
}
export function StaggerGrid({ children, className, stagger = 0.08, variant = "staggerItem" }: StaggerGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={variants.staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   3. SPLIT TEXT — each character/word animates independently
───────────────────────────────────────────────────────────────────────── */
interface SplitTextProps {
  text: string
  className?: string
  charClassName?: string
  stagger?: number
  delay?: number
  variant?: "chars" | "words"
  animVariant?: "fadeUp" | "blurRise" | "scalePop" | "flipIn"
}
export function SplitText({
  text, className, charClassName, stagger = 0.03, delay = 0,
  variant = "chars", animVariant = "blurRise",
}: SplitTextProps) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const parts  = variant === "words" ? text.split(" ") : text.split("")

  const charVariants = {
    hidden:  animVariant === "fadeUp"   ? { opacity: 0, y: 20 }
           : animVariant === "blurRise" ? { opacity: 0, filter: "blur(8px)", y: 12 }
           : animVariant === "scalePop" ? { opacity: 0, scale: 0.5 }
           : { opacity: 0, rotateX: -40, y: 16 },
    visible: (i: number) => ({
      opacity: 1, y: 0, filter: "none", scale: 1, rotateX: 0,
      transition: {
        delay: delay + i * stagger,
        duration: 0.55,
        ease: cubicBezier(0.16, 1, 0.3, 1),
      },
    }),
  }

  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: "inline-block" }}>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={charVariants}
          className={charClassName}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {part}{variant === "words" && i < parts.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   4. TILT CARD — 3D perspective tilt on hover with spring
───────────────────────────────────────────────────────────────────────── */
interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  glare?: boolean
}
export function TiltCard({ children, className, maxTilt = 12, glare = true }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springRotX = useSpring(rotX, { stiffness: 200, damping: 20, mass: 0.5 })
  const springRotY = useSpring(rotY, { stiffness: 200, damping: 20, mass: 0.5 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [hovered,  setHovered]  = useState(false)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const { left, top, width, height } = card.getBoundingClientRect()
    const x = (e.clientX - left) / width  - 0.5   // -0.5 to 0.5
    const y = (e.clientY - top)  / height - 0.5
    rotX.set(-y * maxTilt)
    rotY.set( x * maxTilt)
    setGlarePos({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 })
  }, [maxTilt, rotX, rotY])

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0); setHovered(false)
  }, [rotX, rotY])

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      {children}
      {glare && hovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
            opacity: hovered ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   5. MAGNETIC BUTTON — element chases cursor with spring
───────────────────────────────────────────────────────────────────────── */
interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}
export function MagneticButton({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x   = useMotionValue(0)
  const y   = useMotionValue(0)
  const sx  = useSpring(x, { stiffness: 260, damping: 20 })
  const sy  = useSpring(y, { stiffness: 260, damping: 20 })

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const cx = left + width / 2, cy = top + height / 2
    x.set((e.clientX - cx) * strength)
    y.set((e.clientY - cy) * strength)
  }, [strength, x, y])

  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   6. CURSOR TRAIL — glowing dots follow the cursor
───────────────────────────────────────────────────────────────────────── */
const TRAIL_COUNT = 12
export function CursorTrail() {
  const cursorX = useMotionValue(-200)
  const cursorY = useMotionValue(-200)
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([])
  const idRef  = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setTrail(prev => {
        const next = [{ x: e.clientX, y: e.clientY, id: idRef.current++ }, ...prev]
        return next.slice(0, TRAIL_COUNT)
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [cursorX, cursorY])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {/* Main cursor glow */}
      <motion.div
        className="absolute w-5 h-5 rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.8) 0%, rgba(0,212,255,0) 70%)",
          filter: "blur(2px)",
        }}
      />
      {/* Trail dots */}
      <AnimatePresence>
        {trail.map((dot, i) => (
          <motion.div
            key={dot.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="absolute rounded-full"
            style={{
              left: dot.x,
              top:  dot.y,
              translateX: "-50%",
              translateY: "-50%",
              width:  Math.max(2, 8 - i * 0.5),
              height: Math.max(2, 8 - i * 0.5),
              background: i % 3 === 0 ? "#00d4ff" : i % 3 === 1 ? "#00ff88" : "#a855f7",
              boxShadow: `0 0 ${6 - i * 0.4}px currentColor`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   7. PARALLAX SECTION — scrollY-driven depth layers
───────────────────────────────────────────────────────────────────────── */
interface ParallaxProps {
  children: ReactNode
  speed?: number       // negative = upward parallax
  className?: string
}
export function ParallaxLayer({ children, speed = -0.3, className }: ParallaxProps) {
  const ref  = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`])
  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   8. SCROLL PROGRESS BAR — top of page
───────────────────────────────────────────────────────────────────────── */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #00d4ff, #00ff88, #a855f7)",
        boxShadow: "0 0 10px rgba(0,212,255,0.8)",
      }}
      aria-hidden="true"
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   9. SCROLL VELOCITY MARQUEE — text speed driven by scroll velocity
───────────────────────────────────────────────────────────────────────── */
interface VelocityMarqueeProps {
  items: string[]
  baseSpeed?: number
  className?: string
  itemClassName?: string
}
export function VelocityMarquee({ items, baseSpeed = 3, className, itemClassName }: VelocityMarqueeProps) {
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 50, damping: 20 })
  const velocityFactor = useTransform(smoothVelocity, [-3000, 0, 3000], [-3, 1, 3])

  const x = useMotionValue(0)
  const dirFactor = useRef(1)
  const rafRef    = useRef<number>()

  useEffect(() => {
    let lastTime: number | null = null
    const tick = (t: number) => {
      if (lastTime !== null) {
        const delta  = (t - lastTime) / 1000
        const vel    = velocityFactor.get()
        if (vel < 0)  dirFactor.current = -1
        if (vel >= 0) dirFactor.current = 1
        const moveBy = dirFactor.current * baseSpeed * delta * (1 + Math.abs(vel) * 0.5)
        x.set(x.get() - moveBy * 100)
      }
      lastTime = t
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [baseSpeed, velocityFactor, x])

  const xWrapped = useTransform(x, v => `${v % -50}%`)

  return (
    <div className={`overflow-hidden ${className ?? ""}`} aria-hidden="true">
      <motion.div
        className="flex whitespace-nowrap"
        style={{ x: xWrapped }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className={`inline-flex items-center gap-3 px-5 ${itemClassName ?? "text-[#1e293b] text-sm font-mono"}`}>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   10. SVG PATH DRAWING — stroke-dashoffset reveal on scroll
───────────────────────────────────────────────────────────────────────── */
interface PathDrawProps {
  d: string
  stroke?: string
  strokeWidth?: number
  viewBox?: string
  className?: string
  width?: number
  height?: number
}
export function PathDraw({ d, stroke = "#00d4ff", strokeWidth = 2, viewBox = "0 0 200 200", className, width = 200, height = 200 }: PathDrawProps) {
  const ref    = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px 0px" })
  return (
    <svg ref={ref} viewBox={viewBox} width={width} height={height} className={className} aria-hidden="true">
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, ease: cubicBezier(0.16, 1, 0.3, 1) }}
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   11. LOADING — Circle Spinner, Jumping Dots, Ripple, Pulse Dots, Progress
───────────────────────────────────────────────────────────────────────── */
export function LoadingSpinner({ size = 40, color = "#00d4ff" }: { size?: number; color?: string }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 40 40" aria-label="Loading">
      <motion.circle
        cx="20" cy="20" r="16"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0 1"
        animate={{ rotate: 360, strokeDasharray: ["0.01 2", "1 1.5", "0.01 2"] }}
        transition={{ rotate: { duration: 1.2, ease: "linear", repeat: Infinity },
                      strokeDasharray: { duration: 1.2, ease: "linear", repeat: Infinity } }}
        style={{ pathLength: 0.8 }}
      />
    </motion.svg>
  )
}

export function JumpingDots({ color = "#00d4ff" }: { color?: string }) {
  const dots = [0, 1, 2]
  return (
    <div className="flex items-center gap-1.5" aria-label="Loading">
      {dots.map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export function RippleLoader({ color = "#00d4ff" }: { color?: string }) {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center" aria-label="Loading">
      {[0, 1].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{ borderColor: color, width: 48, height: 48 }}
          animate={{ scale: [0.3, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 1.4, ease: "easeOut", repeat: Infinity, delay: i * 0.7 }}
        />
      ))}
      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
    </div>
  )
}

export function PulseDots({ color = "#00d4ff" }: { color?: string }) {
  return (
    <div className="flex items-center gap-2" aria-label="Loading">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export function LoadingProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full origin-left"
        style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)", boxShadow: "0 0 8px rgba(0,212,255,0.6)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={{ duration: 0.4, ease: cubicBezier(0.16, 1, 0.3, 1) }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   12. HOLD TO CONFIRM — hold button, progress fills, then fires
───────────────────────────────────────────────────────────────────────── */
interface HoldConfirmProps {
  onConfirm: () => void
  children: ReactNode
  holdMs?: number
  className?: string
}
export function HoldToConfirm({ onConfirm, children, holdMs = 1500, className }: HoldConfirmProps) {
  const [progress, setProgress] = useState(0)
  const [holding,  setHolding]  = useState(false)
  const [done,     setDone]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startHold = useCallback(() => {
    if (done) return
    setHolding(true)
    const step = 100 / (holdMs / 16)
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p + step >= 100) {
          clearInterval(intervalRef.current!)
          setDone(true)
          onConfirm()
          return 100
        }
        return p + step
      })
    }, 16)
  }, [done, holdMs, onConfirm])

  const stopHold = useCallback(() => {
    if (done) return
    setHolding(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setProgress(0)
  }, [done])

  return (
    <motion.button
      className={`relative overflow-hidden select-none ${className ?? ""}`}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      whileTap={{ scale: 0.97 }}
      animate={done ? { scale: [1, 1.05, 1] } : {}}
    >
      <motion.div
        className="absolute inset-0 origin-left"
        style={{ background: "rgba(0,212,255,0.2)" }}
        animate={{ scaleX: progress / 100 }}
        transition={{ duration: 0 }}
        aria-hidden="true"
      />
      <span className="relative z-10 flex items-center gap-2">
        {done ? "Confirmed!" : holding ? `Hold… ${Math.round(progress)}%` : children}
      </span>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   13. SMOOTH TABS — animated underline indicator
───────────────────────────────────────────────────────────────────────── */
interface TabItem { id: string; label: string }
interface SmoothTabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}
export function SmoothTabs({ tabs, activeId, onChange, className }: SmoothTabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [underline, setUnderline] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const el = tabRefs.current[activeId]
    if (el) {
      const parent = el.parentElement!.getBoundingClientRect()
      const rect   = el.getBoundingClientRect()
      setUnderline({ left: rect.left - parent.left, width: rect.width })
    }
  }, [activeId])

  return (
    <div className={`relative flex items-center gap-0 ${className ?? ""}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          ref={el => { tabRefs.current[tab.id] = el }}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 rounded-lg ${
            activeId === tab.id ? "text-[#00d4ff]" : "text-[#64748b] hover:text-[#e2e8f0]"
          }`}
        >
          {tab.label}
        </button>
      ))}
      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 h-[2px] rounded-full"
        style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
        animate={{ left: underline.left, width: underline.width }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        aria-hidden="true"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   14. DRAG CARD — draggable with inertia + spring snap
───────────────────────────────────────────────────────────────────────── */
interface DragCardProps {
  children: ReactNode
  className?: string
  constraintRef?: React.RefObject<HTMLElement>
}
export function DragCard({ children, className, constraintRef }: DragCardProps) {
  return (
    <motion.div
      drag
      dragConstraints={constraintRef ?? { top: -50, left: -50, right: 50, bottom: 50 }}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      whileDrag={{ scale: 1.04, cursor: "grabbing", zIndex: 10 }}
      whileHover={{ cursor: "grab" }}
      className={`cursor-grab active:cursor-grabbing ${className ?? ""}`}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   15. CARD STACK — iOS-style stacked cards with AnimatePresence
───────────────────────────────────────────────────────────────────────── */
interface CardStackProps {
  cards: { id: string | number; content: ReactNode }[]
}
export function CardStack({ cards }: CardStackProps) {
  const [stack, setStack] = useState(cards)

  const dismissTop = useCallback(() => {
    setStack(s => s.slice(1))
  }, [])

  return (
    <div className="relative" style={{ height: 200 }}>
      <AnimatePresence>
        {stack.slice(0, 4).map((card, i) => (
          <motion.div
            key={card.id}
            className="absolute inset-0 rounded-2xl border border-white/10 bg-[#0d1117]"
            initial={{ scale: 1 - i * 0.04, y: i * 10, opacity: i < 3 ? 1 : 0, zIndex: stack.length - i }}
            animate={{ scale: 1 - i * 0.04, y: i * 10, zIndex: stack.length - i }}
            exit={{ x: "110%", opacity: 0, rotate: 12, transition: { duration: 0.35, ease: cubicBezier(0.16, 1, 0.3, 1) } }}
            drag={i === 0 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 80) dismissTop()
            }}
            style={{ zIndex: stack.length - i }}
          >
            {card.content}
          </motion.div>
        ))}
      </AnimatePresence>
      {stack.length > 1 && (
        <button
          onClick={dismissTop}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-[#475569] hover:text-[#00d4ff] transition-colors"
        >
          Swipe next →
        </button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   16. SCROLL ZOOM HERO — section zooms in as you scroll into view
───────────────────────────────────────────────────────────────────────── */
interface ScrollZoomProps {
  children: ReactNode
  className?: string
}
export function ScrollZoomHero({ children, className }: ScrollZoomProps) {
  const ref  = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const scale   = useTransform(scrollYProgress, [0, 0.4], [0.9, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1])
  const y       = useTransform(scrollYProgress, [0, 0.4], [40, 0])
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ scale, opacity, y }}>{children}</motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   17. APPLE INTELLIGENCE RIPPLE — radial glow expanding ripple
───────────────────────────────────────────────────────────────────────── */
export function IntelligenceRipple({ className }: { className?: string }) {
  const rings = [0, 1, 2, 3]
  return (
    <div className={`relative flex items-center justify-center ${className ?? ""}`} aria-hidden="true">
      {rings.map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background: `conic-gradient(from ${i * 90}deg, #00d4ff, #00ff88, #a855f7, #00d4ff)`,
            opacity: 0.15 - i * 0.02,
          }}
          animate={{
            width:  [40 + i * 40, 80 + i * 60, 40 + i * 40],
            height: [40 + i * 40, 80 + i * 60, 40 + i * 40],
            opacity:[0.15, 0.05, 0.15],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3 + i * 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.4,
            rotate: { duration: 6 + i, ease: "linear", repeat: Infinity },
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   18. FLOATING TARGET CURSOR — large circle follows cursor with lag
───────────────────────────────────────────────────────────────────────── */
export function FloatingCursorTarget() {
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const x = useSpring(mouseX, { stiffness: 80, damping: 18 })
  const y = useSpring(mouseY, { stiffness: 80, damping: 18 })

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener("mousemove", move, { passive: true })
    return () => window.removeEventListener("mousemove", move)
  }, [mouseX, mouseY])

  return (
    <motion.div
      className="fixed pointer-events-none z-[9990] rounded-full"
      style={{
        x, y,
        translateX: "-50%",
        translateY: "-50%",
        width: 42,
        height: 42,
        border: "1.5px solid rgba(0,212,255,0.5)",
        background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
      }}
      aria-hidden="true"
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   19. SPINNING 3D CUBE
───────────────────────────────────────────────────────────────────────── */
export function SpinningCube({ size = 60, color = "#00d4ff" }: { size?: number; color?: string }) {
  return (
    <div style={{ perspective: 600, width: size, height: size }} aria-hidden="true">
      <motion.div
        style={{
          width: size, height: size,
          transformStyle: "preserve-3d",
          position: "relative",
        }}
        animate={{ rotateY: 360, rotateX: 20 }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      >
        {(["front","back","left","right","top","bottom"] as const).map((face, i) => {
          const transforms: Record<string, string> = {
            front:  `translateZ(${size/2}px)`,
            back:   `translateZ(-${size/2}px) rotateY(180deg)`,
            left:   `translateX(-${size/2}px) rotateY(-90deg)`,
            right:  `translateX(${size/2}px) rotateY(90deg)`,
            top:    `translateY(-${size/2}px) rotateX(90deg)`,
            bottom: `translateY(${size/2}px) rotateX(-90deg)`,
          }
          return (
            <div
              key={face}
              style={{
                position: "absolute",
                width: size, height: size,
                border: `1px solid ${color}`,
                background: `${color}${i % 2 ? "08" : "04"}`,
                transform: transforms[face],
                backfaceVisibility: "hidden",
              }}
            />
          )
        })}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   20. MULTI-STATE BADGE — AnimatePresence between states
───────────────────────────────────────────────────────────────────────── */
type BadgeState = "idle" | "loading" | "success" | "error"
interface MultiStateBadgeProps {
  state: BadgeState
  className?: string
}
const BADGE_CONFIG: Record<BadgeState, { label: string; color: string; bg: string }> = {
  idle:    { label: "Ready",      color: "#64748b", bg: "rgba(255,255,255,0.06)" },
  loading: { label: "Processing", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  success: { label: "Complete",   color: "#00ff88", bg: "rgba(0,255,136,0.1)" },
  error:   { label: "Failed",     color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
}
export function MultiStateBadge({ state, className }: MultiStateBadgeProps) {
  const cfg = BADGE_CONFIG[state]
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={state}
        initial={{ opacity: 0, y: -8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={   { opacity: 0, y:  8, scale: 0.9 }}
        transition={{ duration: 0.22, ease: cubicBezier(0.16, 1, 0.3, 1) }}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${className ?? ""}`}
        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}
      >
        {state === "loading" && (
          <motion.span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: cfg.color }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
        {state === "success" && <span className="text-[10px]">✓</span>}
        {state === "error"   && <span className="text-[10px]">✕</span>}
        {cfg.label}
      </motion.span>
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   21. SCROLL IMAGE REVEAL — clip-path wipe reveal on scroll
───────────────────────────────────────────────────────────────────────── */
interface ScrollImageRevealProps {
  src: string
  alt: string
  className?: string
}
export function ScrollImageReveal({ src, alt, className }: ScrollImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.2"] })
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  )
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1])
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ clipPath }}>
        <motion.img src={src} alt={alt} className="w-full h-full object-cover" style={{ scale }} />
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   22. LAYOUT ANIMATION ACCORDION
───────────────────────────────────────────────────────────────────────── */
interface AccordionItem { id: string; title: string; content: ReactNode }
interface MotionAccordionProps {
  items: AccordionItem[]
  className?: string
}
export function MotionAccordion({ items, className }: MotionAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <motion.div layout className={`flex flex-col gap-2 ${className ?? ""}`}>
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          className="rounded-xl border border-white/[0.07] bg-[#0d1117] overflow-hidden"
        >
          <motion.button
            layout="position"
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-[#e2e8f0] font-semibold text-sm">{item.title}</span>
            <motion.span
              animate={{ rotate: openId === item.id ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-[#475569] text-xs"
            >
              ▼
            </motion.span>
          </motion.button>
          <AnimatePresence initial={false}>
            {openId === item.id && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={  { height: 0, opacity: 0 }}
                transition={{ height: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              >
                <div className="px-5 pb-5 text-[#64748b] text-sm leading-relaxed border-t border-white/[0.05] pt-4">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   23. FILL TEXT — text fills with color on scroll
───────────────────────────────────────────────────────────────────────── */
interface FillTextProps {
  text: string
  className?: string
  fillColor?: string
}
export function FillText({ text, className, fillColor = "#00d4ff" }: FillTextProps) {
  const ref  = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.2"] })
  const chars = text.split("")
  return (
    <div ref={ref} className={`inline-block ${className ?? ""}`} aria-label={text}>
      {chars.map((char, i) => {
        const start = i / chars.length
        const end   = (i + 1) / chars.length
        const color = useTransform(scrollYProgress, [start, end], ["#1e293b", fillColor])
        return (
          <motion.span key={i} style={{ color, display: "inline-block", whiteSpace: "pre" }}>
            {char}
          </motion.span>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   24. SCROLL DIRECTION: HIDE HEADER hook
───────────────────────────────────────────────────────────────────────── */
export function useHideOnScroll(threshold = 80) {
  const [hidden, setHidden] = useState(false)
  const prevY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const cur = window.scrollY
      setHidden(cur > threshold && cur > prevY.current)
      prevY.current = cur
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return hidden
}

/* ─────────────────────────────────────────────────────────────────────────
   25. KEYFRAME / PATH MORPHING PATH
───────────────────────────────────────────────────────────────────────── */
export function MorphingPath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} aria-hidden="true">
      <motion.path
        fill="none"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          d: [
            "M 0 40 C 50 10, 100 70, 150 40 S 200 10, 200 40",
            "M 0 40 C 50 70, 100 10, 150 40 S 200 70, 200 40",
            "M 0 40 C 50 10, 100 70, 150 40 S 200 10, 200 40",
          ],
        }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   26. NOTIFICATION STACK — iOS-style stacking notifications
───────────────────────────────────────────────────────────────────────── */
interface Notification { id: number; title: string; body: string }
interface NotificationStackProps {
  notifications: Notification[]
  onDismiss: (id: number) => void
}
export function NotificationStack({ notifications, onDismiss }: NotificationStackProps) {
  return (
    <div className="relative" style={{ height: Math.min(notifications.length, 4) * 10 + 72 }}>
      <AnimatePresence>
        {notifications.slice(0, 4).map((n, i) => (
          <motion.div
            key={n.id}
            className="absolute left-0 right-0 rounded-2xl bg-[#0d1117]/95 backdrop-blur border border-white/10 px-4 py-3"
            style={{ zIndex: notifications.length - i }}
            initial={{ opacity: 0, y: -32, scale: 0.9 }}
            animate={{
              opacity: i === 0 ? 1 : 0.7 - i * 0.1,
              y: i * 10,
              scale: 1 - i * 0.03,
            }}
            exit={{ opacity: 0, x: 120, transition: { duration: 0.3 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => { if (info.offset.x > 60) onDismiss(n.id) }}
            onClick={() => i === 0 && onDismiss(n.id)}
          >
            <div className="font-semibold text-sm text-[#e2e8f0] mb-0.5">{n.title}</div>
            <div className="text-xs text-[#64748b]">{n.body}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   27. KEYFRAME WILDCARD — animate through random target values
───────────────────────────────────────────────────────────────────────── */
export function KeyframeOrb({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      className="rounded-full"
      style={{ width: size, height: size, background: "#00d4ff" }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 15, -8, 0],
        scale: [1, 1.3, 0.8, 1.1, 1],
        background: ["#00d4ff", "#00ff88", "#a855f7", "#f59e0b", "#00d4ff"],
        borderRadius: ["50%", "20%", "50%", "30%", "50%"],
      }}
      transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
      aria-hidden="true"
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   28. FOLLOW POINTER WITH SPRING — element follows mouse with spring
───────────────────────────────────────────────────────────────────────── */
export function SpringFollowPointer({ children, className }: { children: ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 120, damping: 14 })
  const sy = useSpring(y, { stiffness: 120, damping: 14 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const { left, top } = el.getBoundingClientRect()
      x.set(e.clientX - left)
      y.set(e.clientY - top)
    }
    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [x, y])

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <motion.div style={{ x: sx, y: sy, position: "absolute", translateX: "-50%", translateY: "-50%" }} aria-hidden="true">
        {children}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   29. MATERIAL DESIGN RIPPLE — ink ripple on click, origin at click point
───────────────────────────────────────────────────────────────────────── */
interface RippleInstance { id: number; x: number; y: number }
export function MaterialRipple({ children, className, color = "rgba(0,212,255,0.25)" }: {
  children: ReactNode; className?: string; color?: string
}) {
  const [ripples, setRipples] = useState<RippleInstance[]>([])
  const idRef = useRef(0)

  const addRipple = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = idRef.current++
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700)
  }, [])

  return (
    <div
      className={`relative overflow-hidden select-none ${className ?? ""}`}
      onMouseDown={addRipple}
      role="button"
      tabIndex={0}
    >
      {children}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span
            key={r.id}
            className="absolute rounded-full pointer-events-none"
            style={{ left: r.x, top: r.y, translateX: "-50%", translateY: "-50%", background: color }}
            initial={{ width: 0, height: 0, opacity: 0.7 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
            aria-hidden="true"
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   30. MOTION ALONG A PATH — SVG path follower animation
───────────────────────────────────────────────────────────────────────── */
export function MotionAlongPath({ pathD, className }: { pathD?: string; className?: string }) {
  const defaultPath = "M 20 60 C 60 10, 140 110, 180 60"
  const d = pathD ?? defaultPath
  return (
    <svg viewBox="0 0 200 80" className={className ?? "w-full"} aria-hidden="true">
      {/* The track */}
      <path d={d} fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Animated dot */}
      <motion.circle r="5" fill="#00d4ff"
        filter="url(#glow-path)"
        style={{ offsetPath: `path("${d}")` } as CSSProperties}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
      {/* Green trailing dot */}
      <motion.circle r="3" fill="#00ff88" opacity={0.7}
        style={{ offsetPath: `path("${d}")` } as CSSProperties}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 0.18 }}
      />
      <defs>
        <filter id="glow-path" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   31. CURSOR TRAIL WITH VELOCITY — trail size scales with speed
───────────────────────────────────────────────────────────────────────── */
interface VelocityTrailDot { x: number; y: number; id: number; size: number; color: string }
export function VelocityTrail() {
  const [dots, setDots] = useState<VelocityTrailDot[]>([])
  const lastPos = useRef({ x: 0, y: 0, t: 0 })
  const idRef   = useRef(0)
  const COLORS  = ["#00d4ff", "#00ff88", "#a855f7", "#f59e0b"]

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now()
      const dt  = Math.max(1, now - lastPos.current.t)
      const dx  = e.clientX - lastPos.current.x
      const dy  = e.clientY - lastPos.current.y
      const vel = Math.hypot(dx, dy) / dt          // px/ms
      const sz  = Math.min(22, 3 + vel * 3.5)     // size grows with velocity
      lastPos.current = { x: e.clientX, y: e.clientY, t: now }
      const id    = idRef.current++
      const color = COLORS[id % COLORS.length]
      setDots(prev => [...prev.slice(-14), { x: e.clientX, y: e.clientY, id, size: sz, color }])
      setTimeout(() => setDots(prev => prev.filter(d => d.id !== id)), 500)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden="true">
      <AnimatePresence>
        {dots.map(d => (
          <motion.div
            key={d.id}
            className="absolute rounded-full"
            style={{ left: d.x, top: d.y, translateX: "-50%", translateY: "-50%",
              background: d.color, width: d.size, height: d.size,
              boxShadow: `0 0 ${d.size * 1.5}px ${d.color}` }}
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   32. IMAGE REVEAL SLIDER — drag to reveal before/after
───────────────────────────────────────────────────────────────────────── */
interface ImageRevealSliderProps {
  before: string; beforeAlt: string
  after:  string; afterAlt:  string
  className?: string
}
export function ImageRevealSlider({ before, beforeAlt, after, afterAlt, className }: ImageRevealSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(50)
  const [dragging, setDragging] = useState(false)

  const update = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    setPct(Math.max(2, Math.min(98, ((clientX - left) / width) * 100)))
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none cursor-ew-resize rounded-2xl ${className ?? ""}`}
      onMouseMove={e => dragging && update(e.clientX)}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchMove={e => update(e.touches[0].clientX)}
      role="slider"
      aria-label="Image comparison slider"
      aria-valuenow={Math.round(pct)}
    >
      {/* After image (full) */}
      <img src={after}  alt={afterAlt}  className="w-full h-full object-cover block" />
      {/* Before image (clipped left) */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        animate={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        transition={{ type: "spring", stiffness: 600, damping: 40 }}
      >
        <img src={before} alt={beforeAlt} className="w-full h-full object-cover" />
      </motion.div>
      {/* Handle */}
      <motion.div
        className="absolute top-0 bottom-0 flex items-center justify-center"
        animate={{ left: `${pct}%` }}
        transition={{ type: "spring", stiffness: 600, damping: 40 }}
        style={{ translateX: "-50%" }}
      >
        <div
          className="w-0.5 h-full bg-white/40 absolute"
          aria-hidden="true"
        />
        <div
          className="relative z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xl cursor-ew-resize"
          onMouseDown={() => setDragging(true)}
          onTouchStart={() => setDragging(true)}
        >
          <svg className="w-4 h-4 text-[#080b12]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.47 4.22a.75.75 0 0 1 0 1.06L4.81 9h14.38l-3.66-3.72a.75.75 0 1 1 1.06-1.06l5 5.08a.75.75 0 0 1 0 1.06l-5 5.08a.75.75 0 1 1-1.06-1.06L19.19 10.5H4.81l3.66 3.72a.75.75 0 1 1-1.06 1.06l-5-5.08a.75.75 0 0 1 0-1.06l5-5.08a.75.75 0 0 1 1.06 0z"/>
          </svg>
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   33. INFINITE LOADING — items load as you scroll to bottom
───────────────────────────────────────────────────────────────────────── */
interface InfiniteLoadingProps {
  initialItems: ReactNode[]
  loadMore: () => Promise<ReactNode[]>
  className?: string
}
export function InfiniteLoading({ initialItems, loadMore, className }: InfiniteLoadingProps) {
  const [items, setItems] = useState(initialItems)
  const [fetching, setFetching] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const io = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting && !fetching) {
        setFetching(true)
        const more = await loadMore()
        setItems(prev => [...prev, ...more])
        setFetching(false)
      }
    }, { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [fetching, loadMore])

  return (
    <div className={className}>
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: cubicBezier(0.16, 1, 0.3, 1) }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={loaderRef} className="flex justify-center py-4">
        {fetching && <LoadingSpinner size={28} />}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   34. iOS SLIDER — momentum-based range input with spring
───────────────────────────────────────────────────────────────────────── */
interface iOSSliderProps {
  value: number
  onChange: (v: number) => void
  min?: number; max?: number
  color?: string
  className?: string
}
export function IOSSlider({ value, onChange, min = 0, max = 100, color = "#00d4ff", className }: iOSSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const springVal = useMotionValue(value)
  const smoothVal = useSpring(springVal, { stiffness: 400, damping: 30 })

  const update = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    const raw = Math.max(min, Math.min(max, ((clientX - left) / width) * (max - min) + min))
    springVal.set(raw)
    onChange(raw)
  }, [min, max, onChange, springVal])

  const widthPct = useTransform(smoothVal, [min, max], ["0%", "100%"])
  const leftPct  = useTransform(smoothVal, [min, max], ["0%", "100%"])

  return (
    <div
      ref={trackRef}
      className={`relative h-8 flex items-center cursor-pointer ${className ?? ""}`}
      onMouseDown={e => { dragging.current = true; update(e.clientX) }}
      onMouseMove={e => dragging.current && update(e.clientX)}
      onMouseUp={() => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onTouchStart={e => update(e.touches[0].clientX)}
      onTouchMove={e => update(e.touches[0].clientX)}
      role="slider"
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
    >
      {/* Track */}
      <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10" />
      {/* Fill */}
      <motion.div
        className="absolute left-0 h-1.5 rounded-full"
        style={{ width: widthPct, background: color, boxShadow: `0 0 8px ${color}80` }}
      />
      {/* Thumb */}
      <motion.div
        className="absolute w-6 h-6 rounded-full shadow-xl flex items-center justify-center"
        style={{ left: leftPct, translateX: "-50%", background: "white" }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 1.25 }}
      >
        <div className="w-1 h-3 rounded-full bg-gray-300" />
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   35. MAGNETIC FILINGS — particles rush to cursor like iron filings
───────────────────────────────────────────────────────────────────────── */
interface FilingParticle { id: number; bx: number; by: number }
export function MagneticFilings({ count = 30, className }: { count?: number; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState({ x: -999, y: -999 })
  const particles = useRef<FilingParticle[]>(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      bx: Math.random() * 100,
      by: Math.random() * 100,
    }))
  ).current

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    setCursor({ x: e.clientX - left, y: e.clientY - top })
  }, [])

  const onLeave = useCallback(() => setCursor({ x: -999, y: -999 }), [])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl ${className ?? ""}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden="true"
    >
      {particles.map(p => {
        const { x: cx, y: cy } = cursor
        const ex = (p.bx / 100) * 100  // base x as % converted to relative
        const ey = (p.by / 100) * 100
        return (
          <motion.div
            key={p.id}
            className="absolute w-1 h-3 rounded-full"
            style={{
              left: `${p.bx}%`,
              top:  `${p.by}%`,
              background: p.id % 3 === 0 ? "#00d4ff" : p.id % 3 === 1 ? "#00ff88" : "#a855f7",
              opacity: 0.6,
            }}
            animate={{
              rotate: cx > -900
                ? Math.atan2(cy - ey, cx - ex) * (180 / Math.PI) + 90
                : p.id * 37,
              scale: cx > -900 ? 1.4 : 1,
              opacity: cx > -900 ? 1 : 0.45,
            }}
            transition={{ type: "spring", stiffness: 180, damping: 12 }}
          />
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   36. LOADING OVERLAY — full-screen overlay with animated logo
───────────────────────────────────────────────────────────────────────── */
interface LoadingOverlayProps {
  visible: boolean
  message?: string
}
export function LoadingOverlay({ visible, message = "Loading…" }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#080b12]/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          {/* Conic spinner ring */}
          <motion.div
            className="w-16 h-16 rounded-full mb-6"
            style={{ background: "conic-gradient(from 0deg, transparent 60%, #00d4ff 100%)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
          <motion.p
            className="text-[#64748b] text-sm font-mono tracking-widest"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   37. SCROLL VELOCITY 3D PLANES — cards tilt on scroll velocity
───────────────────────────────────────────────────────────────────────── */
interface PlaneItem { label: string; color: string }
export function ScrollVelocity3DPlanes({ items }: { items: PlaneItem[] }) {
  const { scrollY } = useScroll()
  const rawVel      = useVelocity(scrollY)
  const vel         = useSpring(rawVel, { stiffness: 60, damping: 15 })
  const rotateX     = useTransform(vel, [-2000, 0, 2000], [18, 0, -18])
  const skewY       = useTransform(vel, [-2000, 0, 2000], [-6, 0, 6])

  return (
    <div className="flex flex-col gap-3" style={{ perspective: 800 }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          style={{
            rotateX,
            skewY,
            transformStyle: "preserve-3d" as const,
            borderColor: `${item.color}25`,
            background: `${item.color}08`,
            color: item.color,
          }}
          className="rounded-xl px-5 py-3 border text-sm font-mono font-semibold"
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          transition={{ delay: i * 0.04 }}
          aria-label={item.label}
        >
          {item.label}
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   38. iOS APP STORE CARD — expand to full-screen detail view
───────────────────────────────────────────────────────────────────────── */
interface AppStoreCardProps {
  id: string
  title: string
  subtitle: string
  color: string
  icon: ReactNode
}
export function AppStoreCard({ id, title, subtitle, color, icon }: AppStoreCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        layoutId={`card-${id}`}
        onClick={() => setExpanded(true)}
        className="rounded-2xl overflow-hidden cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`, border: `1px solid ${color}25` }}
        whileHover={{ scale: expanded ? 1 : 1.02, y: expanded ? 0 : -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <div className="p-5 flex items-center gap-4">
          <motion.div layoutId={`icon-${id}`} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
            {icon}
          </motion.div>
          <div>
            <motion.h3 layoutId={`title-${id}`} className="text-[#e2e8f0] font-bold text-sm">{title}</motion.h3>
            <motion.p layoutId={`sub-${id}`} className="text-[#64748b] text-xs mt-0.5">{subtitle}</motion.p>
          </div>
        </div>
      </motion.div>

      {/* Expanded sheet */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            layoutId={`card-${id}`}
            className="fixed inset-x-4 top-[10%] bottom-[10%] z-[9001] rounded-3xl overflow-hidden"
            style={{ background: "#0d1117", border: `1px solid ${color}30` }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <motion.div layoutId={`icon-${id}`} className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  {icon}
                </motion.div>
                <div>
                  <motion.h2 layoutId={`title-${id}`} className="text-[#e2e8f0] font-bold text-xl">{title}</motion.h2>
                  <motion.p layoutId={`sub-${id}`} className="text-[#64748b] text-sm mt-0.5">{subtitle}</motion.p>
                </div>
                <button
                  className="ml-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#64748b] hover:text-white transition-colors"
                  onClick={() => setExpanded(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[#64748b] text-sm leading-relaxed"
              >
                <p className="mb-3">This OMNI module implements the full {title} subsystem with zero-copy semantics across language boundaries.</p>
                <p className="mb-3">Built with Rust for the hot path, Go for async I/O, and TypeScript for the type-safe API layer.</p>
                <div className="flex gap-2 mt-5 flex-wrap">
                  {["Install", "Docs", "Source"].map(a => (
                    <motion.button
                      key={a}
                      className="px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                      whileHover={{ scale: 1.05, background: `${color}25` }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   39. SWIPE ACTIONS — swipe left to reveal action buttons (iOS-style)
───────────────────────────────────────────────────────────────────────── */
interface SwipeActionProps {
  children: ReactNode
  actions?: Array<{ label: string; color: string; icon?: ReactNode; onAction: () => void }>
  className?: string
}
export function SwipeActions({ children, actions = [], className }: SwipeActionProps) {
  const x = useMotionValue(0)
  const actionWidth = actions.length * 80
  const bg = useTransform(x, [-actionWidth, 0], ["rgba(239,68,68,0.15)", "rgba(0,0,0,0)"])

  return (
    <div className={`relative overflow-hidden rounded-xl ${className ?? ""}`} style={{ background: "#0d1117" }}>
      {/* Action layer */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch" aria-hidden="true">
        {actions.map(a => (
          <motion.button
            key={a.label}
            className="flex flex-col items-center justify-center px-5 text-xs font-semibold gap-1"
            style={{ background: a.color, color: "white", minWidth: 80 }}
            onClick={a.onAction}
            whileTap={{ scale: 0.95 }}
          >
            {a.icon}
            {a.label}
          </motion.button>
        ))}
      </div>
      {/* Draggable content */}
      <motion.div
        style={{ x, background: bg }}
        drag="x"
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={0.08}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   40. iOS APP FOLDER — grid of icons that collapse into a folder on click
───────────────────────────────────────────────────────────────────────── */
interface FolderApp { id: string; icon: string; color: string; label: string }
interface IOSFolderProps { apps: FolderApp[]; folderName?: string }
export function IOSAppFolder({ apps, folderName = "OMNI" }: IOSFolderProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="inline-block">
      <AnimatePresence mode="wait">
        {!open ? (
          /* Closed folder — mini icon grid */
          <motion.div
            key="closed"
            className="w-20 h-20 rounded-[22%] cursor-pointer flex flex-col items-center gap-1.5 group"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => setOpen(true)}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <div className="grid grid-cols-3 gap-0.5 p-2 pt-3 w-full">
              {apps.slice(0, 9).map((app, i) => (
                <motion.div
                  key={app.id}
                  className="aspect-square rounded-md flex items-center justify-center text-[8px]"
                  style={{ background: app.color + "33" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 22 }}
                >
                  {app.icon}
                </motion.div>
              ))}
            </div>
            <span className="text-[10px] text-[#94a3b8] font-medium pb-1">{folderName}</span>
          </motion.div>
        ) : (
          /* Open folder — expanded grid */
          <motion.div
            key="open"
            className="rounded-3xl p-4 cursor-pointer"
            style={{ background: "rgba(13,17,23,0.97)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 240 }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#e2e8f0] font-bold text-sm">{folderName}</span>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#64748b] text-xs hover:text-white"
                aria-label="Close folder"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {apps.map((app, i) => (
                <motion.div
                  key={app.id}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 22 }}
                >
                  <div
                    className="w-12 h-12 rounded-[22%] flex items-center justify-center text-xl"
                    style={{ background: app.color + "22", border: `1px solid ${app.color}30` }}
                  >
                    {app.icon}
                  </div>
                  <span className="text-[9px] text-[#64748b] text-center leading-tight">{app.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   41. COMMAND PALETTE — ⌘K spotlight search with AnimatePresence
───────────────────────────────────────────────────────────────────────── */
interface CommandItem { id: string; label: string; icon?: ReactNode; action?: () => void; tag?: string }
interface CommandPaletteProps {
  items: CommandItem[]
  placeholder?: string
  className?: string
}
export function CommandPalette({ items, placeholder = "Search commands…", className }: CommandPaletteProps) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState("")
  const [sel,   setSel]   = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = items.filter(it =>
    it.label.toLowerCase().includes(query.toLowerCase()) ||
    (it.tag ?? "").toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(v => !v) }
      if (!open) return
      if (e.key === "Escape") { setOpen(false); setQuery("") }
      if (e.key === "ArrowDown") setSel(v => Math.min(v + 1, filtered.length - 1))
      if (e.key === "ArrowUp")   setSel(v => Math.max(v - 1, 0))
      if (e.key === "Enter" && filtered[sel]) { filtered[sel].action?.(); setOpen(false); setQuery("") }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, query, sel, filtered])

  useEffect(() => { setSel(0) }, [query])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])

  return (
    <>
      {/* Trigger button */}
      <motion.button
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03]
          text-[#475569] text-xs font-mono hover:text-[#e2e8f0] hover:border-white/[0.15] transition-colors ${className ?? ""}`}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        Search…
        <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-[#334155]">⌘K</kbd>
      </motion.button>

      {/* Palette modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9500]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); setQuery("") }}
              aria-hidden="true"
            />
            <motion.div
              className="fixed inset-x-4 top-[18%] z-[9501] max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)" }}
              initial={{ opacity: 0, scale: 0.94, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -20 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                <svg className="w-4 h-4 text-[#475569] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-[#e2e8f0] text-sm placeholder-[#334155] outline-none"
                />
                <kbd className="px-1.5 py-0.5 rounded text-[10px] text-[#334155] bg-white/[0.04] border border-white/[0.06]">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto py-2" role="listbox">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[#334155] text-sm">No results for "{query}"</div>
                ) : (
                  filtered.map((item, i) => (
                    <motion.button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        sel === i ? "bg-[#00d4ff]/10 text-[#00d4ff]" : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#e2e8f0]"
                      }`}
                      onMouseEnter={() => setSel(i)}
                      onClick={() => { item.action?.(); setOpen(false); setQuery("") }}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      role="option"
                      aria-selected={sel === i}
                    >
                      {item.icon && <span className="w-5 h-5 flex items-center justify-center text-sm shrink-0" aria-hidden="true">{item.icon}</span>}
                      <span className="flex-1">{item.label}</span>
                      {item.tag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#475569] font-mono">{item.tag}</span>
                      )}
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] px-4 py-2 flex items-center gap-4 text-[10px] text-[#334155] font-mono">
                <span><kbd className="px-1 py-0.5 rounded bg-white/[0.04]">↑↓</kbd> navigate</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/[0.04]">↵</kbd> select</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/[0.04]">esc</kbd> close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   42. iOS EXPOSURE CAROUSEL — horizontal carousel with iOS-style exposure
───────────────────────────────────────────────────────────────────────── */
interface CarouselSlide { id: string | number; content: ReactNode }
export function IOSCarousel({ slides, className }: { slides: CarouselSlide[]; className?: string }) {
  const [active, setActive] = useState(0)
  const x = useMotionValue(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const next = useCallback(() => setActive(v => Math.min(v + 1, slides.length - 1)), [slides.length])
  const prev = useCallback(() => setActive(v => Math.max(v - 1, 0)), [])

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        ref={trackRef}
        className="flex"
        animate={{ x: `-${active * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag="x"
        dragConstraints={{ left: -(slides.length - 1) * 100, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) next()
          else if (info.offset.x > 50) prev()
        }}
        style={{ cursor: "grab" }}
      >
        {slides.map((slide, i) => (
          <motion.div
            key={slide.id}
            className="shrink-0 w-full"
            animate={{
              scale: active === i ? 1 : 0.88,
              opacity: active === i ? 1 : 0.5,
              filter: active === i ? "blur(0px)" : "blur(2px)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {slide.content}
          </motion.div>
        ))}
      </motion.div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4" role="tablist" aria-label="Carousel navigation">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            className="rounded-full"
            animate={{ width: active === i ? 20 : 6, background: active === i ? "#00d4ff" : "rgba(255,255,255,0.2)" }}
            style={{ height: 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setActive(i)}
            role="tab"
            aria-selected={active === i}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   43. SKEW ANIMATION — animated skew + rotate + scale combo
───────────────────────────────────────────────────────────────────────── */
export function SkewCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        skewX: -6,
        skewY: 2,
        rotate: -2,
        scale: 1.04,
        transition: { type: "spring", stiffness: 300, damping: 18 },
      }}
      whileTap={{ skewX: 3, skewY: -1, scale: 0.97 }}
      animate={{ skewX: 0, skewY: 0, rotate: 0 }}
    >
      {children}
    </motion.div>
  )
}

/* Continuous skew + rotate keyframe banner */
export function SkewBanner({ text, className }: { text: string; className?: string }) {
  return (
    <motion.div
      className={`inline-block font-black ${className ?? ""}`}
      animate={{
        skewX: [0, -8, 0, 6, 0],
        rotate: [0, -3, 0, 2, 0],
        scale:  [1, 1.05, 1, 1.03, 1],
      }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
    >
      {text}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   44. PAN GESTURE — onPan / onPanStart / onPanEnd tracking
───────────────────────────────────────────────────────────────────────── */
export function PanTracker({ className }: { className?: string }) {
  const [pan,  setPan]  = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  return (
    <motion.div
      className={`relative flex items-center justify-center select-none touch-none ${className ?? ""}`}
      onPanStart={() => setActive(true)}
      onPan={(_, info) => setPan({ x: Math.round(info.offset.x), y: Math.round(info.offset.y) })}
      onPanEnd={() => { setActive(false); setPan({ x: 0, y: 0 }) }}
      style={{ cursor: active ? "crosshair" : "grab" }}
      aria-label="Pan gesture area"
    >
      {/* Crosshair indicator */}
      <motion.div
        className="absolute w-6 h-6 rounded-full border-2 border-[#00d4ff] pointer-events-none"
        animate={{ x: pan.x, y: pan.y, scale: active ? 1.4 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        aria-hidden="true"
      />
      <div className="text-[#334155] text-xs font-mono text-center pointer-events-none select-none">
        {active
          ? <span className="text-[#00d4ff]">{`dx:${pan.x} dy:${pan.y}`}</span>
          : "Pan here"}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   45. PINCH GESTURE — touch pinch to scale (pointer events)
───────────────────────────────────────────────────────────────────────── */
export function PinchToScale({ children, className }: { children: ReactNode; className?: string }) {
  const scale = useMotionValue(1)
  const springScale = useSpring(scale, { stiffness: 300, damping: 25 })
  const startDist   = useRef<number | null>(null)
  const startScale  = useRef(1)

  const getDist = (touches: React.TouchList) =>
    Math.hypot(
      touches[1].clientX - touches[0].clientX,
      touches[1].clientY - touches[0].clientY
    )

  return (
    <motion.div
      className={`touch-none select-none ${className ?? ""}`}
      style={{ scale: springScale }}
      onTouchStart={e => {
        if (e.touches.length === 2) {
          startDist.current  = getDist(e.touches)
          startScale.current = scale.get()
        }
      }}
      onTouchMove={e => {
        if (e.touches.length === 2 && startDist.current !== null) {
          const ratio = getDist(e.touches) / startDist.current
          scale.set(Math.min(3, Math.max(0.5, startScale.current * ratio)))
        }
      }}
      onTouchEnd={() => { startDist.current = null }}
      aria-label="Pinch to scale"
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   46. FOCUS GESTURE — whileFocus animated input + label
───────────────────────────────────────────────────────────────────────── */
export function FocusInput({
  label, placeholder, className,
}: { label: string; placeholder?: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <motion.label
        className="text-xs font-mono text-[#475569]"
        htmlFor={`focus-input-${label}`}
      >
        {label}
      </motion.label>
      <motion.input
        id={`focus-input-${label}`}
        type="text"
        placeholder={placeholder ?? "Focus me…"}
        className="rounded-xl border bg-transparent px-4 py-2.5 text-sm text-[#e2e8f0] outline-none placeholder-[#334155]"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
        whileFocus={{
          scale: 1.02,
          borderColor: "#00d4ff",
          boxShadow: "0 0 0 3px rgba(0,212,255,0.15), 0 0 20px rgba(0,212,255,0.1)",
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   47. DYNAMIC VARIANTS — custom prop drives per-item variant
───────────────────────────────────────────────────────────────────────── */
interface DynamicVariantItem { id: string | number; label: string; color: string; delay: number }
export function DynamicVariantGrid({ items, className }: { items: DynamicVariantItem[]; className?: string }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })

  const itemVariants = {
    hidden:  { opacity: 0, scale: 0.5, rotate: -15 },
    visible: (item: DynamicVariantItem) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type:      "spring",
        stiffness: 280,
        damping:   18,
        delay:     item.delay,
      },
    }),
  }

  return (
    <motion.div
      ref={ref}
      className={`flex flex-wrap gap-3 ${className ?? ""}`}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {items.map(item => (
        <motion.div
          key={item.id}
          custom={item}
          variants={itemVariants}
          className="px-4 py-2 rounded-xl text-xs font-semibold font-mono"
          style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25` }}
          whileHover={{ scale: 1.1, rotate: 3, transition: { type: "spring", stiffness: 400, damping: 18 } }}
          whileTap={{ scale: 0.92 }}
        >
          {item.label}
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   48. PAGE TRANSITION WRAPPER — AnimatePresence exit-before-enter
───────────────────────────────────────────────────────────────────────── */
interface PageSlide { id: string | number; content: ReactNode }
export function PageTransitionDemo({ pages }: { pages: PageSlide[] }) {
  const [idx, setIdx] = useState(0)
  const current = pages[idx]
  const modes: Array<"wait" | "sync" | "popLayout"> = ["wait", "sync", "popLayout"]
  const [mode, setMode] = useState<"wait" | "sync" | "popLayout">("wait")

  return (
    <div className="flex flex-col gap-4">
      {/* Mode switcher */}
      <div className="flex gap-2 flex-wrap">
        {modes.map(m => (
          <motion.button
            key={m}
            className="px-3 py-1.5 rounded-lg text-xs font-mono"
            style={{
              background: mode === m ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.04)",
              color: mode === m ? "#00d4ff" : "#475569",
              border: `1px solid ${mode === m ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)"}`,
            }}
            onClick={() => setMode(m)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {m}
          </motion.button>
        ))}
      </div>

      {/* Page viewport */}
      <div className="relative overflow-hidden rounded-xl bg-[#080b12] border border-white/[0.07]" style={{ minHeight: 120 }}>
        <AnimatePresence mode={mode}>
          <motion.div
            key={current.id}
            className="absolute inset-0 flex items-center justify-center p-6"
            initial={{ opacity: 0, x: 60, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0,  filter: "blur(0px)" }}
            exit={{    opacity: 0, x: -60, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            {current.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex justify-center gap-3">
        {pages.map((p, i) => (
          <motion.button
            key={p.id}
            className="rounded-full"
            animate={{ width: idx === i ? 24 : 8, background: idx === i ? "#00d4ff" : "rgba(255,255,255,0.15)" }}
            style={{ height: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setIdx(i)}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   49. SCROLL PROGRESS MAP — useScroll maps to multiple animated outputs
───────────────────────────────────────────────────────────────────────── */
export function ScrollProgressMap({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })

  const bgOpacity  = useTransform(scrollYProgress, [0, 0.5, 1], [0,    1,    0])
  const rotateZ    = useTransform(scrollYProgress, [0, 1],       [0,   360])
  const hue        = useTransform(scrollYProgress, [0, 1],       [180, 320])
  const scaleVal   = useTransform(scrollYProgress, [0, 0.5, 1],  [0.6, 1.2, 0.6])
  const yText      = useTransform(scrollYProgress, [0, 1],       [40,  -40])
  const xBar       = useTransform(scrollYProgress, [0, 1],       ["0%", "100%"])
  const skewXMap   = useTransform(scrollYProgress, [0, 0.5, 1],  [-12, 0, 12])

  const bgColor    = useTransform(hue, h => `hsl(${h}, 80%, 60%)`)

  return (
    <div ref={ref} className={`flex flex-col gap-5 ${className ?? ""}`}>
      <p className="text-[#475569] text-xs font-mono text-center">Scroll triggers all these simultaneously</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Rotating + scaling orb */}
        <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#080b12] border border-white/[0.06]">
          <motion.div
            className="w-10 h-10 rounded-lg"
            style={{ rotate: rotateZ, scale: scaleVal, background: bgColor, opacity: bgOpacity }}
            aria-hidden="true"
          />
          <span className="text-[10px] font-mono text-[#334155]">rotate + scale + color</span>
        </div>

        {/* Y-moving text */}
        <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#080b12] border border-white/[0.06] overflow-hidden">
          <motion.span
            className="text-xs font-mono font-bold text-[#00d4ff]"
            style={{ y: yText, opacity: bgOpacity }}
          >
            Scroll-Y text
          </motion.span>
          <span className="text-[10px] font-mono text-[#334155]">y + opacity</span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#080b12] border border-white/[0.06]">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ width: xBar, background: bgColor }} />
          </div>
          <span className="text-[10px] font-mono text-[#334155]">progress bar</span>
        </div>

        {/* Skew */}
        <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#080b12] border border-white/[0.06] overflow-hidden">
          <motion.div
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
            style={{ skewX: skewXMap, background: "rgba(0,212,255,0.1)", color: "#00d4ff" }}
          >
            SKEW
          </motion.div>
          <span className="text-[10px] font-mono text-[#334155]">skewX mapped</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   50. GESTURE COMBINATIONS — drag + spring + rotation + scale together
───────────────────────────────────────────────────────────────────────── */
export function GestureCombined({ className }: { className?: string }) {
  const x      = useMotionValue(0)
  const y      = useMotionValue(0)
  const rotateZ  = useTransform(x, [-150, 150], [-25, 25])
  const scaleT   = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [0.85, 0.95, 1, 0.95, 0.85]
  )
  const bg = useTransform(
    x,
    [-150, 0, 150],
    ["rgba(239,68,68,0.2)", "rgba(0,212,255,0.15)", "rgba(0,255,136,0.2)"]
  )

  return (
    <div className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ height: 160 }}>
      <motion.div
        drag
        dragConstraints={{ top: -40, bottom: 40, left: -80, right: 80 }}
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 22 }}
        style={{ x, y, rotate: rotateZ, scale: scaleT, background: bg }}
        className="w-20 h-20 rounded-2xl border border-white/15 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        whileHover={{ boxShadow: "0 0 24px rgba(0,212,255,0.4)" }}
        whileDrag={{  boxShadow: "0 0 40px rgba(0,212,255,0.6)", zIndex: 10 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Drag me"
      >
        <span className="text-xl" aria-hidden="true">◈</span>
      </motion.div>
      <p className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-[#334155] font-mono">
        drag + rotate + scale + color (all linked)
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   51. ORCHESTRATED STAGGER — parent variants control child timing
───────────────────────────────────────────────────────────────────────── */
interface OrchestratedItem { id: string; label: string; icon: ReactNode; color: string }
export function OrchestratedStagger({ items, className }: { items: OrchestratedItem[]; className?: string }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: "-30px 0px" })

  const container = {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren:  0.07,
        delayChildren:    0.1,
        when:             "beforeChildren",
      },
    },
  }

  const item = {
    hidden:  { opacity: 0, y: 30, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      y:       0,
      scale:   1,
      rotate:  0,
      transition: {
        type:      "spring",
        stiffness: 300,
        damping:   20,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`flex flex-wrap gap-3 ${className ?? ""}`}
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {items.map(i => (
        <motion.div
          key={i.id}
          variants={item}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: `${i.color}12`, color: i.color, border: `1px solid ${i.color}22` }}
          whileHover={{
            y: -4,
            scale: 1.06,
            boxShadow: `0 8px 20px ${i.color}30`,
            transition: { type: "spring", stiffness: 400, damping: 18 },
          }}
        >
          <span aria-hidden="true">{i.icon}</span>
          {i.label}
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   52. TIMELINE ANIMATION — sequenced multi-step animation
───────────────────────────────────────────────────────────────────────── */
export function TimelineAnimation({ className }: { className?: string }) {
  const [playing, setPlaying] = useState(false)
  const [step,    setStep]    = useState(0)
  const STEPS = 5

  const startTimeline = useCallback(() => {
    if (playing) return
    setPlaying(true)
    setStep(0)
    let s = 0
    const advance = () => {
      s++
      setStep(s)
      if (s < STEPS) setTimeout(advance, 500)
      else { setTimeout(() => { setPlaying(false); setStep(0) }, 800) }
    }
    setTimeout(advance, 300)
  }, [playing])

  const stepColors = ["#ef4444", "#f59e0b", "#a855f7", "#00d4ff", "#00ff88"]
  const stepLabels = ["Init", "Parse", "Compile", "Link", "Deploy"]

  return (
    <div className={`flex flex-col gap-5 ${className ?? ""}`}>
      {/* Timeline track */}
      <div className="relative flex items-center gap-0">
        {/* Background rail */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/[0.06] rounded-full" aria-hidden="true" />

        {/* Progress fill */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 rounded-full origin-left"
          style={{ background: "linear-gradient(90deg, #ef4444, #00ff88)" }}
          animate={{ scaleX: step / STEPS }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          aria-hidden="true"
        />

        {/* Nodes */}
        {stepLabels.map((label, i) => (
          <div key={label} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
            <motion.div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
              animate={{
                background: step > i ? `${stepColors[i]}30` : "rgba(255,255,255,0.03)",
                borderColor: step > i ? stepColors[i] : "rgba(255,255,255,0.1)",
                color: step > i ? stepColors[i] : "#334155",
                scale: step === i + 1 ? [1, 1.3, 1] : 1,
                boxShadow: step > i ? `0 0 12px ${stepColors[i]}50` : "none",
              }}
              transition={{ duration: 0.3 }}
            >
              {step > i ? "✓" : i + 1}
            </motion.div>
            <span
              className="text-[9px] font-mono transition-colors duration-300"
              style={{ color: step > i ? stepColors[i] : "#334155" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Run button */}
      <motion.button
        className="mx-auto px-6 py-2.5 rounded-xl text-xs font-semibold font-mono border"
        style={{
          background: playing ? "rgba(0,212,255,0.05)" : "rgba(0,212,255,0.12)",
          borderColor: playing ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.35)",
          color: playing ? "#334155" : "#00d4ff",
        }}
        onClick={startTimeline}
        whileHover={playing ? {} : { scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={playing}
        aria-label="Run timeline animation"
      >
        {playing ? `Running… (${step}/${STEPS})` : "Run Timeline"}
      </motion.button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   53. SHARED LAYOUT DEMO — LayoutId transitions between positions
───────────────────────────────────────────────────────────────────────── */
interface SharedItem { id: string; label: string; color: string }
export function SharedLayoutDemo({ items, className }: { items: SharedItem[]; className?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = items.find(i => i.id === selectedId)

  return (
    <div className={className}>
      {/* Grid */}
      <div className="flex flex-wrap gap-3 mb-4">
        {items.map(item => (
          <motion.div
            key={item.id}
            layoutId={`shared-${item.id}`}
            onClick={() => setSelectedId(item.id)}
            className="w-12 h-12 rounded-xl cursor-pointer flex items-center justify-center text-xs font-bold"
            style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}25` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {item.label.slice(0, 2)}
          </motion.div>
        ))}
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {selectedId && selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[8000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              aria-hidden="true"
            />
            <motion.div
              layoutId={`shared-${selectedId}`}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[8001] rounded-2xl p-6 flex flex-col items-center gap-3"
              style={{ background: `${selected.color}15`, border: `1px solid ${selected.color}30`, color: selected.color }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              <span className="text-2xl font-black">{selected.label}</span>
              <p className="text-sm opacity-70 text-center">Shared layout transition from grid to card</p>
              <motion.button
                className="mt-2 px-4 py-1.5 rounded-lg text-xs font-mono border"
                style={{ borderColor: `${selected.color}40`, background: `${selected.color}08` }}
                onClick={() => setSelectedId(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   54. LAZY MOTION WRAPPER — deferred feature loading (SSR-friendly)
───────────────────────────────────────────────────────────────────────── */
export function MotionValueDisplay({ className }: { className?: string }) {
  const x      = useMotionValue(0)
  const y      = useMotionValue(0)
  const rot    = useTransform(x, [-100, 100], [-30, 30])
  const scl    = useTransform(y, [-60, 60], [0.8, 1.2])
  const bg     = useTransform(x, [-100, 0, 100], ["#ef4444", "#00d4ff", "#00ff88"])
  const xSpr   = useSpring(x, { stiffness: 300, damping: 20 })
  const ySpr   = useSpring(y, { stiffness: 300, damping: 20 })

  const [vals, setVals] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const unsubX = x.on("change", v => setVals(prev => ({ ...prev, x: Math.round(v) })))
    const unsubY = y.on("change", v => setVals(prev => ({ ...prev, y: Math.round(v) })))
    return () => { unsubX(); unsubY() }
  }, [x, y])

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      {/* Draggable element */}
      <div className="relative flex items-center justify-center" style={{ height: 120 }}>
        <motion.div
          drag
          dragConstraints={{ top: -40, bottom: 40, left: -80, right: 80 }}
          dragElastic={0.1}
          style={{ x: xSpr, y: ySpr, rotate: rot, scale: scl, background: bg }}
          className="w-14 h-14 rounded-2xl cursor-grab active:cursor-grabbing flex items-center justify-center text-white text-xs font-bold select-none border border-white/10"
          whileDrag={{ boxShadow: "0 0 30px rgba(0,212,255,0.5)" }}
          aria-label="Drag to change motion values"
        >
          DRAG
        </motion.div>
      </div>

      {/* Live readout */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "x", val: vals.x, color: "#00d4ff" },
          { label: "y", val: vals.y, color: "#00ff88" },
        ].map(v => (
          <div key={v.label} className="rounded-lg p-2.5 bg-[#080b12] border border-white/[0.06] flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono" style={{ color: v.color }}>{v.label.toUpperCase()}</span>
            <motion.span
              key={v.val}
              className="text-xs font-mono tabular-nums text-[#e2e8f0]"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            >
              {v.val}
            </motion.span>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-mono text-[#334155] text-center">useMotionValue + useTransform + useSpring</p>
    </div>
  )
}
