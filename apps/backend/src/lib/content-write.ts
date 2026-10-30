import { Prisma } from "@prisma/client"
import { cms, contentSchema, validateLayout } from "./cms"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function writeContent(
  req: MedusaRequest,
  res: MedusaResponse,
  id?: string
) {
  const parsed = contentSchema.safeParse(req.body)
  if (!parsed.success)
    return res.status(400).json({ message: parsed.error.message })
  const error = validateLayout(parsed.data.layout)
  if (error) return res.status(400).json({ message: error })
  const { action, version, layout, ...fields } = parsed.data
  const snapshot = { ...fields, published: true, layout: layout ?? null }
  const previous = id ? await cms.content.findUnique({ where: { id } }) : null
  if (id && !previous)
    return res.status(404).json({ message: "Content not found" })
  if (previous && version !== undefined && previous.version !== version)
    return res
      .status(409)
      .json({
        message:
          "This page changed in another session. Reopen it before saving.",
      })
  const conflict = await cms.content.findUnique({
    where: { kind_slug: { kind: fields.kind, slug: fields.slug } },
  })
  if (conflict && conflict.id !== id)
    return res.status(409).json({ message: "This slug is already in use." })
  const publish = action ? action === "publish" : fields.published
  const published =
    action === "draft"
      ? (previous?.published ?? false)
      : action === "unpublish"
        ? false
        : publish
  const previousSnapshot =
    previous?.publishedSnapshot ??
    (previous?.published
      ? JSON.parse(
          JSON.stringify({
            ...previous,
            publishedSnapshot: undefined,
            revisions: undefined,
          })
        )
      : null)
  const content = await cms.$transaction(async (tx) => {
    if (previous)
      await tx.contentRevision.create({
        data: {
          contentId: previous.id,
          data: JSON.parse(
            JSON.stringify({
              ...previous,
              publishedSnapshot: undefined,
              revisions: undefined,
            })
          ),
        },
      })
    const data = {
      ...fields,
      published,
      layout:
        layout == null ? Prisma.DbNull : (layout as Prisma.InputJsonValue),
      publishedSnapshot: publish
        ? (snapshot as Prisma.InputJsonValue)
        : (previousSnapshot ?? Prisma.DbNull),
      publishedAt: published ? (previous?.publishedAt ?? new Date()) : null,
      version: (previous?.version ?? 0) + 1,
    }
    return previous
      ? tx.content.update({
          where: { id: previous.id, version: previous.version },
          data,
        })
      : tx.content.create({ data })
  })
  return res.status(previous ? 200 : 201).json({ content })
}
