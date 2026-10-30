# EcomStarter

### South African ecommerce template with Next.js, Medusa and Peach Payments

Start a South African online store with a designed storefront, merchant admin, visual page builder and documentation for AI coding agents. Run locally with ZAR pricing and a South Africa region, then adapt the Form & Field demonstration brand.

**Next.js 16 · Medusa 2 · TypeScript · PostgreSQL · Prisma CMS · Puck · Peach Payments**

[Get started](docs/SETUP.md) · [Documentation](docs/README.md) · [Agent guide](docs/AGENT-GUIDE.md) · [Architecture](docs/ARCHITECTURE.md) · [Launch guide](docs/LAUNCH.md)

![Form & Field demo storefront](docs/images/storefront.png)

## Included

- **Storefront:** responsive catalog, collections, search, product galleries, colour/size variations, stock availability, cart, promotions and four-step checkout.
- **Accounts:** signup, login, password recovery, profile, addresses and order history.
- **Merchant admin:** Medusa catalog, inventory, orders, fulfillment, customers, promotions, price lists, regions, currencies and sales channels.
- **Content studio:** self-hosted Puck editor inside Admin, 17 components, nested layouts, responsive previews, journal, SEO fields, drafts, publishing and revisions.
- **South African starting point:** `/za` storefront, ZAR default currency, South Africa region and illustrative delivery rate. Additional regions use Medusa with explicit currency prices.
- **Payments:** manual local demo provider and optional Peach hosted checkout through a community provider. Merchant credentials and sandbox validation are required.
- **Email and newsletter:** Resend notification provider, order/welcome/password-reset templates, confirmation, unsubscribe and subscriber export. Local setup sends no email.
- **SEO:** metadata, canonical URLs, sitemap, robots and product/article structured data.
- **Agent-ready development:** repository instructions, architecture, task maps, extension guidance and verification scripts.

“Agent-ready” means coding-agent onboarding and extension guidance. No AI API key is needed to run this template; a customer-facing AI assistant is not included.

## Start locally

Requirements: Node.js **22.23.4+** (Node 24 LTS recommended), **pnpm 10.11.1**, Git and Docker Desktop with Docker Compose. Clone your copy of this repository, enter its directory, then run:

```sh
git clone https://github.com/Jeanrooy/South-Africa-Ecommerce-Starter-NextJS-Medusa.git
cd South-Africa-Ecommerce-Starter-NextJS-Medusa
pnpm install
pnpm setup
pnpm dev
```

Setup starts PostgreSQL 16 and Redis 7, creates local environment files, runs both migration systems, seeds demo products/content and creates a local admin. Existing environment files are preserved.

| Service        | Address                           |
| -------------- | --------------------------------- |
| Storefront     | http://localhost:8000/za          |
| Medusa Admin   | http://localhost:9000/app         |
| Content studio | http://localhost:9000/app/content |

Read generated admin credentials from **`.local/admin.json`**. Credentials and environment files are ignored by Git. No cloud subscription, hosted builder or payment account is needed for manual-payment demo checkout.

Follow [the setup guide](docs/SETUP.md) for environment, email, Peach and deployment details.

## Screenshots

Local Form & Field demo captures use illustrative catalog imagery and test checkout data.

| Product variations and gallery                                    | Basket                                             |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| ![Product details and variant selection](docs/images/product.png) | ![Basket and order totals](docs/images/basket.png) |

| Checkout                                           | Visual content editor                                            |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| ![Checkout address step](docs/images/checkout.png) | ![Page editor inside Medusa Admin](docs/images/page-builder.png) |

## Technology and ownership

| Layer            | Technology                                         | Responsibility                                                    |
| ---------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| Storefront       | Next.js 16.3.8, React 19, TypeScript, Tailwind CSS | Store pages, accounts and checkout                                |
| Commerce / Admin | Medusa 2.22.1, React 18 Admin                      | Products, variants, prices, inventory, carts, orders and payments |
| Database         | PostgreSQL 16 locally                              | Separate Medusa `public` and Prisma `cms` schemas                 |
| Content          | Prisma 6.19                                        | Pages, posts, revisions and subscribers                           |
| Visual builder   | Puck 0.23, shared workspace package                | Matching editor and storefront components                         |
| Integrations     | Peach provider 0.1.5, Resend                       | Optional hosted payments and email delivery                       |
| Tooling          | pnpm, Turborepo, Docker Compose                    | Dependencies, tasks and infrastructure                            |

Medusa owns commerce persistence and workflows. Prisma owns CMS/newsletter data only. Redis is available locally; durable event, workflow and locking providers need deployment configuration.

```text
apps/backend/          Medusa API, Admin, Prisma and integrations
apps/storefront/       Next.js storefront, accounts, basket and checkout
packages/page-builder/ Shared visual components and styles
scripts/               Setup and API/browser checks
docs/                  Setup, architecture, agent guide and screenshots
```

## Build with an AI agent

Read [AGENTS.md](AGENTS.md), then [the agent guide](docs/AGENT-GUIDE.md). Consult installed `@medusajs/*/AGENTS.md` files for pinned APIs. Medusa's [LLM documentation index](https://docs.medusajs.com/llms.txt) and Markdown pages work without MCP.

Example task:

> Read AGENTS.md, docs/AGENT-GUIDE.md and docs/ARCHITECTURE.md. Add a product detail field using Medusa extension patterns. Trace admin input, persistence and storefront rendering. Keep commerce data out of Prisma, preserve variant/cart behavior, run relevant checks and report limitations.

| Guide                                                | Purpose                                                  |
| ---------------------------------------------------- | -------------------------------------------------------- |
| [Setup](docs/SETUP.md)                               | Installation, environment, email and Peach               |
| [Architecture](docs/ARCHITECTURE.md)                 | Runtime boundaries, schemas and data flows               |
| [Agent guide](docs/AGENT-GUIDE.md)                   | Task-to-file map, invariants, checks and troubleshooting |
| [Storefront and builder](docs/STOREFRONT-BUILDER.md) | Variations, editing and builder limits                   |
| [Basket and checkout](docs/BASKET-CHECKOUT.md)       | Shopping interactions and verification                   |
| [Launch guide](docs/LAUNCH.md)                       | South African configuration and production work          |

## Environment configuration

Each app has its own environment. The repository root is not the place for application secrets.

| App                | Local file                   | Example to copy                 | Deployment                                                              |
| ------------------ | ---------------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| Medusa backend     | `apps/backend/.env`          | `apps/backend/.env.template`    | Inject backend variables into the process, including migration commands |
| Next.js storefront | `apps/storefront/.env.local` | `apps/storefront/.env.template` | Inject storefront variables at build and runtime                        |

`pnpm setup` creates the local files automatically. For manual configuration, copy the templates into the paths above. Replace every placeholder below; do not commit environment files.

### Backend example — `apps/backend/.env`

```dotenv
DATABASE_URL=postgres://medusa:CHANGE_ME@localhost:5432/ecomstarter
CMS_DATABASE_URL=postgresql://medusa:CHANGE_ME@localhost:5432/ecomstarter?schema=cms
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:8000,http://localhost:9000
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
COOKIE_SECRET=REPLACE_WITH_ANOTHER_LONG_RANDOM_SECRET
STOREFRONT_URL=http://localhost:8000
DEFAULT_COUNTRY=za
EMAIL_MODE=log
PEACH_ENABLED=false
```

Medusa and Prisma use separate schema connections. Keep Peach merchant credentials and `RESEND_API_KEY` in the backend environment only. See [setup](docs/SETUP.md) for all optional integration variables.

### Storefront example — `apps/storefront/.env.local`

```dotenv
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_REPLACE_WITH_YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_DEFAULT_REGION=za
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

Create the publishable key in Medusa Admin and associate it with the storefront sales channel. Local setup supplies it automatically. `NEXT_PUBLIC_*` values are public and can be embedded in the browser build: never put secret keys there. Rebuild Next.js after changing them.

## Deployment

The simplest documented self-hosted route is **Docker Compose for PostgreSQL/Redis, with both apps deployed from source**. The existing `docker-compose.yml` starts databases only; it is not a full application deployment or a hardened production configuration.

1. Provision PostgreSQL and the infrastructure your Medusa configuration uses.
2. Set separate backend/storefront environments using your HTTPS domains and database credentials.
3. Install dependencies and generate Prisma Client.
4. Apply Prisma CMS and Medusa migrations as a release step.
5. Build and start Medusa from `apps/backend/.medusa/server`.
6. Build and start Next.js on port 8000, with the backend reachable.
7. Put both services behind an HTTPS reverse proxy and a process supervisor.

Follow [the deployment guide](docs/DEPLOYMENT.md) for exact commands, a Compose database example, environment placement, first-time setup and updates. Use [the launch guide](docs/LAUNCH.md) for merchant configuration.

## Roadmap

The template includes a storefront, product variations, merchant admin, visual CMS and manual-payment checkout. Planned work is tracked in [the roadmap](docs/ROADMAP.md), including integration validation, production infrastructure and additional commerce features.

Previous implementation checks passed backend/storefront builds, API smoke tests, visual-builder checks and browser checkout. Browser scripts require installed Chrome and running services; some create demo customers/orders. See [verification](docs/AGENT-GUIDE.md#verification).

Before launch, configure payments, delivery, tax rules, policies, email, storage and production infrastructure. **Peach has not been tested against a merchant sandbox account here.** Resend needs a verified sender. Replace demo prices, imagery, specifications and legal copy.

Wishlist, reviews, gift cards, advertising integrations, marketing automation and live currency conversion are roadmap items. The builder controls content pages; header, footer and commerce templates remain code-controlled. See the roadmap for builder extensions and their scope.

## Credits and license

Built with [Medusa](https://medusajs.com/) and based on the official [Medusa DTC Starter](https://github.com/medusajs/dtc-starter). Thanks to the [Medusa contributors](https://github.com/medusajs/medusa) for the commerce platform and starter foundation. This repository starts with a fresh Git history; the original MIT license and copyright attribution are preserved in [LICENSE](LICENSE).

Demo assets include Unsplash photography; review and replace imagery for your catalog. The [Peach provider](https://medusajs.com/integrations/medusa-payment-peach-payments) is independently community maintained and not endorsed by Peach Payments.
