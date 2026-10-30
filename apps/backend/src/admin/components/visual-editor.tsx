import React, { useEffect, useMemo, useRef, useState } from "react"
import { Puck, type Data } from "@puckeditor/core"
import {
  createBuilderConfig,
  emptyLayout,
  legacyToLayout,
  type Card,
} from "@ecom/page-builder"
import "@puckeditor/core/puck.css"
import "@ecom/page-builder/styles.css"
import "./visual-editor.css"

type Page = {
  id?: string
  kind: "page" | "post"
  title: string
  slug: string
  excerpt: string
  cover: string
  seoTitle: string
  description: string
  published: boolean
  version?: number
  blocks: []
  layout?: Data | null
  updatedAt?: string
}
type Revision = { id: string; data: Page; createdAt: string }
const blank: Page = {
  kind: "page",
  title: "Untitled page",
  slug: "",
  excerpt: "",
  cover: "",
  seoTitle: "",
  description: "",
  published: false,
  blocks: [],
}
async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const body = await response.json()
  if (!response.ok)
    throw new Error(body.message ?? "Unable to complete request")
  return body
}
const recoveryKey = (id?: string) => `ecom-page-draft:${id ?? "new"}`

const VisualEditor = () => {
  const [pages, setPages] = useState<Page[]>([])
  const [draft, setDraft] = useState<Page | null>(null)
  const [layout, setLayout] = useState<Data>(emptyLayout)
  const [saved, setSaved] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [settings, setSettings] = useState(false)
  const [revisions, setRevisions] = useState<Revision[] | null>(null)
  const [products, setProducts] = useState<Card[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [editorKey, setEditorKey] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const serialized = draft ? JSON.stringify({ ...draft, layout }) : ""
  const dirty = !!draft && serialized !== saved
  const refresh = async () => setPages((await api("/admin/content")).content)
  useEffect(() => {
    refresh().catch((e) => setMessage(e.message))
    api("/admin/builder-data")
      .then((result) => setProducts(result.products))
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (!draft || !dirty) return
    const timer = setTimeout(
      () => localStorage.setItem(recoveryKey(draft.id), serialized),
      700
    )
    return () => clearTimeout(timer)
  }, [serialized, dirty, draft])
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])
  const open = (page: Page) => {
    const value = structuredClone(page)
    const data = value.layout ?? legacyToLayout(value.blocks)
    setDraft(value)
    setLayout(data)
    setSaved(JSON.stringify({ ...value, layout: data }))
    setEditorKey((k) => k + 1)
    setMessage("")
    setSettings(!page.id)
    const recovery = localStorage.getItem(recoveryKey(page.id))
    if (
      recovery &&
      recovery !== JSON.stringify({ ...value, layout: data }) &&
      window.confirm("Restore the unsaved local draft for this page?")
    ) {
      try {
        const restored = JSON.parse(recovery)
        setDraft({ ...restored, id: page.id, version: page.version })
        setLayout(restored.layout)
        setEditorKey((k) => k + 1)
      } catch {
        localStorage.removeItem(recoveryKey(page.id))
      }
    }
  }
  const config = useMemo(() => {
    const value = createBuilderConfig(React, {
      products,
      articles: pages
        .filter((p) => p.kind === "post" && p.published)
        .map((p) => ({
          id: p.id!,
          title: p.title,
          image: p.cover,
          href: `/blog/${p.slug}`,
          subtitle: "FIELD NOTES",
        })),
    })
    for (const component of Object.values(value.components)) {
      if (component.fields?.image)
        component.fields.image = {
          type: "custom",
          label: "Image",
          render: ({ value: image, onChange }) => (
            <div className="builder-image-field">
              {image && <img src={image} alt="Selected asset" />}
              <input
                aria-label="Image URL"
                value={image ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://…"
              />
              <select
                aria-label="Choose product image"
                value=""
                onChange={(e) => {
                  if (e.target.value) onChange(e.target.value)
                }}
              >
                <option value="">Choose a catalog image…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.image}>
                    {p.title}
                  </option>
                ))}
              </select>
              <label className="builder-upload">
                Upload image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const data = new FormData()
                    data.append("files", file)
                    try {
                      const result = await fetch("/admin/uploads", {
                        method: "POST",
                        credentials: "include",
                        body: data,
                      })
                      const body = await result.json()
                      if (!result.ok) throw new Error(body.message)
                      onChange(body.files[0].url)
                    } catch {
                      setMessage(
                        "Image upload failed. Check your file provider configuration."
                      )
                    }
                  }}
                />
              </label>
              <small>Uploaded images use your Medusa file provider.</small>
            </div>
          ),
        }
    }
    return value
  }, [products, pages])
  const save = async (
    action: "draft" | "publish" | "unpublish",
    data = layout
  ) => {
    if (!draft) return
    setBusy(true)
    setMessage("")
    try {
      const { content } = await api(
        draft.id ? `/admin/content/${draft.id}` : "/admin/content",
        {
          method: "POST",
          body: JSON.stringify({ ...draft, layout: data, action }),
        }
      )
      setDraft(content)
      setLayout(data)
      setSaved(JSON.stringify({ ...content, layout: data }))
      localStorage.removeItem(recoveryKey(draft.id))
      await refresh()
      setMessage(
        action === "publish"
          ? "Published. Storefront updates within 60 seconds."
          : action === "unpublish"
            ? "Page unpublished."
            : "Draft saved. Your published page is unchanged."
      )
    } catch (e) {
      setMessage((e as Error).message)
      setSettings(true)
    } finally {
      setBusy(false)
    }
  }
  const close = () => {
    if (
      dirty &&
      !window.confirm(
        "Leave the editor? Your unsaved draft is stored on this device."
      )
    )
      return
    setDraft(null)
    setMessage("")
    setSettings(false)
    setRevisions(null)
  }
  const duplicate = async (page: Page) => {
    const { id: _id, ...copy } = page
    open({
      ...copy,
      title: `${page.title} (copy)`,
      slug: `${page.slug}-copy-${Date.now().toString().slice(-4)}`,
      published: false,
      version: undefined,
    })
  }
  const useTemplate = (name: string) => {
    if (
      layout.content.length &&
      !window.confirm("Replace this draft layout with a template?")
    )
      return
    const types =
      name === "Landing page"
        ? ["Hero", "Features", "Products", "Story", "Journal", "Banner"]
        : name === "About page"
          ? ["Heading", "Story", "Quote", "Features", "Banner"]
          : name === "Help page"
            ? ["Heading", "FAQ", "Banner"]
            : []
    const data: Data = {
      root: { props: { title: draft?.title } },
      content: types.map((type) => ({
        type,
        props: {
          ...config.components[type].defaultProps,
          id: `${type}-${crypto.randomUUID()}`,
        },
      })),
    }
    setLayout(data)
    setEditorKey((k) => k + 1)
  }
  if (!draft)
    return (
      <div className="builder-library">
        <div className="builder-library-top">
          <div>
            <span className="builder-kicker">FORM & FIELD / WEBSITE</span>
            <h1>
              Content studio<span>Build something considered.</span>
            </h1>
            <p>Design pages, tell stories, and shape your storefront.</p>
          </div>
          <button
            className="builder-primary"
            onClick={() => open(structuredClone(blank))}
          >
            ＋ Create page
          </button>
        </div>
        <div className="builder-stats">
          <div>
            <strong>{pages.filter((p) => p.kind === "page").length}</strong>
            <span>Storefront pages</span>
          </div>
          <div>
            <strong>{pages.filter((p) => p.kind === "post").length}</strong>
            <span>Journal stories</span>
          </div>
          <div>
            <strong>{pages.filter((p) => p.published).length}</strong>
            <span>Published</span>
          </div>
          <div>
            <strong>17</strong>
            <span>Visual components</span>
          </div>
        </div>
        <div className="builder-library-tools">
          <div>
            {["all", "page", "post", "draft"].map((tab) => (
              <button
                key={tab}
                className={filter === tab ? "active" : ""}
                onClick={() => setFilter(tab)}
              >
                {tab === "all"
                  ? "All content"
                  : tab === "page"
                    ? "Pages"
                    : tab === "post"
                      ? "Journal"
                      : "Drafts"}
              </button>
            ))}
          </div>
          <input
            aria-label="Search content"
            placeholder="Search pages and stories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {message && <p role="status">{message}</p>}
        <div className="builder-content-grid">
          {pages
            .filter(
              (p) =>
                (filter === "all" ||
                  (filter === "draft" ? !p.published : p.kind === filter)) &&
                `${p.title} ${p.slug}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
            )
            .map((page) => (
              <article key={page.id}>
                <button className="builder-cover" onClick={() => open(page)}>
                  {page.cover ? (
                    <img src={page.cover} alt="" />
                  ) : (
                    <div>
                      <span>f&f</span>
                      <p>{page.title}</p>
                    </div>
                  )}
                  <span
                    className={
                      page.published ? "builder-status live" : "builder-status"
                    }
                  >
                    {page.published ? "Published" : "Draft"}
                  </span>
                </button>
                <div className="builder-card-info">
                  <small>
                    {page.kind === "post" ? "JOURNAL" : "PAGE"} / {page.slug}
                  </small>
                  <h2>
                    <button onClick={() => open(page)}>{page.title}</button>
                  </h2>
                  <div>
                    <button onClick={() => open(page)}>
                      Open visual editor ↗
                    </button>
                    <button
                      aria-label={`Duplicate ${page.title}`}
                      onClick={() => duplicate(page)}
                    >
                      Duplicate
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
    )
  return (
    <div className="builder-editor-shell">
      <div className="builder-toolbar">
        <button onClick={close}>← Content studio</button>
        <span>
          {draft.title} <small>{dirty ? "● Unsaved changes" : "Saved"}</small>
        </span>
        <div>
          <select
            aria-label="Insert page template"
            value=""
            onChange={(e) => {
              if (e.target.value) useTemplate(e.target.value)
            }}
          >
            <option value="">Templates</option>
            {["Landing page", "About page", "Help page", "Blank"].map(
              (name) => (
                <option key={name}>{name}</option>
              )
            )}
          </select>
          <button onClick={() => setSettings(true)}>Page & SEO</button>
          <button
            disabled={!draft.id}
            onClick={async () => {
              try {
                setRevisions(
                  (await api(`/admin/content/${draft.id}/revisions`)).revisions
                )
              } catch (e) {
                setMessage((e as Error).message)
              }
            }}
          >
            Revisions
          </button>
          <button
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(layout, null, 2)], {
                  type: "application/json",
                })
              )
              const a = document.createElement("a")
              a.href = url
              a.download = `${draft.slug || "page"}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Export
          </button>
          <button onClick={() => fileRef.current?.click()}>Import</button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="application/json"
            onChange={async (e) => {
              try {
                const file = e.target.files?.[0]
                if (!file) return
                const data = JSON.parse(await file.text())
                if (!Array.isArray(data.content)) throw new Error()
                if (
                  window.confirm("Replace the draft with this imported layout?")
                ) {
                  setLayout(data)
                  setEditorKey((k) => k + 1)
                }
              } catch {
                setMessage("Choose a valid page layout JSON file.")
              }
              e.target.value = ""
            }}
          />
        </div>
      </div>
      {message && (
        <div role="status" className="builder-notice">
          {message}
          <button aria-label="Dismiss message" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}
      <Puck
        key={`${draft.id ?? "new"}-${editorKey}`}
        config={config}
        data={layout}
        onChange={setLayout}
        onPublish={(data) => save("publish", data)}
        headerTitle={draft.title}
        headerPath={`/${draft.kind === "post" ? "blog" : draft.slug === "home" ? "" : "pages/"}${draft.slug === "home" ? "" : draft.slug}`}
        viewports={[
          { width: 1440, height: "auto", label: "Desktop" },
          { width: 768, height: "auto", label: "Tablet" },
          { width: 390, height: "auto", label: "Mobile" },
        ]}
        renderHeaderActions={({ state }) => (
          <div className="builder-save-actions">
            <button disabled={busy} onClick={() => save("draft", state.data)}>
              Save draft
            </button>
            <button
              disabled={busy}
              className="builder-primary"
              onClick={() => save("publish", state.data)}
            >
              {busy ? "Saving…" : "Publish page"}
            </button>
          </div>
        )}
      />
      {(settings || revisions) && (
        <div className="builder-modal-backdrop">
          <section
            className="builder-modal"
            role="dialog"
            aria-modal="true"
            aria-label={revisions ? "Page revisions" : "Page settings"}
          >
            <div className="builder-modal-head">
              <h2>{revisions ? "Revision history" : "Page settings & SEO"}</h2>
              <button
                aria-label="Close settings"
                onClick={() => {
                  setSettings(false)
                  setRevisions(null)
                }}
              >
                ×
              </button>
            </div>
            {revisions ? (
              <div>
                {!revisions.length && <p>No saved revisions yet.</p>}
                {revisions.map((revision) => (
                  <div className="builder-revision" key={revision.id}>
                    <span>
                      {new Date(revision.createdAt).toLocaleString()}
                      <small>{revision.data.title}</small>
                    </span>
                    <button
                      onClick={() => {
                        if (
                          !window.confirm(
                            "Restore this revision into your draft? The published page will not change until you publish."
                          )
                        )
                          return
                        setDraft({
                          ...revision.data,
                          id: draft.id,
                          version: draft.version,
                        })
                        setLayout(
                          revision.data.layout ??
                            legacyToLayout(revision.data.blocks)
                        )
                        setEditorKey((k) => k + 1)
                        setRevisions(null)
                        setSettings(false)
                      }}
                    >
                      Restore draft
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <label>
                  Content type
                  <select
                    value={draft.kind}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        kind: e.target.value as Page["kind"],
                      })
                    }
                  >
                    <option value="page">Storefront page</option>
                    <option value="post">Journal story</option>
                  </select>
                </label>
                {(
                  [
                    ["title", "Page title"],
                    ["slug", "URL slug"],
                    ["excerpt", "Excerpt / short description"],
                    ["cover", "Cover image URL"],
                    ["seoTitle", "Search title"],
                    ["description", "Meta description"],
                  ] as const
                ).map(([name, label]) => (
                  <label key={name}>
                    {label}
                    <input
                      value={draft[name]}
                      onChange={(e) =>
                        setDraft({ ...draft, [name]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <p>
                  Use “home” for the homepage. Policy slugs such as “shipping”
                  and “returns” replace their matching pages. Other pages live
                  at /pages/your-slug.
                </p>
                <div className="builder-seo-preview">
                  <strong>{draft.seoTitle || draft.title}</strong>
                  <small>formandfield.example / {draft.slug}</small>
                  <p>
                    {draft.description ||
                      draft.excerpt ||
                      "Add a description to help customers discover this page."}
                  </p>
                </div>
                <div className="builder-modal-actions">
                  <button
                    className="builder-primary"
                    onClick={() => setSettings(false)}
                  >
                    Back to designing
                  </button>
                  {draft.published && (
                    <button onClick={() => save("unpublish")}>Unpublish</button>
                  )}
                  {draft.id && (
                    <button
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Permanently delete this page and its revisions?"
                          )
                        )
                          return
                        try {
                          await api(`/admin/content/${draft.id}`, {
                            method: "DELETE",
                          })
                          localStorage.removeItem(recoveryKey(draft.id))
                          setDraft(null)
                          setSettings(false)
                          await refresh()
                        } catch (e) {
                          setMessage((e as Error).message)
                        }
                      }}
                    >
                      Delete page
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
export default VisualEditor
