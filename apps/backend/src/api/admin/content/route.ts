import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cms } from "../../../lib/cms"
import { writeContent } from "../../../lib/content-write"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const content = await cms.content.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  })
  res.json({ content })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  return writeContent(req, res)
}
