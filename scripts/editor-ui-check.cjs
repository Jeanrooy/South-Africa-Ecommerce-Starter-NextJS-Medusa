const { chromium, expect } = require("@playwright/test")
const fs = require("node:fs")
async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1050 },
  })
  const admin = JSON.parse(fs.readFileSync(".local/admin.json", "utf8"))
  let id
  let bearer
  try {
    await page.goto("http://localhost:9000/app/login")
    await page.getByRole("textbox", { name: /email/i }).fill(admin.email)
    await page.locator('input[type="password"]').fill(admin.password)
    await page.getByRole("button", { name: /continue|log in|sign in/i }).click()
    await page.waitForURL((url) => !url.pathname.endsWith("/login"))
    await page.goto("http://localhost:9000/app/content")
    await page.getByRole("button", { name: "＋ Create page" }).click()
    await page.getByLabel("Page title", { exact: true }).fill("Builder UI test")
    const slug = `ui-test-${Date.now()}`
    await page.getByLabel("URL slug", { exact: true }).fill(slug)
    await page
      .getByRole("button", { name: "Back to designing", exact: true })
      .click()
    await page.getByLabel("Insert page template").selectOption("Help page")
    await page
      .frameLocator("iframe")
      .first()
      .locator(".pb-faq")
      .first()
      .waitFor()
    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/admin/content") &&
        response.request().method() === "POST"
    )
    await page.getByRole("button", { name: "Save draft", exact: true }).click()
    const response = await saved
    const body = await response.json()
    if (!response.ok()) throw new Error(body.message)
    id = body.content.id
    await expect(page.locator(".builder-notice")).toContainText("Draft saved")
    console.log(
      "PASS visual template insertion and draft save through editor UI"
    )
    const publishing = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/admin/content/${id}`) &&
        response.request().method() === "POST"
    )
    await page
      .getByRole("button", { name: "Publish page", exact: true })
      .click()
    if (!(await publishing).ok()) throw new Error("UI publishing failed")
    await expect(page.locator(".builder-notice")).toContainText("Published")
    await page.getByRole("button", { name: "Revisions", exact: true }).click()
    await page.getByRole("dialog", { name: "Page revisions" }).waitFor()
    await expect(
      page.getByRole("button", { name: "Restore draft", exact: true }).first()
    ).toBeVisible()
    await page
      .getByRole("button", { name: "Close settings", exact: true })
      .click()
    console.log("PASS publishing and saved revision history through editor UI")
    await page.goto(`http://localhost:8000/za/pages/${slug}`)
    await page.locator(".pb-faq").first().waitFor()
    await page.locator(".pb-faq summary").first().click()
    await expect(page.locator(".pb-faq").first()).toHaveAttribute("open", "")
    console.log("PASS published layout and accordion interaction on storefront")
  } finally {
    if (id) {
      const auth = await fetch("http://localhost:9000/auth/user/emailpass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin),
      }).then((r) => r.json())
      bearer = auth.token
      await fetch(`http://localhost:9000/admin/content/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${bearer}` },
      })
    }
    await browser.close()
  }
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
