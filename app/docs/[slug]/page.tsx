import { notFound } from "next/navigation"
import { getDocBySlug, ALL_DOCS } from "@/lib/docs-content"
import DocPage from "@/components/doc-page"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ALL_DOCS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = getDocBySlug(slug)
  if (!page) return {}
  return {
    title: `${page.title} — OMNI Docs`,
    description: page.description,
  }
}

export default async function DocSlugPage({ params }: Props) {
  const { slug } = await params
  const page = getDocBySlug(slug)
  if (!page) notFound()
  return <DocPage page={page} />
}
