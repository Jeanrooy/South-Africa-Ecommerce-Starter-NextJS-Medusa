# EcomStarter setup

[Documentation index](README.md) · [Architecture](ARCHITECTURE.md) · [Agent guide](AGENT-GUIDE.md) · [Launch guide](LAUNCH.md)

A reusable ecommerce template based on the official Medusa DTC starter, with the Form & Field demonstration brand. Medusa 2.22.1, Next.js 16.3.8, PostgreSQL 16, Prisma 6.19, React, and TypeScript. No Medusa Cloud subscription is required.

## Architecture

`apps/backend` serves the Medusa API and its built-in merchant admin. `apps/storefront` serves the Next.js storefront. PostgreSQL's `public` schema belongs to Medusa; Prisma owns only the `cms` schema for content and newsletter subscribers. Do not introspect Medusa's tables into Prisma or let Prisma migrate them. Medusa's commerce modules use their own persistence layer.

The repo includes Medusa's MIT-licensed starter code. Hero photography is downloaded locally from Unsplash; replace demo assets and branding when adapting the template.

## Local setup

Install Node 24 LTS, pnpm 10.11.1 and Docker Desktop. Start Docker Desktop, then from the repo root:

```sh
pnpm install
pnpm setup
pnpm dev
```

Setup starts PostgreSQL and Redis containers, creates ignored environment files with random auth secrets, generates Prisma Client, applies CMS and Medusa migrations, seeds demo content and commerce data, sets the storefront publishable key, and creates a local admin. Existing local environment files are preserved. Database migrations are not destructive resets.

- Storefront: http://localhost:8000/za
- Admin: http://localhost:9000/app
- Local admin: read `.local/admin.json` on your machine. This file is ignored by Git.

Use `pnpm backend:dev` or `pnpm storefront:dev` to run one app. `docker compose stop` stops the local databases without deleting data. Setup uses ports 5432 and 6379; adjust compose and local URLs if other projects already use them.

## Included features

| Area            | Implementation                                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog         | Product pages, variants, stock availability, categories, collections, search and filtering                                                                                             |
| Shopping        | Cart, quantity changes, promotions, shipping choice, billing/shipping addresses, checkout and order confirmation                                                                       |
| Customers       | Signup, login/logout, profile, addresses, order history, password recovery; starter also includes account verification screens                                                         |
| Commerce admin  | Medusa's products, inventory, locations, orders, fulfillment, returns/refunds, customers, promotions, price lists, regions, currencies, tax configuration, sales channels and API keys |
| CMS             | Content studio at `/app/content`: pages/posts, draft/publish, SEO fields, cover images, a visual drag-and-drop editor with 17 components and revision history, delete and edit         |
| Pages           | `/[country]/pages/[slug]`; published page `home` can control the full homepage                                                                                                         |
| Policy editing  | Published page slugs `contact`, `shipping`, `returns`, `privacy`, `terms` override their existing storefront pages                                                                     |
| Journal         | Index, article pages, excerpts, covers, article metadata and BlogPosting structured data                                                                                               |
| Newsletter      | Consent validation, email confirmation, token-based unsubscribe, per-IP request limits, subscriber admin and confirmed-subscriber CSV export                                           |
| Emails          | Medusa notification provider using Resend, with order confirmation, welcome, password-reset and newsletter-confirmation templates                                                      |
| Payments        | Manual provider for local testing; opt-in Peach hosted checkout and server-authorized return route                                                                                     |
| Regions         | Seeded South Africa/ZAR plus the upstream Europe/EUR region; country selection updates pricing through Medusa                                                                          |
| SEO / discovery | Product structured data, canonical metadata, multilingual/country links, sitemap with CMS content, robots and inherited agent-readable product endpoints                               |

Medusa sales channels are commerce channels. External advertising platforms, social catalog feeds, SMS providers and automated marketing campaigns are not connected. The newsletter export supports connecting your chosen marketing service. Gift cards are not implemented. Currency prices are configured explicitly; this template does not perform live exchange-rate conversion. The demo ZAR price and shipping fee are examples, not a pricing recommendation.

## Content and branding

Create a page or journal story in Content studio. Compose a visual layout, save a draft and publish when ready. Public APIs serve the published snapshot, preserving live content while drafts change. Published changes are cached for up to 60 seconds. Legacy text blocks render plain paragraphs; visual rich text is sanitized server-side. CTA URLs accept relative paths or HTTPS URLs. Images require HTTPS.

Edit the wordmark in the navigation/footer, `STORE_NAME` in `src/lib/util/site.ts`, homepage hero component and `styles/globals.css` for a new brand. Visual page layouts and the homepage are editable in the Puck canvas. Navigation, footer and commerce templates remain code-controlled. See [the visual builder guide](STOREFRONT-BUILDER.md) for controls, revisions, variants and documented limits. Content endpoints currently return the newest 200 admin entries / 100 public entries and subscriber export the newest 500 signups; add pagination for larger content libraries.

Contact and legal fallback pages deliberately identify themselves as placeholders. Publish your own pages through Content studio before launch. Policy data used in product structured data lives in Medusa region metadata; editing a page does not change fulfillment rules or region policy metadata.

## Transactional email

In the backend environment:

```dotenv
EMAIL_MODE=resend
RESEND_API_KEY=your-key
EMAIL_FROM=Your Store <orders@your-verified-domain.example>
STOREFRONT_URL=https://your-store.example
DEFAULT_COUNTRY=za
```

Verify your sender domain in Resend, then restart the backend. The default `EMAIL_MODE=log` records only a template name and deliberately sends no email. It does not print reset tokens, email recipients or private order details. Newsletter confirmation and password recovery need real delivery to complete from an inbox. Resend failures throw into Medusa's notification handling. Templates live under `apps/backend/src/modules/email`; event selection is in `src/subscribers/commerce-emails.ts`. A shipping template exists as a starting point, but shipment-event delivery is not connected yet. No marketing broadcasts are sent by this template.

## Peach Payments

The pinned integration is community maintained. Set backend `PEACH_ENABLED=true` and provide `PEACH_CLIENT_ID`, `PEACH_CLIENT_SECRET`, `PEACH_MERCHANT_ID`, `PEACH_ENTITY_ID`, `PEACH_SECRET_TOKEN`, `PEACH_MODE=sandbox`, plus:

```dotenv
PEACH_NOTIFICATION_URL=https://your-api.example/hooks/payment/pp_peach_peach
PEACH_SHOPPER_RESULT_URL=https://your-store.example/api/peach-return
STOREFRONT_URL=https://your-store.example
```

Restart the backend and enable the `pp_peach_peach` provider for the desired region in Medusa Admin. Register the HTTPS webhook with Peach and allowlist the storefront origin. Checkout redirects to the provider-supplied Peach HTTPS URL. The return uses the existing cart cookie and Medusa's authorization workflow, which verifies the payment through Peach rather than trusting browser return parameters. Use immediate capture (`DB`); the integration does not implement preauthorization capture/void. Only two-decimal currencies are supported. Refunds require the original transaction and webhook/refund secret.

Peach has not been exercised against a merchant account in this repo. Before accepting money, verify sandbox success, decline, cancel, timeout, return, webhook retry and refund scenarios against your account. Manual checkout tests do not verify Peach settlement.

## Verification

The redesigned cart, checkout and navigation basket are documented in [Basket and checkout](BASKET-CHECKOUT.md). Run `pnpm check:basket` to test those flows in Chrome.

With the backend running:

```sh
pnpm smoke
pnpm build
pnpm lint
```

The API smoke script uses the local admin and creates a demo customer/order. It checks CMS authentication, draft privacy, publishing, invalid CTA rejection, newsletter input, signup, catalog prices, shipping and manual-payment checkout. It deletes its temporary CMS entry. Run only against local demo data.

With storefront and backend running, `pnpm check:browser` uses installed Chrome in headless mode to check main routes, desktop/mobile overflow and browser exceptions, then logs into the local admin and captures the content studio. Screenshots and API test results are written to ignored `artifacts/`. Storefront ESLint currently includes upstream React hook warnings and Next image optimization warnings; errors are resolved. Both builds retain TypeScript checking.

## Production setup

Configure real PostgreSQL URLs with separate Prisma CMS schema ownership, strong auth secrets, CORS origins, HTTPS storefront URL, file/object storage, payment credentials, sender domain, tax rates and carrier/shipping rules. Apply `prisma migrate deploy` separately from `medusa db:migrate`; run Prisma generation during dependency/build setup. Build both apps, start Medusa from its generated `.medusa/server` deployment output following the Medusa deployment docs, and start Next with its production build. Never run the local admin generation script in production.

The provided local runtime uses Medusa's in-memory event bus, workflow and locking defaults. Configure Medusa's Redis infrastructure modules before deploying multiple processes or requiring durable background jobs. A local Redis container is included for that configuration. Newsletter endpoints are limited to ten requests per IP per fifteen minutes in the local process; use a shared limiter or edge limits across replicas, and keep confirmed subscriber lists/unsubscribes synchronized with your marketing provider. Configure backups, monitoring, privacy retention and deployment secrets for your host. These deployment/account-specific steps cannot be validated without the chosen services.

## Documentation consulted

- [Medusa repository](https://github.com/medusajs/medusa)
- [Install Medusa](https://docs.medusajs.com/learn/installation)
- [Current Next.js starter](https://docs.medusajs.com/resources/nextjs-starter)
- [Medusa modules](https://docs.medusajs.com/learn/fundamentals/modules)
- [Email notification integration](https://docs.medusajs.com/resources/integrations/guides/resend)
- [Peach Payments provider](https://medusajs.com/integrations/medusa-payment-peach-payments)

Development also uses the installed Medusa packages' version-specific `AGENTS.md` references. Public Markdown documentation is available without an MCP connection or cloud account.
