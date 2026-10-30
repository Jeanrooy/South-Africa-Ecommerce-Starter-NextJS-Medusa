const { chromium } = require("@playwright/test")
const fs = require("node:fs")
async function main() {
  fs.mkdirSync("artifacts", { recursive: true })
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  for (const route of [
    "/za",
    "/za/store",
    "/za/products/t-shirt",
    "/za/blog",
    "/za/blog/the-art-of-choosing-well",
    "/za/pages/our-story",
    "/za/account",
    "/za/cart",
    "/za/reset-password",
    "/za/contact",
    "/za/shipping",
    "/za/returns",
    "/za/privacy",
    "/za/terms",
  ]) {
    const response = await page.goto(`http://localhost:8000${route}`, {
      waitUntil: "domcontentloaded",
    })
    await page.locator("footer").waitFor()
    if (!response.ok()) throw new Error(`${route}: ${response.status()}`)
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      )
    )
      throw new Error(`Horizontal overflow: ${route}`)
    console.log(`PASS browser ${route}`)
  }
  await page.goto("http://localhost:8000/za", { waitUntil: "domcontentloaded" })
  await page.locator("footer").waitFor()
  await page
    .locator('.pb-product, [data-testid="product-wrapper"]')
    .first()
    .waitFor()
  await page.evaluate(() =>
    document.querySelectorAll("img").forEach((image) => {
      image.loading = "eager"
    })
  )
  await page.waitForFunction(() =>
    Array.from(
      document.querySelectorAll(
        '.pb-product img, [data-testid="product-wrapper"] img'
      )
    ).every((img) => img.complete && img.naturalWidth > 0)
  )
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: "artifacts/storefront-desktop.png",
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: "artifacts/storefront-mobile.png",
    fullPage: true,
  })
  if (
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    )
  )
    throw new Error("Mobile horizontal overflow")
  if (errors.length) throw new Error(errors.join("\n"))
  console.log("PASS mobile layout and zero browser runtime errors")
  const admin = JSON.parse(fs.readFileSync(".local/admin.json", "utf8"))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("http://localhost:9000/app/login", {
    waitUntil: "networkidle",
  })
  await page.getByRole("textbox", { name: /email/i }).fill(admin.email)
  await page.locator('input[type="password"]').fill(admin.password)
  await page.getByRole("button", { name: /continue|log in|sign in/i }).click()
  await page.waitForURL((url) => !url.pathname.endsWith("/login"))
  await page.goto("http://localhost:9000/app/content", {
    waitUntil: "networkidle",
  })
  await page.getByRole("heading", { name: "Content studio" }).waitFor()
  await page.screenshot({
    path: "artifacts/content-studio.png",
    fullPage: true,
  })
  console.log("PASS admin login and content studio renders")
  await browser.close()
}
main().catch((e) => {
  console.error(e.message)
  process.exitCode = 1
})
