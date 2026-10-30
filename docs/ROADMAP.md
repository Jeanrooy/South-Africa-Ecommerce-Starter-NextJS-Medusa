# Roadmap

This tracks known gaps and future work for the South African ecommerce template. Unchecked items are not implemented or verified. Ordering indicates priority, not a delivery commitment. Update this file as work lands, with documentation and verification evidence.

## Foundation delivered

- [x] Next.js storefront with catalog, collections and customer accounts
- [x] Product variations, associated galleries, price and stock selection
- [x] Responsive basket, navigation basket and four-step checkout
- [x] Medusa merchant admin and South Africa/ZAR defaults
- [x] Prisma CMS, journal and Puck visual editor with drafts/revisions
- [x] Newsletter confirmation/unsubscribe and notification provider
- [x] Optional Peach integration configuration and return handling
- [x] Local setup, API/browser checks, screenshots and coding-agent documentation

## Launch priorities

- [ ] Verify Peach merchant sandbox: success, decline, cancel, timeout, pending, repeated return, webhook retries and refunds
- [ ] Verify live email delivery with a verified sender and all connected templates
- [ ] Connect shipment notifications to fulfillment events
- [ ] Add a production configuration example for durable event/workflow/locking providers
- [ ] Add shared rate limiting for multiple replicas
- [ ] Configure and verify shared object storage and upload lifecycle
- [ ] Provide full application Dockerfiles and a production Compose stack with migrations and health checks
- [ ] Validate source and container deployment on a clean remote host
- [ ] Add CI build/lint checks and isolated integration-test infrastructure
- [ ] Document and exercise backup/restore, monitoring and release rollback

## South African store integrations

- [ ] Courier integration, shipment tracking and realistic delivery rules
- [ ] Document and test merchant-specific VAT calculation/display scenarios
- [ ] Provide merchant onboarding guidance for policies, consent and data retention
- [ ] Optional SMS notifications through a chosen provider
- [ ] Additional payment methods/providers after merchant demand and sandbox testing

Merchant credentials, tax rules, catalog, inventory, shipping rates, branding and policies still need configuration for each store; these are not automatically solved by template features.

## Commerce extensions

- [ ] Customer wishlists
- [ ] Verified-purchase reviews and moderation
- [ ] Gift cards
- [ ] Bundle-specific storefront and admin workflows
- [ ] Marketing platform integration and campaign automation
- [ ] Social catalog feeds and advertising integrations
- [ ] Optional currency conversion service with explicit pricing rules

## Content and builder

- [ ] Database-level public content filtering and pagination beyond the current list caps
- [ ] Paginated subscriber export and subscriber retention controls
- [ ] Scheduled publishing
- [ ] Reusable linked global sections
- [ ] Global navigation/footer editing
- [ ] More responsive layout controls and accessibility checks
- [ ] Multi-user editing/conflict UX improvements
- [ ] Media library management and richer reusable templates

The current builder is a structured component editor. Full Elementor parity and arbitrary user JavaScript/CSS execution are not promised.

## Quality and agent experience

- [ ] Broaden automated regression coverage for accounts, promotions and fulfillment
- [ ] Payment-provider contract tests and webhook retry/idempotency coverage
- [ ] Accessibility and performance audits across shopping flows
- [ ] More worked Medusa module/workflow and shared-block extension examples
- [ ] Keep screenshots, agent task maps and deployment examples synchronized with releases
