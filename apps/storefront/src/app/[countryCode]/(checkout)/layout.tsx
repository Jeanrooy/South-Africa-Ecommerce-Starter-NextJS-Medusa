import LocalizedClientLink from "@modules/common/components/localized-client-link"
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="checkout-shell">
      <header className="checkout-header">
        <nav className="content-container">
          <LocalizedClientLink
            href="/cart"
            className="checkout-back"
            data-testid="back-to-cart-link"
          >
            ← <span>Back to basket</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="field-wordmark"
            data-testid="store-link"
          >
            form & field<span className="brand-sigil">®</span>
          </LocalizedClientLink>
          <span className="checkout-secure">◈ Secure checkout</span>
        </nav>
      </header>
      <main data-testid="checkout-container">{children}</main>
      <footer className="checkout-footer content-container">
        <span>© {new Date().getFullYear()} Form & Field</span>
        <div>
          <LocalizedClientLink href="/privacy">Privacy</LocalizedClientLink>
          <LocalizedClientLink href="/terms">Terms</LocalizedClientLink>
          <LocalizedClientLink href="/returns">Returns</LocalizedClientLink>
          <LocalizedClientLink href="/contact">
            Need a hand? ↗
          </LocalizedClientLink>
        </div>
      </footer>
    </div>
  )
}
