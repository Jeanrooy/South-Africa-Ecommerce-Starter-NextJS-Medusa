import type { HttpTypes } from "@medusajs/types"
import BasketItems from "@modules/cart/components/basket-items"
import BasketTotals from "@modules/cart/components/basket-totals"
import DiscountCode from "@modules/cart/components/promotion-entry"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderDisclosure from "@modules/checkout/components/order-disclosure"

export default function CheckoutSummary({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  return (
    <aside className="checkout-summary" aria-label="Order summary">
      <OrderDisclosure
        count={count}
        total={cart.total ?? 0}
        currencyCode={cart.currency_code}
      >
        <div className="checkout-summary-content">
          <LocalizedClientLink href="/cart" className="checkout-edit-basket">
            Edit basket ↗
          </LocalizedClientLink>
          <BasketItems cart={cart} compact editable={false} />
          <div className="basket-discount">
            <DiscountCode cart={cart} />
          </div>
          <BasketTotals cart={cart} />
        </div>
      </OrderDisclosure>
      <div className="checkout-summary-note">
        <span>◇</span>
        <div>
          <strong>A little peace of mind.</strong>
          <p>
            Review your items, delivery and payment before placing your order.
          </p>
          <LocalizedClientLink href="/pages/faqs">
            Questions? We can help ↗
          </LocalizedClientLink>
        </div>
      </div>
    </aside>
  )
}
