import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group" data-store-header>
      <div className="field-announcement">
        The everyday edit — good things for the long run.{" "}
        <LocalizedClientLink href="/pages/gift-guide">
          Explore the gift edit ↗
        </LocalizedClientLink>
      </div>
      <header className="relative h-20 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              <span className="field-wordmark">
                form & field<span className="brand-sigil">®</span>
              </span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <Search />
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
      <nav className="field-category-nav" aria-label="Shop collections">
        <LocalizedClientLink href="/store">Shop all</LocalizedClientLink>
        <LocalizedClientLink href="/collections/home">
          Home & living
        </LocalizedClientLink>
        <LocalizedClientLink href="/collections/rituals">
          Objects & rituals
        </LocalizedClientLink>
        <LocalizedClientLink href="/collections/textiles">
          Soft living
        </LocalizedClientLink>
        <LocalizedClientLink href="/collections/carry">
          Everyday carry
        </LocalizedClientLink>
        <span />
        <LocalizedClientLink href="/pages/gift-guide">
          The gift edit
        </LocalizedClientLink>
        <LocalizedClientLink href="/blog">Journal</LocalizedClientLink>
        <LocalizedClientLink href="/pages/our-story">
          Our story
        </LocalizedClientLink>
      </nav>
    </div>
  )
}
