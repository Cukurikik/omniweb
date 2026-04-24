import { useEffect, useRef } from "react"

export function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible")
          obs.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export function useRevealAll() {
  useEffect(() => {
    const SELECTORS = [
      ".reveal",
      ".reveal-up",
      ".reveal-left",
      ".reveal-right",
      ".reveal-scale",
      ".reveal-blur",
      ".reveal-flip",
    ]
    const els = document.querySelectorAll<HTMLElement>(SELECTORS.join(", "))
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible")
        })
      },
      { threshold: 0.10, rootMargin: "0px 0px -40px 0px" }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}
