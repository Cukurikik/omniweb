import type { Metadata } from 'next'
import './globals.css'
import { PageTransition } from '@/components/page-transition'

export const metadata: Metadata = {
  title: 'OMNI Framework — 15 Languages. 1 Universal AST.',
  description:
    "OMNI is the world's first polylingual runtime. Use Rust for crypto, Go for HTTP, Python for ML — in one file. Powered by LLVM-Omni and UAST.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#080b12]">
      <body className="font-sans antialiased bg-[#080b12] text-[#e2e8f0] min-h-screen overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
