"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { applyPromotions } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
export default function PromotionEntry({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const codes = (cart.promotions ?? []).flatMap((promotion) =>
    promotion.code ? [promotion.code] : []
  )
  const update = async (next: string[]) => {
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await applyPromotions(next)
      notifyCartUpdated()
      router.refresh()
      setMessage("Promotion codes updated.")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't apply that code. Please try again."
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="basket-promotion">
      <button
        className="basket-promotion-toggle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        data-testid="add-discount-button"
      >
        <span>Have a promotion code?</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            const form = event.currentTarget
            const code = String(new FormData(form).get("code") ?? "").trim()
            if (code) {
              await update(Array.from(new Set([...codes, code])))
              form.reset()
            }
          }}
        >
          <label className="sr-only" htmlFor="basket-promotion-code">
            Promotion code
          </label>
          <div>
            <input
              id="basket-promotion-code"
              name="code"
              placeholder="Enter your code"
              required
              maxLength={100}
              disabled={busy}
              data-testid="discount-input"
            />
            <button disabled={busy} data-testid="discount-apply-button">
              {busy ? "Applying…" : "Apply"}
            </button>
          </div>
        </form>
      )}
      {(cart.promotions ?? []).map((promotion) => (
        <div className="basket-promotion-applied" key={promotion.id}>
          <span>{promotion.code || "Automatic promotion"}</span>
          {!promotion.is_automatic && promotion.code && (
            <button
              disabled={busy}
              aria-label={`Remove promotion ${promotion.code}`}
              onClick={() =>
                update(codes.filter((code) => code !== promotion.code))
              }
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className="basket-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="basket-promotion-feedback">
          {message}
        </p>
      )}
    </div>
  )
}
