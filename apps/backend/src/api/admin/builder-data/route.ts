import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { data } = await req.scope
    .resolve(ContainerRegistrationKeys.QUERY)
    .graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "metadata",
        "variants.prices.*",
      ],
      pagination: { take: 100 },
    })
  const products = data.map((p) => ({
    id: p.id,
    title: p.title,
    image: p.thumbnail,
    href: `/products/${p.handle}`,
    category: p.metadata?.category ?? "home",
    price: "Catalog preview",
  }))
  res.json({ products })
}
