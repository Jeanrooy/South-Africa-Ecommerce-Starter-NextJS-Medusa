import type { Metadata } from "next"
import { listContent } from "@lib/data/content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Journal | Form & Field",
  description:
    "Stories on thoughtful objects, everyday rituals, and living well.",
}
export default async function Journal() {
  const posts = await listContent("post")
  return (
    <div className="content-container py-16">
      <p className="field-eyebrow">Notes from Form & Field</p>
      <h1 className="field-display my-6">The journal.</h1>
      <p className="max-w-lg text-gray-600 mb-16">
        Good things have a story. Meet the people, materials and ideas behind a
        more considered everyday.
      </p>
      {!posts.length && (
        <p className="py-16 border-t">
          Our first stories are on their way. Come back soon.
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-14">
        {posts.map((post) => (
          <LocalizedClientLink
            href={`/blog/${post.slug}`}
            key={post.id}
            className="group"
          >
            <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
              {post.cover && (
                <img
                  src={post.cover}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <p className="field-eyebrow mt-6">
              {new Date(post.publishedAt).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
            <h2 className="font-serif text-3xl my-3">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
            <span className="inline-block mt-5 border-b border-current">
              Read story ↗
            </span>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
