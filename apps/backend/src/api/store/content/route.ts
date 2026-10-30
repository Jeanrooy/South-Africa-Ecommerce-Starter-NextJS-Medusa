import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cms } from "../../../lib/cms"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const kind = req.query.kind === "page" ? "page" : "post"
  const slug = typeof req.query.slug === "string" ? req.query.slug : undefined
  const rows = await cms.content.findMany({
    where: { published: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 100,
  })
  const content = rows
    .map(({ publishedSnapshot, ...row }) => ({
      ...row,
      ...(publishedSnapshot && typeof publishedSnapshot === "object"
        ? publishedSnapshot
        : {}),
      id: row.id,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    }))
    .filter((row) => row.kind === kind && (!slug || row.slug === slug))
  res.json({ content })
}
