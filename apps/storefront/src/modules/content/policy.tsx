import { listContent } from "@lib/data/content"
import ContentBlocks from "./blocks"
import PageContent from "./page-content"

export async function getPolicyContent(slug: string, countryCode = "za") {
  const [page] = await listContent("page", slug)
  if (!page) return null
  if (page.layout)
    return <PageContent content={page} countryCode={countryCode} />
  return (
    <article className="content-container max-w-3xl py-16">
      <h1 className="field-display mb-8">{page.title}</h1>
      {page.excerpt && <p>{page.excerpt}</p>}
      <ContentBlocks blocks={page.blocks} />
    </article>
  )
}
