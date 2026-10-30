import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cms } from "../../../../../lib/cms"
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const revisions = await cms.contentRevision.findMany({
    where: { contentId: req.params.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })
  res.json({ revisions })
}
