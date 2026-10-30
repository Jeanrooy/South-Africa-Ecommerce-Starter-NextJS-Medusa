import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { cms } from "../lib/cms"

export default async function refreshDemoPhotography({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "thumbnail", "images.*", "metadata"],
  })
  const changes: Record<string, [string, string]> = {
    "sunday-lounge-chair": [
      "photo-1503602642458-232111445657",
      "photo-1567538096630-e0c55bd6374c",
    ],
    "everyday-stoneware-mug": [
      "photo-1578749556568-bc2c40e68b61",
      "photo-1514228742587-6b1558fcca3d",
    ],
    "gather-ceramic-vase": [
      "photo-1610701596007-11502861dcfa",
      "photo-1687191883721-257d8cad5b54",
    ],
    "weekender-canvas-bag": [
      "photo-1553062407-98eeb64c6a62",
      "photo-1544816155-12df9643f363",
    ],
    "market-day-tote": [
      "photo-1553062407-98eeb64c6a62",
      "photo-1544816155-12df9643f363",
    ],
  }
  for (const product of data) {
    const replacement = changes[product.handle ?? ""]
    if (
      !replacement ||
      !product.metadata?.demo_catalog ||
      !product.thumbnail?.includes(replacement[0])
    )
      continue
    await updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: product.id,
            thumbnail: product.thumbnail.replace(...replacement),
            images: product.images?.map((image) => ({
              id: image.id,
              url: image.url.replace(...replacement),
            })),
          },
        ],
      },
    })
  }
  const home = await cms.content.findUnique({
    where: { kind_slug: { kind: "page", slug: "home" } },
  })
  if (
    home?.layout &&
    home.version === 0 &&
    JSON.stringify(home.layout).includes("seed-")
  ) {
    const layout = JSON.parse(
      JSON.stringify(home.layout).replaceAll(
        "photo-1503602642458-232111445657",
        "photo-1567538096630-e0c55bd6374c"
      )
    )
    await cms.content.update({ where: { id: home.id }, data: { layout } })
  }
  await cms.$disconnect()
  console.log(
    "Updated untouched demo photography; variant/image associations preserved."
  )
}
