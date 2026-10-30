import { listContent } from "@lib/data/content"
import { getSiteOrigin } from "@lib/util/site"
import ContentBlocks from "@modules/content/blocks"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import PageContent from "@modules/content/page-content"

type Props = { params: Promise<{ slug: string; countryCode: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, countryCode } = await params
  const [page] = await listContent("page", slug)
  if (!page) return {}
  return {
    title: page.seoTitle || page.title,
    description: page.description || page.excerpt,
    alternates: {
      canonical: `${await getSiteOrigin()}/${countryCode}/pages/${slug}`,
    },
  }
}
export default async function Page({ params }: Props) {
  const { slug, countryCode } = await params
  const [page] = await listContent("page", slug)
  if (!page) notFound()
  if (page.layout)
    return <PageContent content={page} countryCode={countryCode} />
  return (
    <article className="content-container py-16">
      <header className="max-w-3xl mx-auto mb-12">
        <p className="field-eyebrow">Form & Field</p>
        <h1 className="field-display my-6">{page.title}</h1>
        <p className="text-gray-600">{page.excerpt}</p>
      </header>
      {page.cover && (
        <img
          src={page.cover}
          alt=""
          className="w-full max-h-[600px] object-cover mb-12"
        />
      )}
      <div className="max-w-3xl mx-auto">
        <ContentBlocks blocks={page.blocks} />
      </div>
    </article>
  )
}
