import { listContent } from "@lib/data/content"
import { getSiteOrigin } from "@lib/util/site"
import ContentBlocks from "@modules/content/blocks"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import PageContent from "@modules/content/page-content"

type Props = { params: Promise<{ slug: string; countryCode: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, countryCode } = await params
  const [post] = await listContent("post", slug)
  if (!post) return {}
  return {
    title: post.seoTitle || post.title,
    description: post.description || post.excerpt,
    alternates: {
      canonical: `${await getSiteOrigin()}/${countryCode}/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.cover ? [post.cover] : [],
    },
  }
}
export default async function Post({ params }: Props) {
  const { slug, countryCode } = await params
  const [post] = await listContent("post", slug)
  if (!post) notFound()
  if (post.layout)
    return <PageContent content={post} countryCode={countryCode} />
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.cover || undefined,
    url: `${await getSiteOrigin()}/${countryCode}/blog/${slug}`,
    author: { "@type": "Organization", name: "Form & Field" },
  }
  return (
    <article className="content-container py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="max-w-3xl mx-auto text-center mb-12">
        <p className="field-eyebrow">The journal</p>
        <h1 className="field-display my-6">{post.title}</h1>
        <p className="text-lg text-gray-600">{post.excerpt}</p>
      </header>
      {post.cover && (
        <img
          src={post.cover}
          alt=""
          className="w-full max-h-[600px] object-cover mb-16"
        />
      )}
      <div className="max-w-3xl mx-auto">
        <ContentBlocks blocks={post.blocks} />
      </div>
    </article>
  )
}
