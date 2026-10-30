import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cms } from "../../../../lib/cms"
import { writeContent } from "../../../../lib/content-write"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  return writeContent(req, res, req.params.id)
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await cms.content.deleteMany({ where: { id: req.params.id } })
  res.status(200).json({ id: req.params.id, deleted: true })
}
