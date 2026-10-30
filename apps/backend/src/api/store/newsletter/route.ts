import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { cms } from "../../../lib/cms"

const schema = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  consent: z.literal(true),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Enter a valid email and accept newsletter updates." })
  const subscriber = await cms.subscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  })
  if (!subscriber.confirmedAt) {
    await req.scope.resolve(Modules.NOTIFICATION).createNotifications({
      to: subscriber.email,
      channel: "email",
      template: "newsletter-confirm",
      data: {
        message:
          "Confirm you'd like occasional stories, new arrivals and store updates.",
        label: "Confirm subscription",
        url: `${process.env.STOREFRONT_URL ?? "http://localhost:8000"}/${process.env.DEFAULT_COUNTRY ?? "za"}/newsletter?token=${encodeURIComponent(subscriber.token)}`,
        unsubscribeUrl: `${process.env.STOREFRONT_URL ?? "http://localhost:8000"}/${process.env.DEFAULT_COUNTRY ?? "za"}/newsletter?unsubscribe=true&token=${encodeURIComponent(subscriber.token)}`,
      },
    })
  }
  res.status(202).json({
    message: "If eligible, you'll receive a confirmation email shortly.",
  })
}
