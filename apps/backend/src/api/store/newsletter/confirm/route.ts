import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cms } from "../../../../lib/cms"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const token = (req.body as { token?: string })?.token
  if (typeof token !== "string" || token.length > 100)
    return res.status(400).json({ message: "Invalid confirmation link" })
  const result = await cms.subscriber.updateMany({
    where: { token, confirmedAt: null },
    data: { confirmedAt: new Date() },
  })
  const existing =
    result.count ||
    (await cms.subscriber.count({
      where: { token, confirmedAt: { not: null } },
    }))
  if (!existing)
    return res.status(400).json({ message: "This link is invalid." })
  res.json({ message: "Your subscription is confirmed." })
}
