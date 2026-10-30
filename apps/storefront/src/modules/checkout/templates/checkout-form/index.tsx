import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import CheckoutStep from "@modules/checkout/components/checkout-step"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return (
      <p className="checkout-availability-note" role="alert">
        We couldn&apos;t load checkout options. Please refresh the page or
        contact the store if this continues.
      </p>
    )
  }

  return (
    <div className="checkout-steps">
      <CheckoutStep
        step="address"
        number="01"
        complete={!!cart.shipping_address?.address_1 && !!cart.email}
      >
        <Addresses cart={cart} customer={customer} />
      </CheckoutStep>
      <CheckoutStep
        step="delivery"
        number="02"
        complete={!!cart.shipping_methods?.length}
      >
        {shippingMethods.length === 0 && (
          <p className="checkout-availability-note" role="status">
            No delivery options are available for this address yet. Check your
            delivery address or contact the store.
          </p>
        )}
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      </CheckoutStep>
      <CheckoutStep
        step="payment"
        number="03"
        complete={!!cart.payment_collection?.payment_sessions?.length}
      >
        {paymentMethods.length === 0 && (
          <p className="checkout-availability-note" role="status">
            No payment methods are available for this region. Contact the store
            for assistance.
          </p>
        )}
        <Payment cart={cart} availablePaymentMethods={paymentMethods} />
      </CheckoutStep>
      <CheckoutStep step="review" number="04" complete={false}>
        <Review cart={cart} />
      </CheckoutStep>
    </div>
  )
}
