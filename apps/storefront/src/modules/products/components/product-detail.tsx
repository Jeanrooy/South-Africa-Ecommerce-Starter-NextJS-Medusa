"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"
import { isVariantInStock } from "@lib/util/inventory"
import { notifyCartUpdated } from "@lib/util/cart-events"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPrice from "./product-price"

const variantOptions = (variant?: HttpTypes.StoreProductVariant) =>
  Object.fromEntries(
    (variant?.options ?? []).map((o) => [o.option_id, o.value])
  )
const swatches: Record<string, string> = {
  sand: "#d6cbb7",
  charcoal: "#4b4b45",
  forest: "#536651",
  terracotta: "#ad6c51",
  natural: "#ded5c2",
  oat: "#cfc5af",
  black: "#252721",
  white: "#f2eee3",
  clay: "#b98569",
  olive: "#7f8465",
  cream: "#e6dfcb",
  navy: "#354855",
}

function Gallery({
  images,
  title,
}: {
  images: { id: string; url: string }[]
  title: string
}) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const pointer = useRef<number | null>(null)
  const lastWheel = useRef(0)
  const active = Math.min(index, Math.max(0, images.length - 1))
  const move = (direction: number) =>
    setIndex((current) => (current + direction + images.length) % images.length)
  useEffect(() => {
    const node = stage.current
    const onWheel = (event: WheelEvent) => {
      if (images.length < 2 || Math.abs(event.deltaY) < 8) return
      const direction = event.deltaY > 0 ? 1 : -1
      if (
        (direction < 0 && active === 0) ||
        (direction > 0 && active === images.length - 1)
      )
        return
      event.preventDefault()
      if (Date.now() - lastWheel.current < 450) return
      lastWheel.current = Date.now()
      setIndex((current) =>
        Math.max(0, Math.min(images.length - 1, current + direction))
      )
    }
    node?.addEventListener("wheel", onWheel, { passive: false })
    return () => node?.removeEventListener("wheel", onWheel)
  }, [active, images.length])
  useEffect(() => {
    if (!zoom) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoom])
  if (!images.length)
    return (
      <div className="pdp-gallery-empty">Product photography coming soon.</div>
    )
  return (
    <div className="pdp-gallery">
      <div
        ref={stage}
        className="pdp-stage"
        role="region"
        aria-label={`${title} image gallery`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault()
            move(1)
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault()
            move(-1)
          }
        }}
        onPointerDown={(e) => {
          pointer.current = e.clientX
        }}
        onPointerUp={(e) => {
          if (
            pointer.current !== null &&
            Math.abs(e.clientX - pointer.current) > 45
          )
            move(e.clientX < pointer.current ? 1 : -1)
          pointer.current = null
        }}
      >
        <img
          data-testid="product-main-image"
          src={images[active].url}
          alt={`${title} — view ${active + 1}`}
          draggable={false}
          fetchPriority="high"
        />
        <button
          className="pdp-zoom"
          aria-label="Enlarge product image"
          onClick={() => setZoom(true)}
        >
          ＋
        </button>
        {images.length > 1 && (
          <div className="pdp-gallery-nav">
            <button
              aria-label="Previous product image"
              onClick={() => move(-1)}
            >
              ←
            </button>
            <span aria-live="polite">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
            <button aria-label="Next product image" onClick={() => move(1)}>
              →
            </button>
          </div>
        )}
      </div>
      <div className="pdp-thumbnails" aria-label="Product views">
        {images.map((image, i) => (
          <button
            key={image.id}
            aria-label={`Show product image ${i + 1}`}
            aria-pressed={active === i}
            className={active === i ? "selected" : ""}
            onClick={() => setIndex(i)}
          >
            <img
              src={image.url}
              alt={`${title} thumbnail ${i + 1}`}
              draggable={false}
            />
          </button>
        ))}
      </div>
      <p className="pdp-gallery-tip">
        Explore the details · scroll over the image, swipe, or use the arrows
      </p>
      {zoom && (
        <div
          className="pdp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          onClick={() => setZoom(false)}
        >
          <button
            autoFocus
            aria-label="Close enlarged image"
            onClick={() => setZoom(false)}
          >
            ×
          </button>
          <img
            src={images[active].url}
            alt={`${title} enlarged view ${active + 1}`}
          />
        </div>
      )}
    </div>
  )
}

export default function ProductDetail({
  product,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const initial =
    product.variants?.find(isVariantInStock) ?? product.variants?.[0]
  const [options, setOptions] = useState<Record<string, string>>(
    variantOptions(initial)
  )
  const [quantity, setQuantity] = useState(1)
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null)
  const [error, setError] = useState("")
  const [added, setAdded] = useState(false)
  const selected = useMemo(
    () =>
      product.variants?.find((variant) =>
        Object.entries(variantOptions(variant)).every(
          ([key, value]) => options[key] === value
        )
      ),
    [product.variants, options]
  )
  useEffect(() => {
    const variant = product.variants?.find((v) => v.id === params.get("v_id"))
    if (variant) setOptions(variantOptions(variant))
  }, [params, product.variants])
  const choose = (id: string, value: string) => {
    const next = { ...options, [id]: value }
    let variant = product.variants?.find((v) =>
      Object.entries(variantOptions(v)).every(([key, val]) => next[key] === val)
    )
    if (!variant)
      variant = product.variants?.find((v) => variantOptions(v)[id] === value)
    setOptions(variant ? variantOptions(variant) : next)
    setQuantity(1)
    setError("")
    setAdded(false)
    const url = new URL(window.location.href)
    if (variant) url.searchParams.set("v_id", variant.id)
    else url.searchParams.delete("v_id")
    window.history.replaceState(null, "", url)
  }
  const stock = isVariantInStock(selected)
  const max =
    selected?.manage_inventory && !selected.allow_backorder
      ? Math.max(1, Math.min(99, selected.inventory_quantity ?? 1))
      : 99
  const allImages = product.images ?? []
  const images = selected?.images?.length
    ? selected.images.map((image) => ({ id: image.id, url: image.url }))
    : allImages
  const metadata = product.metadata ?? {}
  const detail = (key: string, fallback: string) =>
    typeof metadata[key] === "string" ? (metadata[key] as string) : fallback
  const buy = async (mode: "cart" | "buy") => {
    if (!selected || !stock) return
    setBusy(mode)
    setError("")
    setAdded(false)
    try {
      await addToCart({ variantId: selected.id, quantity, countryCode })
      notifyCartUpdated()
      setAdded(true)
      if (mode === "buy") router.push(`/${countryCode}/checkout`)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "We couldn't add this item. Please try again."
      )
    } finally {
      setBusy(null)
    }
  }
  return (
    <>
      <div className="pdp-breadcrumb">
        <LocalizedClientLink href="/">Home</LocalizedClientLink>
        <span>/</span>
        <LocalizedClientLink href="/store">Shop</LocalizedClientLink>
        <span>/</span>
        <span>{product.title}</span>
      </div>
      <div className="pdp-layout" data-testid="product-container">
        <Gallery
          key={selected?.id ?? product.id}
          images={images}
          title={product.title}
        />
        <div className="pdp-info">
          <p className="pdp-eyebrow">
            {product.collection?.title ??
              detail("category_label", "THE EVERYDAY COLLECTION")}
          </p>
          <h1 data-testid="product-title">{product.title}</h1>
          <p className="pdp-intro">
            {detail(
              "short_description",
              product.subtitle ||
                "A thoughtful addition to the everyday. Designed for purpose, chosen for the long run."
            )}
          </p>
          <div className="pdp-pricing">
            <ProductPrice product={product} variant={selected} />
            <span className="pdp-tax-note">
              Final taxes calculated at checkout
            </span>
          </div>
          <div className="pdp-options">
            {product.options?.map((option) => (
              <fieldset key={option.id}>
                <legend>
                  {option.title} <strong>{options[option.id]}</strong>
                </legend>
                <div
                  className={
                    /colou?r/i.test(option.title ?? "")
                      ? "pdp-swatches"
                      : "pdp-sizes"
                  }
                >
                  {option.values?.map(({ value }) => {
                    const color = swatches[value.toLowerCase()]
                    const matches = product.variants?.filter(
                      (v) =>
                        variantOptions(v)[option.id] === value &&
                        Object.entries(options).every(
                          ([key, val]) =>
                            key === option.id || variantOptions(v)[key] === val
                        )
                    )
                    const unavailable = !matches?.some(isVariantInStock)
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${option.title}: ${value}${unavailable ? " (unavailable)" : ""}`}
                        aria-pressed={options[option.id] === value}
                        title={value}
                        onClick={() => choose(option.id, value)}
                        className={`${options[option.id] === value ? "selected" : ""} ${unavailable ? "unavailable" : ""}`}
                        disabled={!!busy}
                        style={
                          color && /colou?r/i.test(option.title ?? "")
                            ? { backgroundColor: color }
                            : undefined
                        }
                      >
                        {color && /colou?r/i.test(option.title ?? "") ? (
                          <span className="sr-only">{value}</span>
                        ) : (
                          value
                        )}
                        {color && options[option.id] === value && (
                          <span aria-hidden="true">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="pdp-stock" data-testid="product-availability">
            <span className={stock ? "available" : "sold-out"} />
            {!selected
              ? "This combination is unavailable"
              : stock
                ? selected.allow_backorder && !selected.inventory_quantity
                  ? "Available to order"
                  : "In stock · ready for your everyday"
                : "Currently out of stock"}
          </div>
          <div className="pdp-quantity">
            <span>Quantity</span>
            <div>
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || !!busy}
                onClick={() => setQuantity((q) => q - 1)}
              >
                −
              </button>
              <output aria-label="Product quantity">{quantity}</output>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= max || !!busy}
                onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              >
                +
              </button>
            </div>
            <small>{selected?.sku ? `SKU ${selected.sku}` : ""}</small>
          </div>
          <div className="pdp-purchase">
            <button
              data-testid="add-product-button"
              className="pdp-add"
              disabled={!selected || !stock || !!busy}
              onClick={() => buy("cart")}
            >
              {busy === "cart" ? "Adding…" : "Add to cart"} <span>＋</span>
            </button>
            <button
              className="pdp-buy"
              disabled={!selected || !stock || !!busy}
              onClick={() => buy("buy")}
            >
              {busy === "buy" ? "Opening checkout…" : "Buy now"} <span>↗</span>
            </button>
          </div>
          {error && (
            <p role="alert" className="pdp-error">
              {error}
            </p>
          )}
          {added && (
            <p role="status" className="pdp-success">
              Added to your bag.{" "}
              <LocalizedClientLink href="/cart">
                View cart →
              </LocalizedClientLink>
            </p>
          )}
          <div className="pdp-assurances">
            <span>◈ Secure checkout</span>
            <span>↗ Delivery options at checkout</span>
          </div>
          <div className="pdp-details">
            <details open>
              <summary>Description</summary>
              <p data-testid="product-description">{product.description}</p>
            </details>
            <details open>
              <summary>Materials & details</summary>
              <p>
                {detail(
                  "materials",
                  product.material ||
                    "See the product description for material details."
                )}
              </p>
              <dl>
                {product.weight ? (
                  <>
                    <dt>Weight</dt>
                    <dd>{product.weight} g</dd>
                  </>
                ) : null}
                {product.length ? (
                  <>
                    <dt>Length</dt>
                    <dd>{product.length} cm</dd>
                  </>
                ) : null}
                {product.width ? (
                  <>
                    <dt>Width</dt>
                    <dd>{product.width} cm</dd>
                  </>
                ) : null}
                {product.height ? (
                  <>
                    <dt>Height</dt>
                    <dd>{product.height} cm</dd>
                  </>
                ) : null}
              </dl>
            </details>
            <details>
              <summary>Care guide</summary>
              <p>
                {detail(
                  "care",
                  "Follow the care label supplied with your product. Contact us if you'd like more information before ordering."
                )}
              </p>
            </details>
            <details>
              <summary>Shipping & returns</summary>
              <p>
                Available delivery options and costs are calculated for your
                address at checkout. For handling times and return conditions,
                see our store policies.
              </p>
              <div className="pdp-policy-links">
                <LocalizedClientLink href="/shipping">
                  Shipping information ↗
                </LocalizedClientLink>
                <LocalizedClientLink href="/returns">
                  Returns policy ↗
                </LocalizedClientLink>
              </div>
            </details>
          </div>
        </div>
      </div>
    </>
  )
}
