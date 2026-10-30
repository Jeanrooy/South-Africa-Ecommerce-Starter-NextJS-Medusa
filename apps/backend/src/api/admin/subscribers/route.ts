import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cms } from "../../../lib/cms"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const subscribers = await cms.subscriber.findMany({
    select: { id: true, email: true, consentAt: true, confirmedAt: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  })
  res.json({ subscribers })
}
