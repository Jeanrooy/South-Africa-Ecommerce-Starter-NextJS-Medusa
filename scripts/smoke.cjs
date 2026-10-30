const fs = require("node:fs")
const assert = require("node:assert/strict")
const env = Object.fromEntries(
  fs
    .readFileSync("apps/storefront/.env.local", "utf8")
    .split(/\r?\n/)
    .filter((x) => x.includes("="))
    .map((line) => {
      const i = line.indexOf("=")
      return [line.slice(0, i), line.slice(i + 1)]
    })
)
const root = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const key = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
let adminToken
const results = []
async function request(
  route,
  { method = "GET", body, admin = false, expected = 200, token } = {}
) {
  const response = await fetch(root + route, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": key,
      ...((admin ? adminToken : token)
        ? { Authorization: `Bearer ${admin ? adminToken : token}` }
        : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  assert.equal(
    response.status,
    expected,
    `${method} ${route}: ${response.status}: ${JSON.stringify(data)}`
  )
  return data
}
const pass = (label) => {
  results.push(label)
  console.log(`PASS ${label}`)
}
async function main() {
  await request("/admin/content", { expected: 401 })
  pass("CMS rejects unauthenticated access")
  const credentials = JSON.parse(fs.readFileSync(".local/admin.json", "utf8"))
  adminToken = (
    await request("/auth/user/emailpass", { method: "POST", body: credentials })
  ).token
  const { regions } = await request("/store/regions")
  const region = regions.find((r) => r.currency_code === "zar")
  assert(region)
  pass("South Africa / ZAR region available alongside Europe")
  const slug = `smoke-${Date.now()}`
  let id
  try {
    const draft = await request("/admin/content", {
      admin: true,
      method: "POST",
      expected: 201,
      body: {
        kind: "post",
        slug,
        title: "Smoke draft",
        blocks: [{ type: "text", heading: "Test", body: "Draft privacy test" }],
      },
    })
    id = draft.content.id
    assert.equal(
      (await request(`/store/content?kind=post&slug=${slug}`)).content.length,
      0
    )
    pass("Unpublished content is private")
    await request(`/admin/content/${id}`, {
      admin: true,
      method: "POST",
      body: { ...draft.content, published: true },
    })
    assert.equal(
      (await request(`/store/content?kind=post&slug=${slug}`)).content.length,
      1
    )
    pass("Publishing makes content visible")
    await request("/admin/content", {
      admin: true,
      method: "POST",
      expected: 400,
      body: {
        kind: "page",
        slug: "unsafe",
        title: "Unsafe",
        blocks: [
          {
            type: "cta",
            heading: "",
            body: "",
            label: "bad",
            href: "javascript:alert(1)",
          },
        ],
      },
    })
    pass("CMS rejects unsafe content links")
  } finally {
    if (id)
      await request(`/admin/content/${id}`, { admin: true, method: "DELETE" })
  }
  await request("/store/newsletter", {
    method: "POST",
    expected: 400,
    body: { email: "bad", consent: true },
  })
  pass("Newsletter validates consent and email")
  const stamp = Date.now()
  const customerAuth = await request("/auth/customer/emailpass/register", {
    method: "POST",
    body: {
      email: `smoke-${stamp}@example.com`,
      password: `Smoke-${stamp}-long-password`,
    },
  })
  const { customer } = await request("/store/customers", {
    method: "POST",
    token: customerAuth.token,
    body: {
      email: `smoke-${stamp}@example.com`,
      first_name: "Smoke",
      last_name: "Test",
    },
  })
  assert(customer.id)
  pass("Customer signup and account creation")
  const { products } = await request(
    `/store/products?region_id=${region.id}&fields=*variants.calculated_price`
  )
  const variant = products
    .flatMap((p) => p.variants)
    .find((v) => v.calculated_price)
  assert(variant)
  pass("Catalog resolves ZAR variant prices")
  const address = {
    first_name: "Smoke",
    last_name: "Test",
    address_1: "1 Test Street",
    city: "Cape Town",
    country_code: "za",
    postal_code: "8001",
    phone: "+27215550100",
  }
  const { cart } = await request("/store/carts", {
    method: "POST",
    body: {
      region_id: region.id,
      email: `smoke-${stamp}@example.com`,
      shipping_address: address,
      billing_address: address,
      items: [{ variant_id: variant.id, quantity: 1 }],
    },
  })
  const { shipping_options } = await request(
    `/store/shipping-options?cart_id=${cart.id}`
  )
  assert(shipping_options.length)
  await request(`/store/carts/${cart.id}/shipping-methods`, {
    method: "POST",
    body: { option_id: shipping_options[0].id },
  })
  pass("Cart and South African shipping calculation")
  const { payment_collection } = await request("/store/payment-collections", {
    method: "POST",
    body: { cart_id: cart.id },
  })
  await request(
    `/store/payment-collections/${payment_collection.id}/payment-sessions`,
    { method: "POST", body: { provider_id: "pp_system_default" } }
  )
  const completion = await request(`/store/carts/${cart.id}/complete`, {
    method: "POST",
    body: {},
  })
  assert.equal(completion.type, "order")
  pass("Manual-payment checkout completes an order")
  fs.mkdirSync("artifacts", { recursive: true })
  fs.writeFileSync(
    "artifacts/smoke-results.json",
    JSON.stringify(
      {
        passed: results,
        orderId: completion.order.id,
        at: new Date().toISOString(),
        note: "Local demo order only; no real payment or external email.",
      },
      null,
      2
    )
  )
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
