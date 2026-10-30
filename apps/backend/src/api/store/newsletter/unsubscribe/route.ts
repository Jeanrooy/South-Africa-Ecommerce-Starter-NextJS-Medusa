import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cms } from "../../../../lib/cms"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const token = (req.body as { token?: string })?.token
  if (typeof token !== "string" || token.length > 100)
    return res.status(400).json({ message: "Invalid unsubscribe link" })
  await cms.subscriber.deleteMany({ where: { token } })
  res.json({ message: "You have been unsubscribed." })
}
