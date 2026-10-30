const { chromium, expect } = require("@playwright/test")
const fs = require("node:fs")
const assert = require("node:assert/strict")
async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  try {
    for (const route of [
      "/za",
      "/za/collections/home",
      "/za/collections/rituals",
      "/za/collections/textiles",
      "/za/collections/carry",
      "/za/pages/gift-guide",
      "/za/pages/craft-and-materials",
      "/za/pages/care-guide",
      "/za/pages/faqs",
      "/za/blog",
      "/za/contact",
    ]) {
      const response = await page.goto(`http://localhost:8000${route}`, {
        waitUntil: "domcontentloaded",
      })
      await page.locator("footer").waitFor()
      assert.equal(response.status(), 200, route)
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1
        ),
        false,
        `Overflow: ${route}`
      )
      console.log(`PASS redesigned route ${route}`)
    }
    await page.goto("http://localhost:8000/za", {
      waitUntil: "domcontentloaded",
    })
    await page.locator(".pb-product").first().waitFor()
    await page.evaluate(() =>
      document
        .querySelectorAll("img")
        .forEach((image) => (image.loading = "eager"))
    )
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll(".pb-page img")).every(
          (image) => image.complete
        ),
      { timeout: 20000 }
    )
    const broken = await page
      .locator(".pb-page img")
      .evaluateAll((images) =>
        images.filter((image) => !image.naturalWidth).map((image) => image.src)
      )
    fs.writeFileSync(
      "artifacts/broken-images.json",
      JSON.stringify(broken, null, 2)
    )
    assert.equal(
      broken.length,
      0,
      `Broken homepage images: ${broken.join(", ")}`
    )
    await page.screenshot({
      path: "artifacts/redesign-home-desktop.png",
      fullPage: true,
    })
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      ),
      false,
      "Mobile home overflow"
    )
    await page.screenshot({
      path: "artifacts/redesign-home-mobile.png",
      fullPage: true,
    })
    console.log("PASS homepage real product imagery and mobile layout")
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("http://localhost:8000/za/products/sunday-lounge-chair", {
      waitUntil: "domcontentloaded",
    })
    const hero = page.getByTestId("product-main-image")
    await hero.waitFor()
    const first = await hero.getAttribute("src")
    await page
      .getByRole("button", { name: "Next product image", exact: true })
      .click()
    await expect(hero).not.toHaveAttribute("src", first)
    await page
      .getByRole("button", { name: "Show product image 1", exact: true })
      .click()
    await expect(hero).toHaveAttribute("src", first)
    await hero.hover()
    await page.mouse.wheel(0, 150)
    await expect(hero).not.toHaveAttribute("src", first)
    console.log("PASS gallery thumbnails, arrows and wheel navigation")
    const price = await page
      .getByTestId("product-price")
      .getAttribute("data-value")
    await page.getByRole("button", { name: /Color: Olive/ }).click()
    await expect(hero).not.toHaveAttribute("src", first)
    await expect(page.getByTestId("product-price")).not.toHaveAttribute(
      "data-value",
      price
    )
    await expect(page.getByTestId("add-product-button")).toBeDisabled()
    await page.getByRole("button", { name: /Size: Large/ }).click()
    await expect(page.getByTestId("add-product-button")).toBeEnabled()
    console.log("PASS variant image, price, URL and inventory state")
    await page.screenshot({
      path: "artifacts/product-page-desktop.png",
      fullPage: true,
    })
    await page
      .getByRole("button", { name: "Increase quantity", exact: true })
      .click()
    await page.getByTestId("add-product-button").click()
    await expect(page.locator(".pdp-success")).toContainText(
      "Added to your bag"
    )
    await page.goto("http://localhost:8000/za/cart", {
      waitUntil: "domcontentloaded",
    })
    await expect(page.locator("body")).toContainText("Sunday Lounge Chair")
    console.log("PASS selected variant and quantity add to cart")
    await page.goto(
      "http://localhost:8000/za/products/everyday-stoneware-mug",
      { waitUntil: "domcontentloaded" }
    )
    await page.getByRole("button", { name: /Size: Large/ }).click()
    await page.getByRole("button", { name: /Buy now/ }).click()
    await page.waitForURL("**/checkout**")
    console.log("PASS Buy now opens checkout with selected variant")
    await page.goto("http://localhost:8000/za/products/sunday-lounge-chair", {
      waitUntil: "domcontentloaded",
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByTestId("product-main-image")).toBeVisible()
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      ),
      false,
      "Product mobile overflow"
    )
    await page.screenshot({
      path: "artifacts/product-page-mobile.png",
      fullPage: true,
    })
    const stage = page.getByRole("region", { name: /image gallery/ })
    const beforeSwipe = await hero.getAttribute("src")
    await stage.dispatchEvent("pointerdown", {
      clientX: 280,
      pointerType: "touch",
    })
    await stage.dispatchEvent("pointerup", {
      clientX: 80,
      pointerType: "touch",
    })
    await expect(hero).not.toHaveAttribute("src", beforeSwipe)
    console.log("PASS mobile product layout and swipe navigation")
    const admin = JSON.parse(fs.readFileSync(".local/admin.json", "utf8"))
    await page.setViewportSize({ width: 1600, height: 1050 })
    await page.goto("http://localhost:9000/app/login", {
      waitUntil: "domcontentloaded",
    })
    await page.getByRole("textbox", { name: /email/i }).fill(admin.email)
    await page.locator('input[type="password"]').fill(admin.password)
    await page.getByRole("button", { name: /continue|log in|sign in/i }).click()
    await page.waitForURL((url) => !url.pathname.endsWith("/login"))
    await page.goto("http://localhost:9000/app/content", {
      waitUntil: "domcontentloaded",
    })
    await page
      .getByRole("button", { name: "Objects for slower living", exact: true })
      .waitFor()
    await page.screenshot({
      path: "artifacts/builder-library.png",
      fullPage: true,
    })
    await page
      .getByRole("button", { name: "Objects for slower living", exact: true })
      .click()
    await page
      .getByRole("button", { name: "Publish page", exact: true })
      .waitFor()
    await page.frameLocator("iframe").first().locator(".pb-hero").waitFor()
    await page.screenshot({
      path: "artifacts/visual-page-builder.png",
      fullPage: true,
    })
    console.log("PASS visual page builder with live iframe canvas")
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
