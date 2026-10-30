const fs = require("node:fs")
const assert = require("node:assert/strict")
const { chromium, expect } = require("@playwright/test")
const key = fs
  .readFileSync("apps/storefront/.env.local", "utf8")
  .match(/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.*)/)[1]
  .trim()
async function api(path, method = "GET", body) {
  const response = await fetch(`http://localhost:9000${path}`, {
    method,
    headers: {
      "x-publishable-api-key": key,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(`${path}: ${JSON.stringify(result)}`)
  return result
}
async function main() {
  fs.mkdirSync("artifacts", { recursive: true })
  const { regions } = await api("/store/regions")
  const region = regions.find((item) => item.currency_code === "zar")
  const { products } = await api(
    `/store/products?limit=100&region_id=${region.id}&fields=*variants.calculated_price,+variants.inventory_quantity,+metadata`
  )
  const chosen = products
    .filter((p) => p.metadata?.demo_catalog)
    .slice(0, 6)
    .map((p) => ({
      product: p,
      variant: p.variants.find(
        (v) => v.inventory_quantity > 5 && v.calculated_price
      ),
    }))
  assert.equal(
    chosen.length,
    6,
    "Six demo products must be available for the basket test"
  )
  const { cart } = await api("/store/carts", "POST", {
    region_id: region.id,
    items: chosen.map(({ variant }) => ({
      variant_id: variant.id,
      quantity: 1,
    })),
  })
  await api(
    `/store/carts/${cart.id}?fields=${encodeURIComponent("*items, *region, *items.product, *items.variant, *items.variant.images, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name")}`
  )
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  try {
    await page.goto("http://localhost:8000/za", {
      waitUntil: "domcontentloaded",
    })
    await context.addCookies([
      {
        name: "_medusa_cart_id",
        value: cart.id,
        url: "http://localhost:8000",
        httpOnly: true,
        sameSite: "Lax",
      },
    ])
    await page.goto("http://localhost:8000/za/cart", {
      waitUntil: "domcontentloaded",
    })
    await expect(page.getByTestId("basket-line")).toHaveCount(6)
    await expect(page.locator(".basket-trigger")).toContainText("6")
    await page.screenshot({
      path: "artifacts/basket-page-desktop.png",
      fullPage: true,
    })
    const first = page.getByTestId("basket-line").filter({
      has: page.locator(".basket-line-title", {
        hasText: chosen[0].product.title,
      }),
    })
    const before = await page.getByTestId("cart-total").innerText()
    await first.getByRole("button", { name: /Increase quantity/ }).click()
    await expect(first.locator("output")).toHaveText("2")
    await expect(page.getByTestId("cart-total")).not.toHaveText(before)
    await expect(page.locator(".basket-trigger")).toContainText("7")
    console.log(
      "PASS cart quantity, totals and navigation count update together"
    )
    for (const [width, height] of [
      [1440, 1000],
      [1024, 768],
      [768, 700],
      [390, 844],
      [320, 568],
      [390, 360],
    ]) {
      await page.keyboard.press("Escape")
      await page.setViewportSize({ width, height })
      await page.locator(".basket-trigger").click()
      const panel = page.getByRole("dialog", {
        name: "Your basket",
        exact: true,
      })
      await expect(panel).toBeVisible()
      const bounds = await panel.boundingBox()
      assert(
        bounds.x >= 8 && bounds.x + bounds.width <= width - 7,
        `Basket horizontal clipping at ${width}`
      )
      assert(
        bounds.y >= 0 && bounds.y + bounds.height <= height - 7,
        `Basket vertical clipping at ${width}x${height}`
      )
      assert.equal(
        await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 1),
        false,
        "Basket horizontal overflow"
      )
      await panel
        .getByRole("link", { name: /Checkout/ })
        .scrollIntoViewIfNeeded()
      await expect(panel.getByRole("link", { name: /Checkout/ })).toBeVisible()
      if (width === 1440 || (width === 390 && height === 844))
        await page.screenshot({ path: `artifacts/basket-menu-${width}.png` })
      await page.keyboard.press("Escape")
      await expect(panel).toBeHidden()
      await expect(page.locator(".basket-trigger")).toBeFocused()
    }
    console.log(
      "PASS basket menu is unclipped across six viewport sizes, including short screens"
    )
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.locator(".basket-trigger").hover()
    await expect(page.getByTestId("nav-cart-dropdown")).toBeVisible()
    await page
      .getByRole("heading", { name: "Your basket" })
      .first()
      .click({ position: { x: 0, y: 0 } })
      .catch(() => {})
    await page.keyboard.press("Escape")
    await page.locator(".basket-trigger").press("Enter")
    await expect(
      page.getByRole("button", { name: "Close basket", exact: true })
    ).toBeFocused()
    await page.keyboard.press("Escape")
    console.log("PASS hover and keyboard access with Escape focus restoration")
    await page.locator(".basket-trigger").click()
    const panel = page.getByTestId("nav-cart-dropdown")
    await panel.locator(".basket-remove").last().scrollIntoViewIfNeeded()
    await panel.locator(".basket-remove").last().click()
    await expect(panel.getByTestId("basket-line")).toHaveCount(5)
    await page.keyboard.press("Escape")
    await expect(
      page.locator(".basket-main").getByTestId("basket-line")
    ).toHaveCount(5)
    console.log(
      "PASS removing an item from the basket menu updates the cart page"
    )
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      ),
      false,
      "Mobile cart overflow"
    )
    await page.screenshot({
      path: "artifacts/basket-page-mobile.png",
      fullPage: true,
    })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.getByTestId("checkout-button").click()
    await page.waitForURL("**/checkout?step=address")
    await expect(page.getByTestId("shipping-first-name-input")).toBeVisible()
    await page.getByTestId("add-discount-button").click()
    await expect(page.getByTestId("discount-input")).toBeVisible()
    await page.getByTestId("add-discount-button").click()
    await page.screenshot({
      path: "artifacts/checkout-address-desktop.png",
      fullPage: true,
    })
    await page.getByTestId("shipping-first-name-input").fill("Basket")
    await page.getByTestId("shipping-last-name-input").fill("Test")
    await page.getByTestId("shipping-address-input").fill("1 Example Street")
    await page.getByTestId("shipping-postal-code-input").fill("8001")
    await page.getByTestId("shipping-city-input").fill("Cape Town")
    await page.getByTestId("shipping-country-select").selectOption("za")
    await page.getByTestId("shipping-province-input").fill("Western Cape")
    await page
      .getByTestId("shipping-email-input")
      .fill(`basket-${Date.now()}@example.com`)
    await page.getByTestId("shipping-phone-input").fill("+27215550100")
    await page.getByTestId("submit-address-button").click()
    await page.waitForURL("**/checkout?step=delivery")
    console.log("PASS address submission advances to delivery")
    await page.getByTestId("delivery-option-radio").first().click()
    await expect(
      page.getByTestId("submit-delivery-option-button")
    ).toBeEnabled()
    await page.getByTestId("submit-delivery-option-button").click()
    await page.waitForURL("**/checkout?step=payment")
    await page.getByRole("radio", { name: /Manual Payment/ }).click()
    await page.getByTestId("submit-payment-button").click()
    await page.waitForURL("**/checkout?step=review")
    await expect(page.getByTestId("submit-order-button")).toBeEnabled()
    await page.screenshot({
      path: "artifacts/checkout-review-desktop.png",
      fullPage: true,
    })
    console.log("PASS delivery and payment selection reach order review")
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      ),
      false,
      "Mobile checkout overflow"
    )
    await page.screenshot({
      path: "artifacts/checkout-mobile.png",
      fullPage: true,
    })
    await page.locator(".checkout-summary-details>summary").click()
    await expect(page.locator(".checkout-summary-content")).toBeHidden()
    await page.locator(".checkout-summary-details>summary").click()
    await expect(page.locator(".checkout-summary-content")).toBeVisible()
    await page.getByRole("link", { name: /Your details/ }).click()
    await expect(page.getByTestId("shipping-first-name-input")).toHaveValue(
      "Basket"
    )
    console.log(
      "PASS mobile checkout summary expands and saved address can be edited"
    )
    const mobilePage = await context.newPage()
    await mobilePage.setViewportSize({ width: 390, height: 844 })
    await mobilePage.goto("http://localhost:8000/za/checkout?step=address", {
      waitUntil: "domcontentloaded",
    })
    await expect(mobilePage.locator(".checkout-summary-content")).toBeHidden()
    await expect(
      mobilePage.getByTestId("shipping-first-name-input")
    ).toBeVisible()
    await mobilePage.screenshot({
      path: "artifacts/checkout-address-mobile.png",
      fullPage: true,
    })
    await mobilePage.close()
    console.log(
      "PASS mobile checkout opens with compact order summary and visible address form"
    )
    await page.goto("http://localhost:8000/za/checkout?step=review", {
      waitUntil: "domcontentloaded",
    })
    await page.getByTestId("submit-order-button").click()
    await page.waitForURL("**/order/**/confirmed", { timeout: 30000 })
    console.log(
      "PASS redesigned checkout completes a manual-payment demo order"
    )
    const emptyContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const empty = await emptyContext.newPage()
    await empty.goto("http://localhost:8000/za/cart", {
      waitUntil: "domcontentloaded",
    })
    await expect(empty.locator(".basket-empty-page")).toBeVisible()
    await empty.locator(".basket-trigger").click()
    await expect(empty.locator(".basket-menu-empty")).toBeVisible()
    await empty.keyboard.press("Escape")
    await empty.goto("http://localhost:8000/za/checkout", {
      waitUntil: "domcontentloaded",
    })
    await empty.waitForURL("**/za/cart")
    await empty.screenshot({
      path: "artifacts/basket-empty-mobile.png",
      fullPage: true,
    })
    console.log("PASS empty basket states and empty-checkout redirect")
    assert.equal(errors.length, 0, errors.join("\n"))
    console.log("PASS zero browser runtime errors")
  } finally {
    await browser.close()
  }
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
