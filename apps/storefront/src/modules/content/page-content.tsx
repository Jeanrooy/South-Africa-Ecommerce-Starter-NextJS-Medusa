import type { Content } from "@lib/data/content"
import { listContent } from "@lib/data/content"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import ContentBlocks from "./blocks"
import VisualLayout from "./visual-layout"
export default async function PageContent({
  content,
  countryCode = "za",
}: {
  content: Content
  countryCode?: string
}) {
  if (!content.layout) return <ContentBlocks blocks={content.blocks} />
  const serialized = JSON.stringify(content.layout)
  const [catalog, articles] = await Promise.all([
    serialized.includes('"Products"')
      ? listProducts({ countryCode, queryParams: { limit: 100 } }).then(
          (r) => r.response.products
        )
      : [],
    serialized.includes('"Journal"') ? listContent("post") : [],
  ])
  return (
    <VisualLayout
      data={content.layout}
      context={{
        prefix: `/${countryCode}`,
        products: catalog
          .sort(
            (a, b) =>
              Number(!!b.metadata?.demo_catalog) -
              Number(!!a.metadata?.demo_catalog)
          )
          .map((product) => ({
            id: product.id,
            title: product.title,
            image: product.thumbnail ?? product.images?.[0]?.url ?? "",
            href: `/products/${product.handle}`,
            category: String(product.metadata?.category ?? "home"),
            subtitle: String(
              product.metadata?.category_label ?? "Everyday essentials"
            ),
            badge: String(product.metadata?.badge ?? ""),
            price: getProductPrice({ product }).cheapestPrice?.calculated_price,
          })),
        articles: articles.map((post) => ({
          id: post.id,
          title: post.title,
          image: post.cover,
          href: `/blog/${post.slug}`,
          subtitle: "FIELD NOTES",
        })),
      }}
    />
  )
}
