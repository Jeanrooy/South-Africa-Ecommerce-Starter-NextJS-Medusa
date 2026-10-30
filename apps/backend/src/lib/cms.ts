import { PrismaClient } from "@prisma/client"
import { z } from "@medusajs/framework/zod"
import sanitizeHtml from "sanitize-html"

const globalCms = globalThis as unknown as { cms?: PrismaClient }
export const cms = globalCms.cms ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalCms.cms = cms

const safeLink = z
  .string()
  .max(2000)
  .refine(
    (value) =>
      !/[\\\u0000-\u0020]/.test(value) &&
      (/^\/(?!\/)/.test(value) || /^https:\/\//.test(value)),
    "Use a relative path or HTTPS URL"
  )
export const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    heading: z.string().max(200),
    body: z.string().max(20000),
  }),
  z.object({
    type: z.literal("image"),
    src: z.url().startsWith("https://"),
    alt: z.string().max(300),
    caption: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("cta"),
    heading: z.string().max(200),
    body: z.string().max(2000),
    label: z.string().max(80),
    href: safeLink,
  }),
])
export const contentSchema = z.object({
  kind: z.enum(["page", "post"]),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(1000).default(""),
  cover: z.union([z.literal(""), z.url().startsWith("https://")]).default(""),
  seoTitle: z.string().max(200).default(""),
  description: z.string().max(500).default(""),
  blocks: z.array(blockSchema).max(100),
  layout: z.json().nullable().optional(),
  action: z.enum(["draft", "publish", "unpublish"]).optional(),
  version: z.number().int().nonnegative().optional(),
  published: z.boolean().default(false),
})

const widgetTypes = new Set([
  "Hero",
  "Heading",
  "Text",
  "RichText",
  "Image",
  "Button",
  "Story",
  "Features",
  "Cards",
  "Products",
  "Journal",
  "FAQ",
  "Quote",
  "Banner",
  "Space",
  "Columns",
  "Section",
])
export function validateLayout(layout: unknown): string | null {
  if (layout == null) return null
  if (JSON.stringify(layout).length > 500000) return "Page layout is too large"
  let nodes = 0
  const ids = new Set<string>()
  function walk(value: unknown, depth = 0): string | null {
    if (depth > 20 || ++nodes > 10000)
      return "Page layout exceeds nesting or item limits"
    if (Array.isArray(value)) {
      for (const item of value) {
        const error = walk(item, depth + 1)
        if (error) return error
      }
    } else if (value && typeof value === "object") {
      const item = value as Record<string, unknown>
      if (
        "type" in item &&
        (!widgetTypes.has(String(item.type)) ||
          !item.props ||
          typeof item.props !== "object")
      )
        return "Unknown or invalid page component"
      if ("type" in item) {
        const id = (item.props as Record<string, unknown>).id
        if (typeof id !== "string" || !id || ids.has(id))
          return "Every component needs a unique ID"
        ids.add(id)
      }
      for (const [key, child] of Object.entries(item)) {
        if (key === "richText" && typeof child === "string")
          item[key] = sanitizeHtml(child, {
            allowedTags: [
              "p",
              "h2",
              "h3",
              "h4",
              "strong",
              "em",
              "u",
              "s",
              "a",
              "ul",
              "ol",
              "li",
              "blockquote",
              "br",
              "hr",
              "span",
              "code",
            ],
            allowedAttributes: {
              a: ["href", "target", "rel"],
              p: ["style"],
              h2: ["style"],
              h3: ["style"],
            },
            allowedSchemes: ["https", "mailto"],
            allowedStyles: {
              "*": { "text-align": [/^(left|right|center|justify)$/] },
            },
          })
        if (
          ["href"].includes(key) &&
          typeof child === "string" &&
          child &&
          !safeLink.safeParse(child).success
        )
          return "Use relative paths or HTTPS links"
        if (
          ["image", "src"].includes(key) &&
          typeof child === "string" &&
          child &&
          !(
            /^https:\/\//.test(child) ||
            /^\/images\/[a-zA-Z0-9._/-]+$/.test(child) ||
            (process.env.NODE_ENV !== "production" &&
              /^http:\/\/localhost:9000\/static\/[a-zA-Z0-9._/-]+$/.test(child))
          )
        )
          return "Images must use HTTPS or a local image path"
        if (
          ["padding", "height", "limit"].includes(key) &&
          (typeof child !== "number" || child < 0 || child > 300)
        )
          return "Invalid numeric style value"
        const error = walk(child, depth + 1)
        if (error) return error
      }
    }
    return null
  }
  if (
    !layout ||
    typeof layout !== "object" ||
    !Array.isArray((layout as Record<string, unknown>).content)
  )
    return "Invalid page layout"
  return walk(layout)
}

export function publicationDate(published: boolean, previous?: Date | null) {
  return published ? (previous ?? new Date()) : null
}
