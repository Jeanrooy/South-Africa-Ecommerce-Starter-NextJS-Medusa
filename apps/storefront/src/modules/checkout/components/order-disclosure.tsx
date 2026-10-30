"use client"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { convertToLocale } from "@lib/util/money"
export default function OrderDisclosure({
  count,
  total,
  currencyCode,
  children,
}: {
  count: number
  total: number
  currencyCode: string
  children: ReactNode
}) {
  const details = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (details.current && window.matchMedia("(max-width: 767px)").matches)
      details.current.open = false
  }, [])
  return (
    <details open ref={details} className="checkout-summary-details">
      <summary>
        <span>
          <span className="basket-eyebrow">GOOD THINGS, CHOSEN BY YOU</span>
          <strong>
            Your order{" "}
            <small>
              ({count} {count === 1 ? "item" : "items"})
            </small>
          </strong>
          <span className="checkout-summary-collapsed-total">
            {convertToLocale({ amount: total, currency_code: currencyCode })}{" "}
            <small>View order details</small>
          </span>
        </span>
        <span className="checkout-summary-toggle" aria-hidden="true">
          ⌄
        </span>
      </summary>
      {children}
    </details>
  )
}
