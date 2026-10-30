"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function BasketItems({
  cart,
  compact = false,
  editable = true,
  onChanged,
  onNavigate,
}: {
  cart: HttpTypes.StoreCart
  compact?: boolean
  editable?: boolean
  onChanged?: () => Promise<void>
  onNavigate?: () => void
}) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null
  )
  const mutate = async (id: string, quantity?: number) => {
    setPending(id)
    setError(null)
    try {
      if (quantity === undefined) await deleteLineItem(id)
      else await updateLineItem({ lineId: id, quantity })
      notifyCartUpdated()
      await onChanged?.()
      router.refresh()
    } catch (err) {
      setError({
        id,
        message:
          err instanceof Error
            ? err.message
            : "We couldn't update your basket. Please try again.",
      })
    } finally {
      setPending(null)
    }
  }
  return (
    <ul
      className={`basket-items ${compact ? "basket-items-compact" : ""}`}
      aria-label="Basket items"
    >
      {[...(cart.items ?? [])]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((item) => {
          const image =
            item.variant?.images?.[0]?.url ??
            item.thumbnail ??
            item.variant?.product?.images?.[0]?.url
          const url = `/products/${item.product_handle}${item.variant_id ? `?v_id=${item.variant_id}` : ""}`
          const variant =
            item.variant?.options?.map((option) => option.value).join(" / ") ||
            item.variant_title ||
            item.variant?.title
          const busy = pending === item.id
          const money = (amount: number) =>
            convertToLocale({ amount, currency_code: cart.currency_code })
          return (
            <li
              className={`basket-line ${busy ? "basket-line-pending" : ""}`}
              key={item.id}
              data-testid="basket-line"
              aria-busy={busy}
            >
              <LocalizedClientLink
                href={url}
                onClick={onNavigate}
                className="basket-line-image"
                aria-label={`View ${item.product_title || item.title}`}
              >
                {image ? (
                  <img
                    src={image}
                    alt={item.product_title || item.title || "Product"}
                  />
                ) : (
                  <span aria-hidden="true">f&f</span>
                )}
              </LocalizedClientLink>
              <div className="basket-line-content">
                <div className="basket-line-heading">
                  <LocalizedClientLink
                    href={url}
                    onClick={onNavigate}
                    className="basket-line-title"
                  >
                    {item.product_title || item.title}
                  </LocalizedClientLink>
                  <span
                    className="basket-line-price"
                    data-testid="basket-line-total"
                  >
                    {money(item.total ?? item.unit_price * item.quantity)}
                  </span>
                </div>
                {variant && variant !== "Default variant" && (
                  <p className="basket-line-variant">{variant}</p>
                )}
                {!compact && (
                  <p className="basket-line-unit">
                    {money(item.unit_price)} each
                  </p>
                )}
                <div className="basket-line-controls">
                  {editable ? (
                    <div
                      className="basket-quantity"
                      aria-label={`Quantity for ${item.product_title || item.title}`}
                    >
                      <button
                        aria-label={`Decrease quantity for ${item.product_title || item.title}`}
                        disabled={!!pending || item.quantity <= 1}
                        onClick={() => mutate(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <output
                        aria-label={`Quantity of ${item.product_title || item.title}`}
                      >
                        {item.quantity}
                      </output>
                      <button
                        aria-label={`Increase quantity for ${item.product_title || item.title}`}
                        disabled={!!pending || item.quantity >= 99}
                        onClick={() => mutate(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="basket-line-count">
                      Qty {item.quantity}
                    </span>
                  )}
                  {editable && (
                    <button
                      className="basket-remove"
                      disabled={!!pending}
                      aria-label={`Remove ${item.product_title || item.title}`}
                      onClick={() => mutate(item.id)}
                    >
                      {busy ? "Updating…" : "Remove"}
                    </button>
                  )}
                </div>
                {error?.id === item.id && (
                  <p role="alert" className="basket-error">
                    {error.message}
                  </p>
                )}
              </div>
            </li>
          )
        })}
    </ul>
  )
}
