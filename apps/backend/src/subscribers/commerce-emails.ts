import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function commerceEmails({
  event,
  container,
}: SubscriberArgs<{
  id: string
  entity_id?: string
  token?: string
  actor_type?: string
}>) {
  const notifications = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const origin = process.env.STOREFRONT_URL ?? "http://localhost:8000"
  const country = process.env.DEFAULT_COUNTRY ?? "za"
  if (event.name === "auth.password_reset") {
    if (event.data.actor_type !== "customer") return
    await notifications.createNotifications({
      to: event.data.entity_id!,
      channel: "email",
      template: "password-reset",
      data: {
        message:
          "Use this link to choose a new password. If you didn't request this, you can ignore this email.",
        label: "Reset password",
        url: `${origin}/${country}/reset-password?token=${encodeURIComponent(event.data.token!)}&email=${encodeURIComponent(event.data.entity_id!)}`,
      },
    })
    return
  }
  const isOrder = event.name === "order.placed"
  const { data } = await query.graph({
    entity: isOrder ? "order" : "customer",
    fields: isOrder
      ? ["id", "email", "display_id"]
      : ["id", "email", "first_name"],
    filters: { id: event.data.id },
  })
  const record = data[0]
  if (!record?.email) return
  await notifications.createNotifications({
    to: record.email,
    channel: "email",
    template: isOrder ? "order-placed" : "customer-welcome",
    data: {
      message:
        isOrder && "display_id" in record
          ? `We've received order #${record.display_id}. We'll let you know when it's ready.`
          : `Hello ${"first_name" in record ? (record.first_name ?? "there") : "there"}, your account is ready.`,
      label: "Your account",
      url: `${origin}/${country}/account`,
    },
  })
}

export const config: SubscriberConfig = {
  event: ["order.placed", "customer.created", "auth.password_reset"],
  context: { subscriberId: "ecom-commerce-emails" },
}
