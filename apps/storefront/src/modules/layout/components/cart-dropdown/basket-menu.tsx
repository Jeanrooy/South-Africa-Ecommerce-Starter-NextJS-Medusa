"use client"
import { createPortal } from "react-dom"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { retrieveCart } from "@lib/data/cart"
import { CART_UPDATED_EVENT } from "@lib/util/cart-events"
import { convertToLocale } from "@lib/util/money"
import BasketItems from "@modules/cart/components/basket-items"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function BasketMenu({
  cart: initialCart,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const [cart, setCart] = useState(initialCart ?? null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 100, right: 16 })
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const sequence = useRef(0)
  const pathname = usePathname()
  const id = useId()
  const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const positionPanel = useCallback(() => {
    const rect = trigger.current?.getBoundingClientRect()
    const nav = trigger.current
      ?.closest("[data-store-header]")
      ?.getBoundingClientRect()
    if (rect)
      setPosition({
        top: Math.max(
          12,
          Math.min((nav?.bottom ?? rect.bottom) + 8, window.innerHeight - 180)
        ),
        right: Math.max(16, window.innerWidth - rect.right),
      })
  }, [])
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const show = () => {
    cancelClose()
    positionPanel()
    setOpen(true)
  }
  const hide = () => {
    cancelClose()
    setOpen(false)
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 220)
  }
  const load = useCallback(async () => {
    const request = ++sequence.current
    try {
      const result = await retrieveCart()
      if (request === sequence.current) setCart(result)
    } catch {
      /* Preserve the last known basket on a transient error. */
    }
  }, [])
  useEffect(() => {
    load()
    const updated = async () => {
      await load()
      if (!/\/(cart|checkout)(\/|$)/.test(window.location.pathname)) {
        positionPanel()
        setOpen(true)
      }
    }
    window.addEventListener(CART_UPDATED_EVENT, updated)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updated)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [load, positionPanel])
  useEffect(() => {
    setOpen(false)
    load()
  }, [pathname, load])
  useEffect(() => {
    if (!open) return
    const onOutside = (event: PointerEvent) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !trigger.current?.contains(event.target as Node)
      )
        setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    window.addEventListener("pointerdown", onOutside)
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", positionPanel)
    window.addEventListener("scroll", positionPanel, true)
    return () => {
      window.removeEventListener("pointerdown", onOutside)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", positionPanel)
      window.removeEventListener("scroll", positionPanel, true)
    }
  }, [open, positionPanel])
  return (
    <div
      className="basket-trigger-wrap"
      onMouseEnter={show}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={trigger}
        className="basket-trigger"
        data-testid="nav-cart-link"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={(event) => {
          if (open) hide()
          else {
            show()
            if (event.detail === 0)
              requestAnimationFrame(() =>
                panel.current
                  ?.querySelector<HTMLButtonElement>("button")
                  ?.focus()
              )
          }
        }}
      >
        Basket <span className="basket-count">{count}</span>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label="Your basket"
            className="basket-menu"
            data-testid="nav-cart-dropdown"
            style={{
              top: position.top,
              right: position.right,
              maxHeight: `calc(100dvh - ${position.top + 16}px)`,
            }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="basket-menu-heading">
              <div>
                <span className="basket-eyebrow">
                  GOOD THINGS, CHOSEN BY YOU
                </span>
                <h2>
                  Your basket <span>({count})</span>
                </h2>
              </div>
              <button aria-label="Close basket" onClick={hide}>
                ×
              </button>
            </div>
            {cart?.items?.length ? (
              <>
                <div className="basket-menu-list">
                  <BasketItems
                    cart={cart}
                    compact
                    onChanged={load}
                    onNavigate={hide}
                  />
                </div>
                <div className="basket-menu-footer">
                  <div className="basket-menu-subtotal">
                    <span>Items subtotal</span>
                    <strong data-testid="cart-subtotal">
                      {convertToLocale({
                        amount: cart.item_subtotal ?? cart.subtotal ?? 0,
                        currency_code: cart.currency_code,
                      })}
                    </strong>
                  </div>
                  <p>Delivery and taxes are calculated at checkout.</p>
                  <div className="basket-menu-actions">
                    <LocalizedClientLink
                      href="/cart"
                      className="basket-button-secondary"
                      onClick={hide}
                      data-testid="go-to-cart-button"
                    >
                      View basket
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/checkout"
                      className="basket-button"
                      onClick={hide}
                    >
                      Checkout <span>↗</span>
                    </LocalizedClientLink>
                  </div>
                </div>
              </>
            ) : (
              <div className="basket-menu-empty">
                <span className="basket-empty-mark">f&f</span>
                <h3>A little room for something good.</h3>
                <p>Your basket is empty. Find a new everyday favourite.</p>
                <LocalizedClientLink
                  href="/store"
                  className="basket-button"
                  onClick={hide}
                >
                  Explore the collection <span>↗</span>
                </LocalizedClientLink>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
