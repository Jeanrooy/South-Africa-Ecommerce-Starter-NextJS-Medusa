import "server-only"
import { sdk } from "@lib/config"
import type { BuilderData } from "@ecom/page-builder"

export type ContentBlock =
  | { type: "text"; heading: string; body: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "cta"; heading: string; body: string; label: string; href: string }

export type Content = {
  id: string
  kind: "page" | "post"
  slug: string
  title: string
  excerpt: string
  cover: string
  seoTitle: string
  description: string
  blocks: ContentBlock[]
  layout?: BuilderData | null
  publishedAt: string
  updatedAt: string
}

export async function listContent(
  kind: "page" | "post",
  slug?: string
): Promise<Content[]> {
  const result = await sdk.client.fetch<{ content: Content[] }>(
    "/store/content",
    { query: { kind, ...(slug ? { slug } : {}) }, next: { revalidate: 60 } }
  )
  return result.content
}
