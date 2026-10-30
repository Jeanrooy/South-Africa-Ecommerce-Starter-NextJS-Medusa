import { Suspense } from "react"
import type { HttpTypes } from "@medusajs/types"
import BasketItems from "../components/basket-items"
import BasketTotals from "../components/basket-totals"
import DiscountCode from "../components/promotion-entry"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"

async function Recommendations({ cart }: { cart: HttpTypes.StoreCart }) {
  if (!cart.region) return null
  const {
    response: { products },
  } = await listProducts({
    regionId: cart.region.id,
    queryParams: { limit: 24 },
  })
  const inBasket = new Set(cart.items?.map((item) => item.product_id))
  const suggestions = products
    .filter((product) => !inBasket.has(product.id))
    .sort(
      (a, b) =>
        Number(!!b.metadata?.demo_catalog) - Number(!!a.metadata?.demo_catalog)
    )
    .slice(0, 4)
  if (!suggestions.length) return null
  return (
    <section className="basket-recommendations">
      <div className="basket-section-head">
        <div>
          <p className="basket-eyebrow">A LITTLE MORE TO LOVE</p>
          <h2>Good things, in good company.</h2>
        </div>
        <LocalizedClientLink href="/store">
          Explore the collection ↗
        </LocalizedClientLink>
      </div>
      <ul>
        {suggestions.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={cart.region!} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function BasketPage({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  return (
    <div className="basket-page content-container" data-testid="cart-container">
      <header className="basket-page-heading">
        <div>
          <p className="basket-eyebrow">THOUGHTFULLY CHOSEN. ALMOST YOURS.</p>
          <h1>
            Your basket<span>{count ? `(${count})` : ""}</span>
          </h1>
        </div>
        <LocalizedClientLink href="/store" className="basket-continue">
          ← Keep exploring
        </LocalizedClientLink>
      </header>
      {cart?.items?.length ? (
        <>
          <div className="basket-page-grid">
            <div className="basket-main">
              <div className="basket-list-head">
                <span>Your selection</span>
                <span>
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </div>
              <BasketItems cart={cart} />
              {!customer && (
                <div className="basket-signin">
                  <div>
                    <h2>A more personal everyday.</h2>
                    <p>
                      Sign in to save your details and view your orders. Guest
                      checkout is always welcome.
                    </p>
                  </div>
                  <LocalizedClientLink href="/account">
                    Sign in ↗
                  </LocalizedClientLink>
                </div>
              )}
              <div className="basket-care-note">
                <span aria-hidden="true">◇</span>
                <div>
                  <strong>Good things deserve a little care.</strong>
                  <p>
                    Find material and care notes on every product page, or
                    explore our{" "}
                    <LocalizedClientLink href="/pages/care-guide">
                      care guide
                    </LocalizedClientLink>
                    .
                  </p>
                </div>
              </div>
            </div>
            <aside className="basket-summary" aria-label="Order summary">
              <p className="basket-eyebrow">THE DETAILS</p>
              <h2>Order summary</h2>
              <BasketTotals cart={cart} />
              <div className="basket-discount">
                <DiscountCode cart={cart} />
              </div>
              <LocalizedClientLink
                href="/checkout"
                className="basket-button"
                data-testid="checkout-button"
              >
                Continue to checkout <span>↗</span>
              </LocalizedClientLink>
              <div className="basket-summary-assurance">
                <span>◈</span>
                <p>
                  Secure checkout. Your chosen payment method is confirmed
                  before you place the order.
                </p>
              </div>
              <div className="basket-summary-help">
                <LocalizedClientLink href="/shipping">
                  Delivery information
                </LocalizedClientLink>
                <LocalizedClientLink href="/returns">
                  Returns & care
                </LocalizedClientLink>
              </div>
            </aside>
          </div>
          <Suspense fallback={null}>
            <Recommendations cart={cart} />
          </Suspense>
        </>
      ) : (
        <section className="basket-empty-page">
          <div>
            <span className="basket-empty-mark">f&f</span>
            <p className="basket-eyebrow">A LITTLE ROOM FOR SOMETHING GOOD</p>
            <h2>
              Find your next
              <br />
              <em>everyday favourite.</em>
            </h2>
            <p>
              Your basket is waiting for something thoughtful.
              <br />
              Explore useful, beautiful things for the life you live.
            </p>
            <LocalizedClientLink href="/store" className="basket-button">
              Explore the collection <span>↗</span>
            </LocalizedClientLink>
            <div className="basket-empty-links">
              <LocalizedClientLink href="/collections/home">
                Home & living
              </LocalizedClientLink>
              <LocalizedClientLink href="/collections/rituals">
                Objects & rituals
              </LocalizedClientLink>
              <LocalizedClientLink href="/pages/gift-guide">
                The gift edit
              </LocalizedClientLink>
            </div>
          </div>
          <img
            src="/images/details.jpg"
            alt="A calm corner with thoughtful everyday objects"
          />
        </section>
      )}
    </div>
  )
}
