const fs = require("node:fs")
const assert = require("node:assert/strict")
const env = fs.readFileSync("apps/storefront/.env.local", "utf8")
const key = env.match(/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.*)/)[1].trim()
const admin = JSON.parse(fs.readFileSync(".local/admin.json", "utf8"))
let token
async function api(route, method = "GET", body, status = 200, auth = true) {
  const response = await fetch(`http://localhost:9000${route}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": key,
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json()
  assert.equal(response.status, status, `${route}: ${JSON.stringify(result)}`)
  return result
}
const heading = (title) => ({
  type: "Heading",
  props: {
    id: "test-heading",
    title,
    eyebrow: "TEST",
    tone: "white",
    align: "left",
    padding: 40,
    width: "wide",
    visibility: "all",
    size: "large",
  },
})
async function main() {
  token = (await api("/auth/user/emailpass", "POST", admin)).token
  const slug = `builder-check-${Date.now()}`
  const initial = {
    kind: "page",
    slug,
    title: "Initial live title",
    blocks: [],
    layout: { root: { props: {} }, content: [heading("Initial live heading")] },
    action: "publish",
  }
  let record
  try {
    record = (await api("/admin/content", "POST", initial, 201)).content
    const draft = (
      await api(`/admin/content/${record.id}`, "POST", {
        ...record,
        title: "Private draft title",
        layout: {
          ...initial.layout,
          content: [heading("Private draft heading")],
        },
        action: "draft",
      })
    ).content
    const live = (
      await api(
        `/store/content?kind=page&slug=${slug}`,
        "GET",
        undefined,
        200,
        false
      )
    ).content[0]
    assert.equal(live.title, "Initial live title")
    assert.equal(live.layout.content[0].props.title, "Initial live heading")
    console.log("PASS draft saves preserve published metadata and layout")
    await api(
      `/admin/content/${record.id}`,
      "POST",
      { ...record, action: "publish" },
      409
    )
    console.log("PASS optimistic version conflicts reject stale saves")
    const published = (
      await api(`/admin/content/${record.id}`, "POST", {
        ...draft,
        action: "publish",
      })
    ).content
    const updated = (
      await api(
        `/store/content?kind=page&slug=${slug}`,
        "GET",
        undefined,
        200,
        false
      )
    ).content[0]
    assert.equal(updated.title, "Private draft title")
    console.log("PASS publishing updates live snapshot")
    const history = (await api(`/admin/content/${record.id}/revisions`))
      .revisions
    assert(history.length >= 2)
    assert.equal(history[history.length - 1].data.title, "Initial live title")
    console.log("PASS revision history preserves previous content")
    await api(
      `/admin/content/${record.id}`,
      "POST",
      {
        ...published,
        layout: {
          root: {},
          content: [{ type: "UnknownWidget", props: { id: "bad" } }],
        },
        action: "draft",
      },
      400
    )
    await api(
      `/admin/content/${record.id}`,
      "POST",
      {
        ...published,
        layout: {
          root: {},
          content: [
            {
              type: "Button",
              props: { id: "bad", href: "javascript:alert(1)" },
            },
          ],
        },
        action: "draft",
      },
      400
    )
    await api(
      `/admin/content/${record.id}`,
      "POST",
      {
        ...published,
        layout: { root: {}, content: [heading("A"), heading("B")] },
        action: "draft",
      },
      400
    )
    console.log("PASS layout component, URL and duplicate-ID validation")
    await api(`/admin/content/${record.id}`, "POST", {
      ...published,
      layout: {
        root: {},
        content: [
          {
            type: "Columns",
            props: {
              id: "columns",
              ratio: "equal",
              left: [heading("Nested heading")],
              right: [
                {
                  type: "Text",
                  props: {
                    id: "nested-text",
                    title: "",
                    body: "Nested content",
                  },
                },
              ],
            },
          },
        ],
      },
      action: "draft",
    })
    console.log("PASS nested column layouts persist")
    const richPage = (await api("/admin/content")).content.find(
      (page) => page.id === record.id
    )
    const sanitized = (
      await api(`/admin/content/${record.id}`, "POST", {
        ...richPage,
        action: "draft",
        layout: {
          root: {},
          content: [
            {
              type: "RichText",
              props: {
                id: "rich",
                richText:
                  '<p>Hello <strong>world</strong></p><script>alert(1)</script><a href="javascript:alert(1)">unsafe</a>',
              },
            },
          ],
        },
      })
    ).content
    assert(
      sanitized.layout.content[0].props.richText.includes(
        "<strong>world</strong>"
      )
    )
    assert(!sanitized.layout.content[0].props.richText.includes("script"))
    console.log("PASS rich text preserves formatting and strips unsafe HTML")
    const latest = (await api("/admin/content")).content.find(
      (page) => page.id === record.id
    )
    await api(`/admin/content/${record.id}`, "POST", {
      ...latest,
      action: "unpublish",
    })
    assert.equal(
      (
        await api(
          `/store/content?kind=page&slug=${slug}`,
          "GET",
          undefined,
          200,
          false
        )
      ).content.length,
      0
    )
    console.log("PASS unpublishing removes a page from the storefront")
    const catalog = await api("/admin/builder-data")
    assert(catalog.products.length >= 20)
    console.log("PASS visual editor receives the expanded product catalog")
  } finally {
    if (record) await api(`/admin/content/${record.id}`, "DELETE")
  }
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
