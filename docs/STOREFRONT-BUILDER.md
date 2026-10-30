# Storefront and visual builder

The redesign uses a shared component system in `packages/page-builder`, rendered by Next.js and edited with the self-hosted Puck editor inside Medusa Admin. No hosted builder account or trial is required.

## What's new

- 16 additional home/lifestyle products with 64 variants, alongside the original apparel demo.
- Four collections: Home & living, Objects & rituals, Everyday carry and Soft living.
- A visually composed homepage, gift guide, craft/materials guide, care guide, FAQs and contact page; the existing story page remains available.
- Four additional journal stories.
- Product pages following the supplied reference: left gallery, right purchase/details column, thumbnail rail, previous/next controls, hover-wheel navigation, swipe, keyboard navigation and image enlargement.
- Colour/size choices update price, SKU, availability, URL and the gallery. Quantity, cart feedback, error handling and Buy now are implemented. Buy now adds the chosen variant to the existing cart and opens checkout.

The catalog is demonstration content. Stock imagery is illustrative; supply your own exact product/variant photography, specifications, dimensions and prices before using it as a live catalog. The two sample sizes are explicit variants with their own prices and inventory, rather than automatic transformations of the listed product dimensions.

## Product variants

Medusa owns options, variant combinations, SKU, prices, inventory, backorder settings and image associations. In Admin, open Products, select a product, and manage its options/variants. Manage photos from the variant's own details page or associate one product image with multiple variants from the product media form. The storefront uses these native associations, with a fallback to all product photos for variants without assigned images.

The seeded apparel photos are linked to their original colour variants as well. The home/lifestyle demo includes a sold-out variant to make availability behavior reviewable. Unknown colour names display as text choices rather than an invented colour. The renderer's sample colour dictionary can be extended for your own palette.

Sources: [Medusa variant management](https://docs.medusajs.com/user-guide/products/variants), [product and variant image management](https://docs.medusajs.com/user-guide/products/edit).

## Using Content studio

Open `/app/content` in Admin. The library supports search, page/story filters and duplication. Open a page to enter the visual editor.

1. Drag elements from Blocks onto the canvas, or begin with a Landing, About or Help template.
2. Use Section containers and Two columns to nest and arrange content. Use Outline to select and reorder elements.
3. Select an element to edit its content and appearance. Available controls include colour palette, alignment, spacing, width, device visibility, image aspect ratio and layout-specific options. Rich text supports inline formatting and lists. Images support URL entry, a catalog image selector and Medusa file uploads.
4. Switch between desktop, tablet and mobile preview widths. These are real iframe viewport widths; responsive styles are shared with the storefront.
5. Open Page & SEO to set the title, URL slug, excerpt, cover, search title and description.
6. Save draft to persist without changing the live page. Publish page makes the current draft live, with a cache window of up to 60 seconds.

The 17 components are Hero, Heading, Text, Rich text, Image, Button, Image & story, Benefits, Image cards, Live products, Live journal, FAQ, Quote, Call to action, Spacer/divider, Two columns and Section container. Product sections use live region-priced catalog data on the storefront; editor preview prices are deliberately labelled as catalog previews.

Use `home` for the full homepage. Existing legacy blocks are converted into visual components when opened. Contact/shipping/returns/privacy/terms slugs override those pages; other pages live under `/[country]/pages/[slug]`, and posts under `/[country]/blog/[slug]`.

Undo/redo is provided within the editor. Every saved update records a revision; Revisions can restore a previous version into a draft, which must be published to change the live page. Version checks reject stale saves from another session. An unsaved draft is also stored on the current device for recovery. Export/Import transfers layout JSON; it does not export product data or uploaded media files. The server validates component types, unique IDs, nesting/size limits, links and image sources, and sanitizes rich text.

This is an Elementor-style component editor, not an implementation of every Elementor feature. Arbitrary HTML/JavaScript/CSS, pop-up design, arbitrary breakpoint editing, a global header/footer designer, live multi-user editing, scheduled publishing and reusable linked global sections are not included. Navigation, footer and the product template remain code-controlled to keep commerce behavior consistent.

## Medusa documentation review

The review focused on the installed Medusa 2.22.1 extension surface, official admin/variant guides, commerce modules, and relevant recipes. Reading every Medusa documentation page is not necessary or claimed.

| Capability                                                       | Current status                                                         | Extension path                                                                                         |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Options, variants, pricing, inventory                            | Native Medusa, wired into storefront                                   | Keep Medusa as the source of truth                                                                     |
| Orders, fulfillment, returns, promotions, channels, tax, regions | Native Admin and commerce workflows                                    | Configure actual business rules and providers                                                          |
| Visual page composition                                          | Added in this repo                                                     | Shared Puck components and protected Admin API                                                         |
| Wishlist / saved products                                        | Not implemented                                                        | Customer-owned plugin/module following Medusa's wishlist guide                                         |
| Reviews and moderation                                           | Not implemented                                                        | Custom module, verified-purchase rules, moderation UI and storefront display; do not seed fake reviews |
| Product bundles                                                  | Inventory kits supported by Medusa; bundle-specific UX not implemented | Custom bundle workflows when independent pricing/fulfillment is required                               |
| Marketing automation                                             | Transactional event subscribers exist; campaigns are not connected     | Event subscribers and scheduled workflows with a chosen marketing service                              |
| Durable background work / multiple replicas                      | Local runtime uses in-memory defaults                                  | Configure Medusa Redis event/workflow/locking providers and a shared limiter                           |
| Live payments / mail                                             | Configurable, external credentials still required                      | Merchant sandbox tests and verified sender setup                                                       |

Reviewed sources: [Admin UI routes](https://docs.medusajs.com/learn/fundamentals/admin/ui-routes), [commerce Product module](https://docs.medusajs.com/resources/commerce-modules/product), [wishlist plugin](https://docs.medusajs.com/resources/plugins/guides/wishlist), [bundled products](https://docs.medusajs.com/resources/recipes/bundled-products), [commerce automation](https://docs.medusajs.com/resources/recipes/commerce-automation). The native admin editor architecture also draws on [Elementor's editor structure](https://elementor.com/help/explore-the-elementor-editor/) and [responsive editing](https://elementor.com/help/mobile-editing/), implemented using [Puck](https://puckeditor.com/docs/getting-started).

## Checks

With both apps running:

```sh
pnpm smoke
pnpm check:builder
pnpm check:redesign
node scripts/editor-ui-check.cjs
```

Builder API checks cover draft isolation, live publication, version conflicts, revision history, nested columns, validation, rich-text sanitization and unpublishing. Browser checks cover the redesigned pages, image loading, product variant/gallery/cart/Buy now flows, mobile layout, and the editor canvas. The editor UI check inserts a template, saves a draft, publishes it, opens revisions and checks the resulting interactive storefront page. Temporary test content is removed; test customers/carts/orders stay in the local demo database.
