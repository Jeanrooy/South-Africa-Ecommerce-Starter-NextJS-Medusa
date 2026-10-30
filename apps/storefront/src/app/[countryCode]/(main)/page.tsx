import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion, listRegions } from "@lib/data/regions"
import { toJsonLd } from "@lib/util/product-structured-data"
import { getSiteOrigin, listCountryCodes, STORE_NAME } from "@lib/util/site"
import { buildRegionsReturnPolicies } from "@lib/util/store-policies"
import { listContent } from "@lib/data/content"
import ContentBlocks from "@modules/content/blocks"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PageContent from "@modules/content/page-content"

export const dynamic = "force-static"
export const revalidate = 60

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const [origin, regions] = await Promise.all([getSiteOrigin(), listRegions()])

  return {
    title: "Form & Field | Thoughtful essentials for everyday living",
    description:
      "Discover thoughtfully chosen essentials for your wardrobe, your home, and the moments in between.",
    alternates: {
      canonical: `${origin}/${countryCode}`,
      languages: {
        ...Object.fromEntries(
          listCountryCodes(regions).map((code) => [
            `en-${code.toUpperCase()}`,
            `${origin}/${code}`,
          ])
        ),
        "x-default": origin,
      },
    },
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  const [origin, regions] = await Promise.all([getSiteOrigin(), listRegions()])
  const homeUrl = `${origin}/${countryCode}`
  const returnPolicies = buildRegionsReturnPolicies(regions)
  const [home] = await listContent("page", "home")
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: STORE_NAME,
      url: origin,
      ...(returnPolicies.length
        ? { hasMerchantReturnPolicy: returnPolicies }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: STORE_NAME,
      url: homeUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${homeUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  if (home?.layout)
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
        />
        <PageContent content={home} countryCode={countryCode} />
      </>
    )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
      />
      <Hero />
      {home && (
        <div className="content-container">
          <ContentBlocks blocks={home.blocks} />
        </div>
      )}
      <div className="py-16">
        <div className="content-container flex flex-wrap gap-6 items-end justify-between mb-12">
          <div>
            <p className="field-eyebrow">The considered collection</p>
            <h2 className="font-serif text-4xl mt-4">
              Your next everyday favourite.
            </h2>
          </div>
          <LocalizedClientLink
            href="/store"
            className="border-b border-current pb-1 text-sm"
          >
            Shop all ↗
          </LocalizedClientLink>
        </div>
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
      <section className="field-story">
        <img
          src="/images/details.jpg"
          alt="Natural textures and everyday objects in a calm home"
          loading="lazy"
        />
        <div>
          <p className="field-eyebrow">Our point of view</p>
          <h2>
            Good things.
            <br />
            For the long run.
          </h2>
          <p>
            We believe the objects you live with should earn their place.
            Useful, beautiful, and a pleasure to come back to, day after day.
          </p>
          <LocalizedClientLink
            href="/pages/our-story"
            className="border-b border-current pb-2"
          >
            A little about us ↗
          </LocalizedClientLink>
        </div>
      </section>
      <section className="content-container py-20 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <p className="field-eyebrow">The journal</p>
          <h2 className="font-serif text-4xl mt-4">
            Stories worth slowing down for.
          </h2>
        </div>
        <LocalizedClientLink href="/blog" className="field-button self-start">
          Read the journal ↗
        </LocalizedClientLink>
      </section>
    </>
  )
}
