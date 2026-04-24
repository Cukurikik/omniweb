"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { href: "/docs", label: "Docs" },
    { href: "/playground", label: "Playground" },
    { href: "/#architecture", label: "Architecture" },
    { href: "/#language", label: "Language" },
  ]

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        background: scrolled ? "rgba(3,7,18,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      <nav
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            border: "2px solid #00d4ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(0,212,255,0.4)",
            position: "relative",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#00d4ff",
              boxShadow: "0 0 8px #00d4ff",
            }} />
            <div style={{
              position: "absolute", inset: -4,
              border: "1px solid rgba(0,212,255,0.25)",
              borderRadius: "50%",
            }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f4ff", letterSpacing: "-0.02em" }}>
            OMNI
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#00d4ff",
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.25)",
            padding: "1px 6px", borderRadius: 4,
            letterSpacing: "0.05em",
          }}>v2.0.0</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/")
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "#00d4ff" : "#94a3b8",
                  background: active ? "rgba(0,212,255,0.08)" : "transparent",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href="https://github.com/omni-lang"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 13, fontWeight: 500, color: "#64748b",
              textDecoration: "none",
              padding: "6px 12px",
            }}
          >
            GitHub
          </a>
          <Link
            href="/docs"
            style={{
              fontSize: 13, fontWeight: 600,
              background: "linear-gradient(90deg, #00d4ff, #00ff88)",
              color: "#030712",
              padding: "7px 16px",
              borderRadius: 6,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  )
}
