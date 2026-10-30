# Adapting and launching a South African store

## Template status

The local storefront, merchant admin, visual editor and manual-payment checkout are implemented. Real merchant payment processing, email delivery, courier fulfillment and production infrastructure still require configuration and verification. This document is a project configuration guide, not a claim of legal or tax compliance.

## Store and catalog

Replace Form & Field branding, contact details, demo imagery, specifications and prices. Configure options, SKUs, variant images and actual inventory in Medusa Admin. Verify ZAR prices and South Africa availability. The sample delivery rate is R95 and must be replaced with your business rules. Additional currencies require explicit prices, regions and supported payment methods.

Configure warehouse locations, shipping profiles, service zones, rates and carrier integrations. Test deliverable and unsupported addresses, stock limits, promotions, refunds and fulfillment. Tax regions alone do not establish your business's final VAT calculation or display policy; configure and verify your actual requirements before accepting orders.

## Peach Payments

Follow [the setup instructions](SETUP.md#peach-payments) for the pinned community provider, sandbox configuration, callback URLs and region assignment. Keep merchant credentials server-side. Configure HTTPS return/webhook endpoints and allowed origins for the actual deployment.

Validate successful, declined, cancelled, timed-out and pending payments, webhook retries, repeated returns, amount/currency integrity and refunds against your merchant sandbox. Confirm order state and provider state agree. Manual demo checkout does not validate Peach. Switch live settings only after merchant testing is complete.

## Content and communication

Publish your own shipping, returns, privacy, terms and contact pages through Content studio. Review customer consent, retention and newsletter handling for your business. Configure Resend with a verified sender, test order/welcome/reset/confirmation delivery and exercise unsubscribe. Shipment emails are not connected to shipment events yet. Marketing broadcasts and SMS are not integrated.

## Deployment

- Use deployment secrets, HTTPS origins and correct CORS URLs; never deploy generated local admin credentials.
- Generate Prisma Client and apply `prisma migrate deploy` separately from `medusa db:migrate`.
- Build/deploy Medusa using its generated server output and Next.js using its production build; follow the pinned version's deployment documentation.
- Configure durable Medusa event/workflow/locking infrastructure before running multiple processes. The supplied Redis container alone does not enable these providers.
- Use shared file/object storage, database backups, monitoring and a shared rate limiter. Plan subscriber/content pagination beyond demo list caps.
- Verify public metadata, canonical URLs, sitemap, structured data and actual store policies on the deployed host.

## GitHub publication

The starter may still have `medusajs/dtc-starter` as its Git remote. Set your own destination before pushing; do not push project changes to the upstream starter. Preserve MIT attribution and review asset rights.

Review the complete staged diff. Exclude environment files, `.local`, generated build output, customer data and temporary previews. Curated screenshots under `docs/images` are intended for Git; raw `artifacts` remain ignored. Push to your own repository after its destination is confirmed, then enable GitHub's template repository setting if you want others to create copies.
