# Basket and checkout redesign

The cart, navigation basket preview and checkout now share the Form & Field styling and item components.

## Navigation basket

The old dropdown combined fixed-width image, title and price columns that exceeded its 420px panel. The replacement renders into the document body, avoiding clipping from header containers, and positions below the navigation with viewport-aware width and height.

- Hover or click to open; touch and keyboard access are supported.
- Outside click, Escape or the close button dismisses it. Escape returns focus to the basket trigger.
- A short hover delay allows moving between the trigger and the panel.
- Images, titles, variants, prices and quantity controls fit without fixed-width text columns.
- The item list scrolls inside the panel; the subtotal and action buttons remain available. Short viewports allow the entire panel to scroll.
- Quantity changes and removal refresh the cart and navigation count. Product links retain the selected variant.

## Cart

The cart uses responsive item rows, editable quantities, remove actions, promotion entry, a sticky desktop summary, guest/sign-in guidance, care links and related products. The empty state links to relevant collections. Shipping and taxes are labelled as calculated at checkout until the corresponding details are available; zero is not presented as a promise of free delivery.

## Checkout

Checkout retains Medusa's existing address, shipping and payment logic, within a new branded shell, four-step progress display, step panels and order summary. Direct `/checkout` entry redirects to the next valid step. Unavailable or future steps are redirected to a valid step. Empty carts redirect to the basket.

The order summary starts collapsed on mobile and shows the total, with a disclosure for items, promotions and price details. Desktop shows the full summary. Completed steps remain editable. Address inputs now have associated IDs for their labels. Existing payment providers remain in use; no new payment provider or live payment is introduced by the redesign.

Cart reads bypass the Next.js data cache so private basket updates are reflected immediately. Catalog reads keep their existing cache behavior.

## Verification

Run `pnpm check:basket` with backend and storefront running. The script creates a local test basket, tests quantity/total/navigation updates, removal from the preview, hover/keyboard controls, six viewport sizes (including 320px width and a short landscape viewport), address/delivery/payment progression, mobile summary behavior, edit-address persistence, empty states and a complete manual-payment demo order. Screenshots are saved under ignored `artifacts/`.

The test creates local demo carts and an order; it never charges an external payment provider. Peach/Stripe settlement still requires testing with the merchant's configured sandbox credentials.
