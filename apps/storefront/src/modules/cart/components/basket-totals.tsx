import type { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

export default function BasketTotals({ cart }: { cart: HttpTypes.StoreCart }) {
  const money = (amount: number) =>
    convertToLocale({ amount, currency_code: cart.currency_code })
  const shippingReady = !!cart.shipping_methods?.length
  const addressReady = !!cart.shipping_address?.address_1
  const discount = cart.discount_total ?? 0
  return (
    <div className="basket-totals">
      <dl>
        <div>
          <dt>Items subtotal</dt>
          <dd data-testid="cart-subtotal">
            {money(cart.item_subtotal ?? cart.subtotal ?? 0)}
          </dd>
        </div>
        {discount > 0 && (
          <div className="basket-saving">
            <dt>Discount</dt>
            <dd data-testid="cart-discount">− {money(discount)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd data-testid="cart-shipping">
            {shippingReady
              ? money(cart.shipping_subtotal ?? 0)
              : "Calculated at checkout"}
          </dd>
        </div>
        <div>
          <dt>Taxes</dt>
          <dd data-testid="cart-taxes">
            {addressReady
              ? money(cart.tax_total ?? 0)
              : "Calculated at checkout"}
          </dd>
        </div>
      </dl>
      <div className="basket-grand-total">
        <span>
          {shippingReady && addressReady ? "Total" : "Estimated total"}
        </span>
        <strong data-testid="cart-total" data-value={cart.total ?? 0}>
          {money(cart.total ?? 0)}
        </strong>
      </div>
      <p className="basket-currency-note">
        All prices in {cart.currency_code.toUpperCase()}. Final delivery and
        taxes are confirmed before you place your order.
      </p>
    </div>
  )
}
