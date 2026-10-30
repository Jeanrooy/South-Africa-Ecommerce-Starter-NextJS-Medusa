import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { ContentBlock } from "@lib/data/content"

export default function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="editorial-blocks">
      {blocks.map((block, index) => {
        if (block.type === "image")
          return (
            <figure key={index} className="my-12">
              <img
                src={block.src}
                alt={block.alt}
                className="w-full max-h-[650px] object-cover"
                loading="lazy"
              />
              {block.caption && (
                <figcaption className="text-sm mt-3 text-gray-600">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )
        if (block.type === "cta")
          return (
            <section key={index} className="editorial-cta">
              <h2>{block.heading}</h2>
              <p>{block.body}</p>
              {block.href.startsWith("/") ? (
                <LocalizedClientLink className="field-button" href={block.href}>
                  {block.label} <span aria-hidden>↗</span>
                </LocalizedClientLink>
              ) : (
                <a className="field-button" href={block.href}>
                  {block.label} <span aria-hidden>↗</span>
                </a>
              )}
            </section>
          )
        return (
          <section key={index} className="editorial-text">
            <h2>{block.heading}</h2>
            {block.body.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </section>
        )
      })}
    </div>
  )
}
