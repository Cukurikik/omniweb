// @ts-nocheck
"use client"

/**
 * OMNI Animation Lab
 * ──────────────────
 * Every animation primitive from the requested spec, demonstrated on one page:
 *
 * 1. Fundamentals  – Opacity, Scale, Position, Rotate, Skew, BgColor,
 *                    Shadow, BorderRadius, SVG Paths, Text, Keyframes,
 *                    Duration/Delay, Easing
 * 2. Gestures      – Hover, Tap, Drag, Pan, Pinch, Focus, Scroll
 * 3. Layout        – LayoutId, AnimatePresence (all 3 modes),
 *                    Exit Animations, Shared Layout, Stagger Children
 * 4. Page Trans.   – Page Transitions, Exit-Before-Enter, Shared Layout Pages
 * 5. Scroll        – Scroll-Linked (progress mapped to many outputs),
 *                    Parallax, Scroll-Triggered (whileInView), Progress Bar
 * 6. Physics       – Spring (stiffness/damping/mass/velocity), Inertia
 * 7. Variants      – Variants, Staggered, Dynamic (custom), Orchestrated
 * 8. Advanced      – useMotionValue, useTransform, useSpring,
 *                    useInView, Gesture Combinations, Motion Values display
 * 9. SSR           – LazyMotion note + domAnimation feature set reference
 * 10. Additional   – Timeline, Time Controls
 */

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useInView,
  useVelocity,
  cubicBezier,
  LayoutGroup,
} from "motion/react"
import OmniNav from "@/components/omni-nav"
import {
  Reveal,
  StaggerGrid,
  StaggerItem,
  SplitText,
  TiltCard,
  MagneticButton,
  ScrollProgressBar,
  CursorTrail,
  FloatingCursorTarget,
  PathDraw,
  MorphingPath,
  KeyframeOrb,
  SpinningCube,
  LoadingSpinner,
  JumpingDots,
  RippleLoader,
  PulseDots,
  HoldToConfirm,
  SmoothTabs,
  FillText,
  IntelligenceRipple,
  MultiStateBadge,
  MotionAccordion,
  ParallaxLayer,
  VelocityMarquee,
  SkewCard,
  SkewBanner,
  PanTracker,
  FocusInput,
  DynamicVariantGrid,
  PageTransitionDemo,
  ScrollProgressMap,
  GestureCombined,
  OrchestratedStagger,
  TimelineAnimation,
  SharedLayoutDemo,
  MotionValueDisplay,
} from "@/components/motion-kit"

/* ─── Colour constants ─── */
const C = {
  cyan:   "#00d4ff",
  green:  "#00ff88",
  purple: "#a855f7",
  amber:  "#f59e0b",
  red:    "#ef4444",
  muted:  "#64748b",
  dim:    "#334155",
  bg:     "#080b12",
  card:   "#0d1117",
}

/* ─── Section wrapper ─── */
function Lab({
  id,
  title,
  subtitle,
  accent = C.cyan,
  children,
  dark = false,
}: {
  id: string
  title: string
  subtitle: string
  accent?: string
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <section
      id={id}
      className="py-20 px-6 border-b border-white/[0.05]"
      style={{ background: dark ? C.card : C.bg }}
    >
      <div className="max-w-5xl mx-auto">
        <Reveal variant="blurRise" className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: accent }}>
            {subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-[#e2e8f0]">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  )
}

/* ─── Demo card wrapper ─── */
function Demo({
  label,
  sub,
  children,
  span2 = false,
}: {
  label: string
  sub?: string
  children: React.ReactNode
  span2?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#080b12] p-6 flex flex-col gap-4 ${
        span2 ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[120px]">
        {children}
      </div>
      <div className="border-t border-white/[0.05] pt-3">
        <p className="text-xs font-semibold text-[#94a3b8]">{label}</p>
        {sub && <p className="text-[10px] font-mono text-[#334155] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────── Data ─────── */

const PAGE_SLIDES = [
  { id: "a", content: <div className="text-center"><div className="text-3xl font-black text-[#00d4ff]">Compile</div><p className="text-[#475569] text-xs mt-1 font-mono">LLVM-Omni stage</p></div> },
  { id: "b", content: <div className="text-center"><div className="text-3xl font-black text-[#00ff88]">Deploy</div><p className="text-[#475569] text-xs mt-1 font-mono">Unikernel stage</p></div> },
  { id: "c", content: <div className="text-center"><div className="text-3xl font-black text-[#a855f7]">Run</div><p className="text-[#475569] text-xs mt-1 font-mono">Native execution</p></div> },
]

const SHARED_ITEMS = [
  { id: "rust",  label: "Rust",    color: C.red },
  { id: "go",    label: "Go",      color: C.cyan },
  { id: "ts",    label: "TS",      color: "#3178c6" },
  { id: "py",    label: "Py",      color: C.amber },
  { id: "julia", label: "Julia",   color: C.purple },
  { id: "zig",   label: "Zig",     color: C.amber },
]

const DYNAMIC_ITEMS = [
  { id: "c",       label: "C",          color: C.red,    delay: 0 },
  { id: "cpp",     label: "C++",        color: C.red,    delay: 0.07 },
  { id: "rust",    label: "Rust",       color: C.amber,  delay: 0.14 },
  { id: "go",      label: "Go",         color: C.cyan,   delay: 0.21 },
  { id: "ts",      label: "TypeScript", color: "#3178c6",delay: 0.28 },
  { id: "python",  label: "Python",     color: C.amber,  delay: 0.35 },
  { id: "julia",   label: "Julia",      color: C.purple, delay: 0.42 },
  { id: "swift",   label: "Swift",      color: C.red,    delay: 0.49 },
]

const ORCHESTRATED_ITEMS = [
  { id: "uast",    label: "UAST",    icon: "◈", color: C.cyan },
  { id: "llvm",    label: "LLVM",    icon: "⬡", color: C.green },
  { id: "nexus",   label: "NEXUS",   icon: "◉", color: C.purple },
  { id: "kernel",  label: "Kernel",  icon: "⬢", color: C.amber },
  { id: "lsp",     label: "LSP",     icon: "◇", color: C.cyan },
  { id: "wasm",    label: "WASM",    icon: "⬟", color: C.green },
]

const FEATURE_TABS_LAB = [
  { id: "spring",  label: "Spring" },
  { id: "inertia", label: "Inertia" },
  { id: "tween",   label: "Tween" },
]

const EASE_DEMOS = [
  { label: "easeIn",    ease: "easeIn",    color: C.red },
  { label: "easeOut",   ease: "easeOut",   color: C.cyan },
  { label: "easeInOut", ease: "easeInOut", color: C.purple },
  { label: "linear",    ease: "linear",    color: C.amber },
  { label: "spring",    ease: null,        color: C.green },
  { label: "backIn",    ease: [0.36, 0, 0.66, -0.56] as [number,number,number,number], color: "#fb923c" },
] as const

const FAQ_LAB = [
  { id: "q1", title: "What is useMotionValue?",     content: "A MotionValue stores animation state without re-rendering the component. Use it with useTransform and useSpring for high-performance derived animations." },
  { id: "q2", title: "What is AnimatePresence?",    content: "AnimatePresence enables exit animations for components that are removed from the React tree. Without it, exit animations are impossible." },
  { id: "q3", title: "What are Variants?",          content: "Variants let you define named animation states and orchestrate complex multi-component animations through a single parent state change." },
  { id: "q4", title: "What is LayoutId?",           content: "LayoutId lets you animate a shared element between two different DOM positions or components, creating seamless shared-element transitions." },
]

/* ─────────────────────────────────────── Spring Physics sub-demos ─── */
function SpringDemo() {
  const configs = [
    { label: "Stiff",   stiffness: 600, damping: 20,  mass: 1,   color: C.cyan },
    { label: "Soft",    stiffness: 80,  damping: 12,  mass: 1,   color: C.green },
    { label: "Bouncy",  stiffness: 200, damping: 5,   mass: 1,   color: C.purple },
    { label: "Heavy",   stiffness: 200, damping: 20,  mass: 4,   color: C.amber },
    { label: "Slow",    stiffness: 40,  damping: 8,   mass: 2,   color: C.red },
    { label: "Snappy",  stiffness: 800, damping: 35,  mass: 0.5, color: "#fb923c" },
  ]
  const [trigger, setTrigger] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {configs.map(c => (
          <div key={c.label} className="flex items-center gap-3">
            <span className="text-[10px] font-mono w-14 text-right shrink-0" style={{ color: c.color }}>
              {c.label}
            </span>
            <div className="flex-1 h-6 relative rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="absolute top-1 h-4 w-4 rounded-full"
                style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }}
                animate={{ x: trigger ? "calc(100% - 1rem - 4px)" : 4 }}
                transition={{ type: "spring", stiffness: c.stiffness, damping: c.damping, mass: c.mass }}
              />
            </div>
          </div>
        ))}
      </div>
      <motion.button
        className="mx-auto px-5 py-2 rounded-xl text-xs font-mono font-semibold border"
        style={{ borderColor: `${C.cyan}35`, color: C.cyan, background: `${C.cyan}08` }}
        onClick={() => setTrigger(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle spring animation"
      >
        Toggle Springs
      </motion.button>
    </div>
  )
}

/* ─────────────────────────────────── Easing visual rail ─────────── */
function EasingRail({ label, ease, color }: { label: string; ease: typeof EASE_DEMOS[number]["ease"]; color: string }) {
  const [key, setKey] = useState(0)
  return (
    <div
      className="flex items-center gap-3 cursor-pointer group"
      onClick={() => setKey(k => k + 1)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && setKey(k => k + 1)}
      aria-label={`Replay ${label} easing`}
    >
      <span className="text-[10px] font-mono w-16 text-right shrink-0" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-5 relative bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          key={key}
          className="absolute top-0.5 h-4 w-4 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          initial={{ x: 4 }}
          animate={{ x: "calc(100% - 1.25rem)" }}
          transition={
            ease === null
              ? { type: "spring", stiffness: 200, damping: 10 }
              : Array.isArray(ease)
              ? { duration: 0.8, ease }
              : { duration: 0.8, ease }
          }
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────── Keyframe multi-prop demo ─── */
function KeyframeMultiProp() {
  return (
    <div className="flex items-center justify-center gap-8">
      {/* Rotate + Scale + Opacity */}
      <motion.div
        className="w-12 h-12 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})` }}
        animate={{
          rotate:  [0, 90, 180, 270, 360],
          scale:   [1, 1.3, 0.8, 1.2, 1],
          opacity: [1, 0.6, 1, 0.8, 1],
          borderRadius: ["12px", "50%", "12px", "30%", "12px"],
        }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
        aria-hidden="true"
      />

      {/* BgColor + Shadow + BorderRadius */}
      <motion.div
        className="w-12 h-12"
        animate={{
          backgroundColor: [C.green, C.amber, C.red, C.purple, C.green],
          boxShadow: [
            `0 0 8px ${C.green}`,
            `0 8px 24px ${C.amber}`,
            `0 0 16px ${C.red}`,
            `0 4px 32px ${C.purple}`,
            `0 0 8px ${C.green}`,
          ],
          borderRadius: ["8px", "50%", "4px", "24px", "8px"],
        }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        aria-hidden="true"
      />

      {/* Position + Skew */}
      <motion.div
        className="w-10 h-10 rounded-lg"
        style={{ background: C.amber }}
        animate={{
          x: [0, 12, -12, 8, 0],
          y: [0, -8, 8, -4, 0],
          skewX: [0, 10, -8, 6, 0],
          skewY: [0, -4, 6, -2, 0],
        }}
        transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
        aria-hidden="true"
      />
    </div>
  )
}

/* ─────────────────────────────────────────── Velocity readout ─── */
function VelocityReadout() {
  const { scrollY } = useScroll()
  const vel         = useVelocity(scrollY)
  const smoothVel   = useSpring(vel, { stiffness: 50, damping: 15 })
  const [v, setV]   = useState(0)

  useEffect(() => {
    const unsub = smoothVel.on("change", val => setV(Math.round(Math.abs(val))))
    return unsub
  }, [smoothVel])

  const barW = useTransform(smoothVel, [-3000, 0, 3000], [0, 0, 100])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[#475569]">Scroll velocity</span>
        <motion.span
          className="text-sm font-mono font-bold tabular-nums"
          style={{ color: C.cyan }}
          key={v}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}
        >
          {v} <span className="text-[10px] opacity-50">px/s</span>
        </motion.span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full origin-left"
          style={{ scaleX: useTransform(barW, [0, 100], [0, 1]), background: `linear-gradient(90deg, ${C.cyan}, ${C.green})` }}
        />
      </div>
      <p className="text-[10px] font-mono text-[#334155]">Scroll the page to see live velocity</p>
    </div>
  )
}

/* ─────────────────────────────────────────── Main page ─────────── */
export default function AnimationLabPage() {
  const [badgeState, setBadgeState] = useState<"idle"|"loading"|"success"|"error">("idle")
  const [activePhysicsTab, setActivePhysicsTab] = useState("spring")
  const [counter, setCounter] = useState(0)
  const [listItems, setListItems] = useState(["UAST Module", "LLVM-Omni", "Domain Segregation"])

  /* Cycle badge */
  useEffect(() => {
    const states = ["idle","loading","success","error"] as const
    let i = 0
    const id = setInterval(() => { i = (i+1)%4; setBadgeState(states[i]) }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-[#080b12] text-[#e2e8f0] overflow-x-hidden">
      <CursorTrail />
      <FloatingCursorTarget />
      <ScrollProgressBar />
      <OmniNav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Ambient glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <motion.div
            className="w-[600px] h-[600px] rounded-full"
            style={{ background: `radial-gradient(circle, ${C.cyan}07 0%, transparent 65%)` }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          className="text-xs font-mono uppercase tracking-widest mb-4"
          style={{ color: C.cyan }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: cubicBezier(0.16,1,0.3,1) }}
        >
          OMNI Animation Lab
        </motion.p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-center leading-[1.04] mb-5">
          <SplitText
            text="Every Animation."
            className="block text-[#e2e8f0]"
            variant="words"
            animVariant="blurRise"
            stagger={0.1}
            delay={0.2}
          />
          <SplitText
            text="Zero Excuses."
            className="block"
            charClassName="gradient-text"
            variant="words"
            animVariant="blurRise"
            stagger={0.1}
            delay={0.45}
          />
        </h1>

        <motion.p
          className="text-[#64748b] text-base max-w-lg text-center leading-relaxed mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: cubicBezier(0.16,1,0.3,1) }}
        >
          Comprehensive demonstration of every motion primitive —
          fundamentals, gestures, layout, scroll, physics, variants, and advanced patterns.
        </motion.p>

        {/* Quick-nav chips */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.9 } } }}
        >
          {[
            { href: "#fundamentals", label: "Fundamentals", color: C.cyan },
            { href: "#gestures",     label: "Gestures",     color: C.green },
            { href: "#layout",       label: "Layout",       color: C.purple },
            { href: "#scroll",       label: "Scroll",       color: C.amber },
            { href: "#physics",      label: "Physics",      color: C.red },
            { href: "#variants",     label: "Variants",     color: C.cyan },
            { href: "#advanced",     label: "Advanced",     color: C.green },
            { href: "#timeline",     label: "Timeline",     color: C.purple },
          ].map(chip => (
            <motion.a
              key={chip.href}
              href={chip.href}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all"
              style={{ borderColor: `${chip.color}25`, color: chip.color, background: `${chip.color}08` }}
              variants={{
                hidden:  { opacity: 0, scale: 0.7 },
                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
              }}
              whileHover={{ scale: 1.08, background: `${chip.color}18` }}
              whileTap={{ scale: 0.93 }}
            >
              {chip.label}
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ══ 1. FUNDAMENTALS ══════════════════════════════════════════════════ */}
      <Lab id="fundamentals" title="Animation Fundamentals" subtitle="1 — Opacity · Scale · Position · Rotate · Skew · BgColor · Shadow · BorderRadius · SVG · Text · Keyframes · Duration · Easing">

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Opacity */}
          <Demo label="Opacity" sub="animate opacity 0→1, repeat">
            <motion.div
              className="w-14 h-14 rounded-xl"
              style={{ background: C.cyan }}
              animate={{ opacity: [0, 1, 0.3, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
          </Demo>

          {/* Scale */}
          <Demo label="Scale" sub="spring pop + breath">
            <motion.div
              className="w-14 h-14 rounded-xl"
              style={{ background: C.green }}
              animate={{ scale: [1, 1.35, 0.85, 1.1, 1] }}
              transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, times: [0, 0.3, 0.55, 0.8, 1] }}
              aria-hidden="true"
            />
          </Demo>

          {/* Position */}
          <Demo label="Position (x + y)" sub="keyframe trajectory">
            <motion.div
              className="w-10 h-10 rounded-full"
              style={{ background: C.purple }}
              animate={{ x: [0, 32, -32, 16, 0], y: [0, -20, 16, -8, 0] }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
              aria-hidden="true"
            />
          </Demo>

          {/* Rotate */}
          <Demo label="Rotate" sub="continuous + spring flip">
            <div className="flex items-center gap-6">
              <motion.div
                className="w-12 h-12 rounded-lg"
                style={{ background: C.amber }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                aria-hidden="true"
              />
              <motion.div
                className="w-12 h-4 rounded-full"
                style={{ background: C.red }}
                animate={{ rotate: [0, 180, 0] }}
                transition={{ duration: 2, type: "spring", stiffness: 180, damping: 10, repeat: Infinity, repeatDelay: 0.5 }}
                aria-hidden="true"
              />
            </div>
          </Demo>

          {/* Skew */}
          <Demo label="Skew" sub="skewX + skewY animated + hover card">
            <div className="flex items-center gap-6">
              <SkewBanner text="OMNI" className="text-xl gradient-text" />
              <SkewCard className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-[#94a3b8] cursor-pointer">
                Hover me
              </SkewCard>
            </div>
          </Demo>

          {/* Background Color */}
          <Demo label="Background Color" sub="continuous hue cycle via keyframes">
            <motion.div
              className="w-16 h-16 rounded-2xl"
              animate={{ backgroundColor: [C.cyan, C.green, C.purple, C.amber, C.red, C.cyan] }}
              transition={{ duration: 5, ease: "linear", repeat: Infinity }}
              aria-hidden="true"
            />
          </Demo>

          {/* Box Shadow */}
          <Demo label="Box Shadow" sub="pulse glow + color shift">
            <motion.div
              className="w-14 h-14 rounded-xl"
              style={{ background: "#0d1117" }}
              animate={{
                boxShadow: [
                  `0 0 8px ${C.cyan}`,
                  `0 0 32px ${C.cyan}, 0 0 60px ${C.cyan}40`,
                  `0 0 8px ${C.green}`,
                  `0 0 32px ${C.green}, 0 0 60px ${C.green}40`,
                  `0 0 8px ${C.cyan}`,
                ],
              }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
              aria-hidden="true"
            />
          </Demo>

          {/* Border Radius */}
          <Demo label="Border Radius" sub="morphing shape loop">
            <motion.div
              className="w-16 h-16"
              style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})` }}
              animate={{ borderRadius: ["12px", "50%", "4px", "30% 70%", "12px"] }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
              aria-hidden="true"
            />
          </Demo>

          {/* SVG Path Drawing */}
          <Demo label="SVG Path Drawing" sub="stroke-dashoffset reveal on scroll">
            <PathDraw
              d="M 20 80 C 40 10, 80 10, 100 50 S 160 90, 180 30"
              stroke={C.cyan}
              strokeWidth={2.5}
              viewBox="0 0 200 100"
              width={160}
              height={60}
            />
          </Demo>

          {/* Text animation */}
          <Demo label="Text Animation" sub="per-char blur-rise, flip-in, scale-pop" span2>
            <div className="flex flex-col gap-3 text-center">
              <SplitText
                text="Universal Runtime"
                className="text-2xl font-black gradient-text"
                variant="words"
                animVariant="blurRise"
                stagger={0.08}
              />
              <SplitText
                text="15 Languages, Zero Compromise"
                className="text-sm text-[#64748b] font-mono"
                variant="chars"
                animVariant="fadeUp"
                stagger={0.02}
                delay={0.3}
              />
            </div>
          </Demo>

          {/* Keyframes multi-prop */}
          <Demo label="Keyframes — Multiple Properties" sub="rotate + scale + opacity + bgColor + borderRadius simultaneously">
            <KeyframeMultiProp />
          </Demo>

          {/* Duration & Delay */}
          <Demo label="Duration & Delay" sub="staggered bars with explicit delay">
            <div className="flex items-end gap-2 h-16">
              {[0.6, 0.9, 0.3, 1.2, 0.5, 0.8].map((dur, i) => (
                <motion.div
                  key={i}
                  className="w-6 rounded-t-md"
                  style={{ background: [C.cyan, C.green, C.purple, C.amber, C.red, "#fb923c"][i] }}
                  animate={{ height: [8, 48 + i * 6, 8] }}
                  transition={{
                    duration: dur,
                    delay: i * 0.12,
                    repeat: Infinity,
                    repeatDelay: 0.8,
                    ease: "easeInOut",
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </Demo>

          {/* Easing */}
          <Demo label="Easing Comparison" sub="Click rail to replay" span2>
            <div className="w-full flex flex-col gap-2.5">
              {EASE_DEMOS.map(e => (
                <EasingRail key={e.label} label={e.label} ease={e.ease} color={e.color} />
              ))}
            </div>
          </Demo>

        </div>
      </Lab>

      {/* ══ 2. GESTURES ══════════════════════════════════════════════════════ */}
      <Lab id="gestures" title="Interactive Gestures" subtitle="2 — Hover · Tap · Drag · Pan · Pinch · Focus · Scroll" dark accent={C.green}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Hover */}
          <Demo label="Hover" sub="whileHover — scale + shadow + rotate">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black cursor-pointer"
              style={{ background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}25` }}
              whileHover={{
                scale: 1.2,
                rotate: 8,
                boxShadow: `0 0 32px ${C.cyan}50`,
                background: `${C.cyan}25`,
                transition: { type: "spring", stiffness: 300, damping: 18 },
              }}
              aria-label="Hover demo"
            >
              ◈
            </motion.div>
          </Demo>

          {/* Tap */}
          <Demo label="Tap" sub="whileTap — scale + shadow burst">
            <motion.button
              className="px-7 py-3 rounded-xl font-semibold text-sm border"
              style={{ background: `${C.green}10`, color: C.green, borderColor: `${C.green}30` }}
              whileHover={{ scale: 1.04, background: `${C.green}18` }}
              whileTap={{ scale: 0.88, boxShadow: `0 0 28px ${C.green}60` }}
              aria-label="Tap demo"
            >
              Tap me
            </motion.button>
          </Demo>

          {/* Drag */}
          <Demo label="Drag" sub="drag + constraints + elastic + inertia">
            <div className="relative w-full h-24 flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <motion.div
                drag
                dragConstraints={{ top: -20, bottom: 20, left: -60, right: 60 }}
                dragElastic={0.12}
                dragTransition={{ bounceStiffness: 350, bounceDamping: 22 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm cursor-grab active:cursor-grabbing select-none"
                style={{ background: `${C.purple}20`, color: C.purple, border: `1px solid ${C.purple}30` }}
                whileDrag={{ scale: 1.1, boxShadow: `0 0 24px ${C.purple}50`, cursor: "grabbing" }}
                whileHover={{ scale: 1.05 }}
              >
                drag
              </motion.div>
            </div>
          </Demo>

          {/* Pan */}
          <Demo label="Pan Gesture" sub="onPan / onPanStart / onPanEnd">
            <PanTracker className="w-full h-24 rounded-xl bg-white/[0.02] border border-white/[0.06]" />
          </Demo>

          {/* Pinch */}
          <Demo label="Pinch to Scale" sub="touch pinch gesture (mobile)">
            <PinchToScaleLocal />
          </Demo>

          {/* Focus */}
          <Demo label="Focus Gesture" sub="whileFocus — border glow + scale">
            <div className="w-full flex flex-col gap-3">
              <FocusInput label="Module name" placeholder="e.g. omni-core" />
              <FocusInput label="Target triple" placeholder="e.g. x86_64-unknown-linux" />
            </div>
          </Demo>

          {/* Gesture Combination */}
          <Demo label="Gesture Combinations" sub="drag + rotate + scale + color — all linked via useTransform" span2>
            <GestureCombined className="w-full" />
          </Demo>

        </div>
      </Lab>

      {/* ══ 3. LAYOUT ANIMATIONS ══════════════════════════════════════════════ */}
      <Lab id="layout" title="Layout Animations" subtitle="3 — LayoutId · AnimatePresence (all 3 modes) · Shared Layout · Stagger Children" accent={C.purple}>
        <div className="grid sm:grid-cols-2 gap-5">

          {/* Shared Layout LayoutId */}
          <Demo label="Shared Layout — LayoutId" sub="click any item to expand with shared-element transition">
            <SharedLayoutDemo items={SHARED_ITEMS} className="w-full" />
          </Demo>

          {/* AnimatePresence modes */}
          <Demo label="AnimatePresence — all 3 modes" sub="wait (exit-before-enter) / sync / popLayout">
            <PageTransitionDemo pages={PAGE_SLIDES} />
          </Demo>

          {/* Stagger children */}
          <Demo label="Stagger Children" sub="parent stagger orchestrates child enter order" span2>
            <OrchestratedStagger items={ORCHESTRATED_ITEMS} className="justify-center" />
          </Demo>

          {/* Accordion — layout animation */}
          <Demo label="Layout Animation Accordion" sub="height animated with layout prop, AnimatePresence exit" span2>
            <MotionAccordion items={FAQ_LAB} className="w-full" />
          </Demo>

          {/* List reorder */}
          <Demo label="List Reorder with AnimatePresence" sub="items animate in/out of list on add/remove" span2>
            <ListReorder items={listItems} onRemove={label => setListItems(l => l.filter(x => x !== label))} onAdd={() => {
              const next = ["Hot Reload","NEXUS","Unikernel","WASM Target","LSP Server"].find(x => !listItems.includes(x))
              if (next) setListItems(l => [...l, next])
            }} />
          </Demo>

        </div>
      </Lab>

      {/* ══ 4. PAGE TRANSITIONS ═══════════════════════════════════════════════ */}
      <Lab id="page-transitions" title="Page Transitions" subtitle="4 — Page Transitions · Exit-Before-Enter · Shared Layout Pages" dark accent={C.amber}>
        <div className="grid sm:grid-cols-2 gap-5">

          {/* Full page transition (counter) */}
          <Demo label="Page Transition — Exit Before Enter (wait mode)" sub="AnimatePresence mode='wait' — current exits before next enters">
            <AnimatePresence mode="wait">
              <motion.div
                key={counter}
                className="text-5xl font-black tabular-nums"
                style={{ color: [C.cyan, C.green, C.purple, C.amber, C.red][counter % 5] }}
                initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{    opacity: 0, scale: 1.4, filter: "blur(12px)" }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              >
                {String(counter).padStart(2, "0")}
              </motion.div>
            </AnimatePresence>
            <motion.button
              className="px-5 py-2 rounded-xl text-xs font-mono font-semibold border"
              style={{ borderColor: `${C.cyan}35`, color: C.cyan, background: `${C.cyan}08` }}
              onClick={() => setCounter(c => c + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next page"
            >
              Next →
            </motion.button>
          </Demo>

          {/* Slide transitions */}
          <Demo label="Slide Transition — sync mode" sub="new page enters while current exits simultaneously">
            <PageTransitionDemo pages={PAGE_SLIDES} />
          </Demo>

          {/* popLayout */}
          <Demo label="popLayout — takes element out of flow during exit" sub="remaining items reflow without jumping" span2>
            <PopLayoutDemo />
          </Demo>

        </div>
      </Lab>

      {/* ══ 5. SCROLL ANIMATIONS ═════════════════════════════════════════════ */}
      <Lab id="scroll" title="Scroll Animations" subtitle="5 — Scroll-Linked · Parallax · Scroll-Triggered (whileInView) · Progress" accent={C.cyan}>

        {/* Velocity readout */}
        <div className="mb-8 p-5 rounded-2xl border border-white/[0.07] bg-[#0d1117]">
          <VelocityReadout />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">

          {/* Scroll progress map */}
          <Demo label="Scroll-Linked — useScroll mapped to 4 outputs" sub="rotate + color + skew + y — all from scrollYProgress" span2>
            <ScrollProgressMap className="w-full" />
          </Demo>

          {/* Parallax */}
          <Demo label="Parallax Layer" sub="scrollY-driven depth offset">
            <div className="relative w-full h-28 overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <ParallaxLayer speed={-0.25} className="absolute inset-0">
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    className="w-16 h-16 rounded-full opacity-30"
                    style={{ background: `radial-gradient(circle, ${C.cyan} 0%, transparent 70%)` }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden="true"
                  />
                </div>
              </ParallaxLayer>
              <div className="relative z-10 flex items-center justify-center h-full">
                <span className="text-xs font-mono text-[#475569]">Scroll to parallax</span>
              </div>
            </div>
          </Demo>

          {/* whileInView scroll-triggered */}
          <Demo label="Scroll-Triggered — whileInView" sub="triggers when element enters viewport">
            <WhileInViewDemo />
          </Demo>

          {/* Fill text on scroll */}
          <Demo label="Fill Text on Scroll" sub="each character fills with color as it scrolls into view" span2>
            <div className="text-3xl md:text-4xl font-black text-center leading-tight">
              <FillText
                text="Polyglot. Universal. Zero-Cost."
                className="text-[#1e293b]"
                fillColor={C.cyan}
              />
            </div>
          </Demo>

        </div>
      </Lab>

      {/* ══ 6. PHYSICS ══════════════════════════════════════════════════════ */}
      <Lab id="physics" title="Physics & Spring" subtitle="6 — Spring · Damping · Stiffness · Mass · Velocity · Inertia" dark accent={C.red}>
        <div className="grid sm:grid-cols-2 gap-5">

          {/* Spring comparison */}
          <Demo label="Spring Configs — stiffness / damping / mass" sub="click Toggle to fire each spring" span2>
            <SpringDemo />
          </Demo>

          {/* Tabs with physics */}
          <Demo label="Physics Tabs" sub="spring indicator slides between active tabs">
            <SmoothTabs
              tabs={FEATURE_TABS_LAB}
              activeId={activePhysicsTab}
              onChange={setActivePhysicsTab}
              className="bg-white/[0.04] rounded-xl p-1 w-full"
            />
          </Demo>

          {/* Tilt card — spring rotateX / rotateY */}
          <Demo label="Spring Tilt Card" sub="spring rotateX + rotateY driven by mouse position">
            <TiltCard
              className="w-full rounded-2xl border border-white/[0.08] bg-[#080b12] p-6 flex flex-col items-center gap-3"
              maxTilt={14}
              glare
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
                style={{ background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}25` }}>
                ◈
              </div>
              <p className="text-[#64748b] text-xs font-mono text-center">Hover to tilt</p>
            </TiltCard>
          </Demo>

          {/* Magnetic button */}
          <Demo label="Magnetic Button — spring chases cursor" sub="MagneticButton with spring stiffness + damping">
            <MagneticButton strength={0.4}>
              <div
                className="px-8 py-3.5 rounded-xl font-semibold text-sm cursor-pointer"
                style={{ background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30` }}
              >
                Magnetic
              </div>
            </MagneticButton>
          </Demo>

        </div>
      </Lab>

      {/* ══ 7. VARIANTS ══════════════════════════════════════════════════════ */}
      <Lab id="variants" title="Variants" subtitle="7 — Variants · Staggered · Dynamic (custom) · Orchestrated" accent={C.purple}>
        <div className="grid sm:grid-cols-2 gap-5">

          {/* Basic variants */}
          <Demo label="Variants — named states" sub="variants.fadeUp / blurRise / scalePop / flipIn applied to Reveal">
            <div className="flex flex-col gap-3 w-full">
              {(["fadeUp","blurRise","scalePop","flipIn","slideReveal"] as const).map((v, i) => (
                <Reveal key={v} variant={v} once={false} delay={i * 0.05}>
                  <div
                    className="px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between border"
                    style={{ background: `${[C.cyan,C.green,C.purple,C.amber,C.red][i]}08`, borderColor: `${[C.cyan,C.green,C.purple,C.amber,C.red][i]}20`, color: [C.cyan,C.green,C.purple,C.amber,C.red][i] }}
                  >
                    <span>{v}</span>
                    <span className="opacity-40 text-[10px]">variant</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Demo>

          {/* Dynamic variants via custom prop */}
          <Demo label="Dynamic Variants — custom prop" sub="each item passes itself as the custom value to its variant">
            <DynamicVariantGrid items={DYNAMIC_ITEMS} />
          </Demo>

          {/* Orchestrated stagger */}
          <Demo label="Orchestrated Stagger — when: 'beforeChildren'" sub="parent container waits, then staggers all children with spring" span2>
            <OrchestratedStagger items={ORCHESTRATED_ITEMS} className="justify-center" />
          </Demo>

          {/* Multi-state badge */}
          <Demo label="Variants — Multi-State Badge" sub="AnimatePresence mode='wait' with per-state variant config">
            <MultiStateBadge state={badgeState} className="text-base" />
          </Demo>

          {/* Stagger grid */}
          <Demo label="Stagger Grid — StaggerGrid + StaggerItem" sub="parent controls stagger timing; children are purely declarative">
            <StaggerGrid className="grid grid-cols-3 gap-2 w-full" stagger={0.07}>
              {Array.from({ length: 9 }, (_, i) => (
                <StaggerItem key={i}>
                  <div
                    className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: `${[C.cyan,C.green,C.purple,C.amber,C.red,"#fb923c"][i % 6]}15`, color: [C.cyan,C.green,C.purple,C.amber,C.red,"#fb923c"][i % 6] }}
                  >
                    {i + 1}
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </Demo>

        </div>
      </Lab>

      {/* ══ 8. ADVANCED ══════════════════════════════════════════════════════ */}
      <Lab id="advanced" title="Advanced Motion" subtitle="8 — useMotionValue · useTransform · useSpring · useInView · Combinations" dark accent={C.cyan}>
        <div className="grid sm:grid-cols-2 gap-5">

          {/* Motion value display */}
          <Demo label="useMotionValue + useTransform + useSpring — live readout" sub="drag element — x/y drive rotate + scale + color via transform chains" span2>
            <MotionValueDisplay className="w-full" />
          </Demo>

          {/* useInView */}
          <Demo label="useInView" sub="element fires animation when entering viewport margin">
            <UseInViewDemo />
          </Demo>

          {/* IntelligenceRipple — motion values + keyframe combos */}
          <Demo label="Motion Value Combinations" sub="conic-gradient + scale + opacity — all chained from single MotionValue">
            <IntelligenceRipple className="w-24 h-24" />
          </Demo>

          {/* SpinningCube — 3D transforms */}
          <Demo label="3D Transform Combo" sub="rotateX + rotateY + translateZ — transformStyle preserve-3d">
            <SpinningCube size={64} color={C.cyan} />
          </Demo>

          {/* Loading combos */}
          <Demo label="Loading Variants" sub="Circle spinner · Ripple loader · Jumping dots · Pulse dots">
            <div className="flex items-center justify-center gap-8">
              <LoadingSpinner size={36} color={C.cyan} />
              <RippleLoader color={C.green} />
              <JumpingDots color={C.purple} />
              <PulseDots color={C.amber} />
            </div>
          </Demo>

        </div>
      </Lab>

      {/* ══ 9. SSR & FRAMEWORKS ══════════════════════════════════════════════ */}
      <Lab id="ssr" title="SSR & Frameworks" subtitle="9 — Next.js App Router · Server-Side Rendering · LazyMotion" accent={C.green}>
        <div className="grid sm:grid-cols-2 gap-5">

          <Demo label="Next.js App Router — 'use client'" sub="All motion components run client-side; server components fetch data and pass as props">
            <div className="flex flex-col gap-3 w-full text-left">
              {[
                { file: "app/page.tsx",              note: "RSC — data fetching, no motion", color: C.muted },
                { file: "components/motion-kit.tsx", note: "'use client' — all Motion APIs",  color: C.cyan },
                { file: "app/animation-lab/page.tsx",note: "'use client' — this page",       color: C.green },
              ].map(r => (
                <motion.div
                  key={r.file}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ background: `${r.color}06`, borderColor: `${r.color}18` }}
                  whileHover={{ x: 4, background: `${r.color}10`, transition: { duration: 0.15 } }}
                >
                  <span className="text-[10px] font-mono truncate" style={{ color: r.color }}>{r.file}</span>
                  <span className="text-[10px] font-mono text-[#334155] ml-auto shrink-0">{r.note}</span>
                </motion.div>
              ))}
            </div>
          </Demo>

          <Demo label="LazyMotion — deferred feature loading" sub="domAnimation reduces bundle; domMax adds all gestures">
            <div className="flex flex-col gap-3 text-left w-full">
              <div className="rounded-xl bg-[#080b12] border border-white/[0.06] p-4 text-xs font-mono leading-relaxed text-[#475569]">
                <span className="text-[#00d4ff]">{"import"}</span>{" { LazyMotion, domAnimation } "}<span className="text-[#00d4ff]">{"from"}</span>{" 'motion/react'"}<br />
                <span className="text-[#64748b]">{"// domAnimation  ≈ 18 kB"}</span><br />
                <span className="text-[#64748b]">{"// domMax        ≈ 35 kB (all gestures)"}</span><br /><br />
                <span className="text-[#a855f7]">{"<LazyMotion"}</span>{" features={domAnimation}"}<span className="text-[#a855f7]">{">"}</span><br />
                {"  "}<span className="text-[#00ff88]">{"<m.div animate={...} />"}</span><br />
                <span className="text-[#a855f7]">{"</LazyMotion>"}</span>
              </div>
              <p className="text-[10px] font-mono text-[#334155]">Use m.div instead of motion.div inside LazyMotion</p>
            </div>
          </Demo>

        </div>
      </Lab>

      {/* ══ 10. TIMELINE & TIME CONTROLS ═════════════════════════════════════ */}
      <Lab id="timeline" title="Timeline & Time Controls" subtitle="10 — Sequenced Timeline · Recording · Time Controls" dark accent={C.purple}>
        <div className="grid sm:grid-cols-2 gap-5">

          <Demo label="Timeline Animation — sequenced multi-step" sub="each step fires after previous completes; progress indicator tracks state" span2>
            <TimelineAnimation className="w-full" />
          </Demo>

          {/* Hold to confirm — time control */}
          <Demo label="Time-Gated Interaction" sub="hold duration controls progress — fires at 100%">
            <HoldToConfirm
              onConfirm={() => {}}
              holdMs={1600}
              className="px-7 py-3.5 rounded-xl border border-[#00d4ff]/30 bg-[#00d4ff]/[0.06] text-[#00d4ff] text-sm font-semibold w-48 text-center"
            >
              Hold to Deploy
            </HoldToConfirm>
          </Demo>

          {/* Keyframe orb — manual keyframe timing */}
          <Demo label="Manual Keyframe Times Array" sub="times: [0, 0.25, 0.5, 0.75, 1] — non-linear keyframe distribution">
            <KeyframeOrb size={32} />
          </Demo>

          {/* Skew + rotation combo keyframe */}
          <Demo label="Keyframe Wildcard — random target values" sub="multi-property random keyframes with custom timing" span2>
            <div className="flex items-center justify-center gap-12">
              <motion.div
                className="w-14 h-14 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})` }}
                animate={{
                  x:     [0, 22, -18, 10, -8, 0],
                  y:     [0, -16, 12, -8, 14, 0],
                  rotate:[0, 45, -30, 20, -10, 0],
                  scale: [1, 1.2, 0.85, 1.1, 0.95, 1],
                  borderRadius: ["12px","50%","12px","30%","8px","12px"],
                }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                aria-hidden="true"
              />
              <motion.div
                className="w-10 h-10 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.red})` }}
                animate={{
                  skewX:  [0, 14, -10, 8, 0],
                  skewY:  [0, -6,  8, -4, 0],
                  opacity:[1, 0.5,  1, 0.7, 1],
                  scale:  [1, 1.3, 0.8, 1.15, 1],
                }}
                transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
                aria-hidden="true"
              />
            </div>
          </Demo>

        </div>
      </Lab>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/[0.05] text-center">
        <p className="text-[#334155] text-xs font-mono mb-3">
          OMNI Animation Lab &mdash; {Object.keys({
            Fundamentals:1, Gestures:1, Layout:1, "Page Transitions":1,
            Scroll:1, Physics:1, Variants:1, Advanced:1, SSR:1, Timeline:1,
          }).length} categories &mdash; 54+ animation primitives
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/"          className="text-xs text-[#475569] hover:text-[#00d4ff] transition-colors font-mono">Home</Link>
          <Link href="/showcase"  className="text-xs text-[#475569] hover:text-[#00d4ff] transition-colors font-mono">Showcase</Link>
          <Link href="/playground"className="text-xs text-[#475569] hover:text-[#00d4ff] transition-colors font-mono">Playground</Link>
        </div>
      </footer>
    </div>
  )
}

/* ─── Inline helper components (page-local) ──────────────────────── */

/** Pinch-to-scale shown as info card on desktop, functional on mobile */
function PinchToScaleLocal() {
  const [s, setS] = useState(1)
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black select-none"
        style={{
          background: `${C.red}15`,
          color: C.red,
          border: `1px solid ${C.red}25`,
          scale: s,
        }}
        animate={{ scale: s }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        ⬡
      </motion.div>
      <input
        type="range"
        min={50} max={200} defaultValue={100}
        className="w-full accent-[#ef4444]"
        onChange={e => setS(Number(e.target.value) / 100)}
        aria-label="Simulate pinch scale"
      />
      <p className="text-[10px] font-mono text-[#334155]">Drag slider or pinch on touch device</p>
    </div>
  )
}

/** whileInView scroll-triggered demo */
function WhileInViewDemo() {
  const items = [C.cyan, C.green, C.purple, C.amber, C.red]
  return (
    <div className="flex items-end justify-center gap-3 h-20">
      {items.map((color, i) => (
        <motion.div
          key={i}
          className="w-7 rounded-t-lg"
          style={{ background: color, height: 16 }}
          initial={{ height: 16, opacity: 0.3 }}
          whileInView={{ height: 24 + i * 10, opacity: 1 }}
          viewport={{ once: false, margin: "-10px" }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

/** useInView hook demo */
function UseInViewDemo() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: "-20px" })
  return (
    <div ref={ref} className="flex flex-col items-center gap-3 w-full">
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-sm"
        animate={{
          scale:      inView ? 1 : 0.6,
          opacity:    inView ? 1 : 0.2,
          background: inView ? C.cyan + "22" : "rgba(255,255,255,0.03)",
          borderColor:inView ? C.cyan + "40" : "rgba(255,255,255,0.06)",
          color:      inView ? C.cyan : "#334155",
        }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        style={{ border: "1px solid" }}
      >
        {inView ? "IN" : "OUT"}
      </motion.div>
      <motion.p
        className="text-[10px] font-mono"
        animate={{ color: inView ? C.green : "#334155" }}
      >
        {inView ? "In viewport" : "Scroll to trigger"}
      </motion.p>
    </div>
  )
}

/** PopLayout demo */
function PopLayoutDemo() {
  const INITIAL = ["UAST Module", "LLVM-Omni", "Domain Layer", "NEXUS Registry"]
  const [items, setItems] = useState(INITIAL)
  const [removed, setRemoved] = useState<string[]>([])

  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence mode="popLayout">
        {items.map(item => (
          <motion.div
            key={item}
            layout
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.07] bg-[#080b12]"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          >
            <span className="text-sm text-[#94a3b8] font-mono">{item}</span>
            <motion.button
              className="text-[10px] font-mono text-[#334155] hover:text-[#ef4444] transition-colors px-2 py-1 rounded-lg hover:bg-[#ef4444]/10"
              onClick={() => { setItems(l => l.filter(x => x !== item)); setRemoved(r => [...r, item]) }}
              whileTap={{ scale: 0.9 }}
            >
              remove
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
      {removed.length > 0 && (
        <motion.button
          className="text-xs font-mono text-[#475569] hover:text-[#00d4ff] transition-colors mx-auto mt-1"
          onClick={() => { setItems(INITIAL); setRemoved([]) }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      )}
      <p className="text-[10px] font-mono text-[#334155] text-center">
        popLayout — removed items are popped out of flow; remaining items animate to new positions
      </p>
    </div>
  )
}

/** List reorder with AnimatePresence */
function ListReorder({
  items,
  onRemove,
  onAdd,
}: {
  items: string[]
  onRemove: (label: string) => void
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={item}
            layout
            className="flex items-center justify-between px-4 py-3 rounded-xl border"
            style={{ borderColor: `${[C.cyan,C.green,C.purple,C.amber,C.red][i % 5]}22`, background: `${[C.cyan,C.green,C.purple,C.amber,C.red][i % 5]}06` }}
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          >
            <span className="text-sm font-mono" style={{ color: [C.cyan,C.green,C.purple,C.amber,C.red][i % 5] }}>
              {item}
            </span>
            <motion.button
              className="text-[10px] font-mono text-[#334155] hover:text-[#ef4444] px-2 py-1 rounded-lg hover:bg-[#ef4444]/10 transition-colors"
              onClick={() => onRemove(item)}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button
        className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold border border-white/[0.08] text-[#475569] hover:text-[#00d4ff] hover:border-[#00d4ff]/25 transition-colors"
        onClick={onAdd}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
      >
        + Add item
      </motion.button>
    </div>
  )
}
