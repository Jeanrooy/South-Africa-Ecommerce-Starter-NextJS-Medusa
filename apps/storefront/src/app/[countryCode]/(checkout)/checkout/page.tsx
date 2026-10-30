import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import CheckoutProgress from "@modules/checkout/components/checkout-progress"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({ params, searchParams }: { params: Promise<{ countryCode: string }>; searchParams: Promise<{ step?: string }> }) {
  const { countryCode } = await params
  const { step } = await searchParams
  const cart = await retrieveCart()

  if (!cart) {
    redirect(`/${countryCode}/cart`)
  }
  if (!cart.items?.length) redirect(`/${countryCode}/cart`)
  const steps = ["address", "delivery", "payment", "review"]
  const unlocked = !cart.shipping_address?.address_1 || !cart.email ? 0 : !cart.shipping_methods?.length ? 1 : !cart.payment_collection?.payment_sessions?.some((session) => ["pending", "authorized"].includes(session.status)) ? 2 : 3
  if (!step || !steps.includes(step) || steps.indexOf(step) > unlocked) redirect(`/${countryCode}/checkout?step=${steps[unlocked]}`)

  const customer = await retrieveCustomer()

  return (
    <div className="checkout-page content-container"><header className="checkout-page-heading"><p className="basket-eyebrow">A FEW DETAILS. THEN IT&apos;S YOURS.</p><h1>Make it yours.</h1><p>One step closer to your everyday favourites.</p></header><CheckoutProgress unlocked={unlocked} /><div className="checkout-page-grid"><div className="checkout-form-column">{!customer && <p className="checkout-signin">Already part of the everyday? <LocalizedClientLink href="/account">Sign in ↗</LocalizedClientLink> <span>or continue as a guest below.</span></p>}<PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper></div>
      <CheckoutSummary cart={cart} />
    </div></div>
  )
}
