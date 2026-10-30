import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  NotificationTypes,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!
  )
const subjects: Record<string, string> = {
  "order-placed": "Thank you for your order",
  "customer-welcome": "Welcome to the store",
  "password-reset": "Reset your password",
  "newsletter-confirm": "Confirm your newsletter subscription",
  "order-shipped": "Your order is on its way",
}

export default class EmailProvider extends AbstractNotificationProviderService {
  static identifier = "ecom-email"
  protected logger: Logger
  protected options: { apiKey?: string; from: string; mode: string }

  constructor(
    { logger }: { logger: Logger },
    options: { apiKey?: string; from: string; mode: string }
  ) {
    super()
    this.logger = logger
    this.options = options
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const subject = subjects[notification.template]
    if (!subject)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown email template: ${notification.template}`
      )
    const data = notification.data ?? {}
    const html = `<div style="font-family:Georgia,serif;max-width:600px;margin:40px auto;padding:32px;background:#f7f5ef;color:#23352b"><p style="letter-spacing:4px">FORM & FIELD</p><h1>${escape(subject)}</h1><p>${escape(data.message)}</p>${data.url ? `<p><a href="${escape(data.url)}">${escape(data.label ?? "View details")}</a></p>` : ""}<p>Thoughtful things. Everyday living.</p>${data.unsubscribeUrl ? `<p><a href="${escape(data.unsubscribeUrl)}">Unsubscribe</a></p>` : ""}</div>`
    if (this.options.mode === "log") {
      // No recipients, reset tokens, or private order data in application logs.
      this.logger.info(
        `[email preview] template=${notification.template}; delivery disabled`
      )
      return { id: `preview-${Date.now()}` }
    }
    if (!this.options.apiKey)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "RESEND_API_KEY is required for email delivery"
      )
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.options.from,
        to: notification.to,
        subject,
        html,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Email delivery failed (${response.status})`
      )
    return (await response.json()) as { id: string }
  }
}
