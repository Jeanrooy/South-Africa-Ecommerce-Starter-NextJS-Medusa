import type { ExecArgs } from "@medusajs/framework/types"
import { cms } from "../lib/cms"
import fs from "node:fs"
import path from "node:path"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function seedContent({ container }: ExecArgs) {
  for (const data of [
    {
      kind: "page",
      slug: "our-story",
      title: "Fewer things. More meaning.",
      excerpt: "A considered collection for everyday life.",
      blocks: [
        {
          type: "text",
          heading: "A slower kind of shopping",
          body: "Form & Field is a demonstration store built around a simple idea: choose useful things, enjoy them every day, and keep them for longer.\n\nReplace this story with your own before launching. Tell customers who you are, what you make, and why it matters.",
        },
        {
          type: "cta",
          heading: "Find your everyday favourites",
          body: "Explore the collection, chosen with purpose.",
          href: "/store",
          label: "Explore the collection",
        },
      ],
    },
    {
      kind: "post",
      slug: "the-art-of-choosing-well",
      title: "The art of choosing well",
      excerpt:
        "A few thoughts on buying less and finding the things you come back to.",
      cover:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
      blocks: [
        {
          type: "text",
          heading: "Start with your everyday",
          body: "The best objects aren't always the ones that make the biggest entrance. Sometimes they're the ones you reach for without thinking: a favourite cotton shirt, a generous cup, a familiar corner of the room.\n\nThink about how you live, and choose the things that belong in that life.",
        },
        {
          type: "text",
          heading: "Give good things time",
          body: "Look for materials you enjoy touching, shapes that serve a purpose, and details that feel considered. A little attention at the beginning can lead to years of everyday pleasure.",
        },
      ],
    },
  ])
    await cms.content.upsert({
      where: { kind_slug: { kind: data.kind, slug: data.slug } },
      update: {},
      create: { ...data, published: true, publishedAt: new Date() },
    })
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["token"],
    filters: { type: "publishable" },
  })
  if (keys[0]?.token) {
    const file = path.resolve(process.cwd(), "../storefront/.env.local")
    const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : ""
    const line = `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${keys[0].token}`
    fs.writeFileSync(
      file,
      /NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*/.test(current)
        ? current.replace(/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*/, line)
        : `${current}\n${line}\n`
    )
  }
  container
    .resolve(ContainerRegistrationKeys.LOGGER)
    .info("CMS content seeded and local storefront key configured.")
  await cms.$disconnect()
}
