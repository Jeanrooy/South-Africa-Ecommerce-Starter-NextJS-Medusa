import LocalizedClientLink from "@modules/common/components/localized-client-link"
export default function Hero() {
  return (
    <>
      <section className="field-hero">
        <div className="field-hero-copy">
          <p className="field-eyebrow">
            Objects for a life well lived · Est. 2026
          </p>
          <h1>
            Less, but
            <br />
            <em>better.</em>
          </h1>
          <p className="field-hero-description">
            Thoughtfully chosen essentials for your wardrobe, your home, and the
            moments in between.
          </p>
          <LocalizedClientLink className="field-button" href="/store">
            Explore the collection <span aria-hidden>↗</span>
          </LocalizedClientLink>
          <div className="field-hero-note">
            <span className="field-note-line" />
            Considered design. Everyday purpose.
          </div>
        </div>
        <div className="field-hero-image">
          <img
            src="/images/living.jpg"
            alt="Warm, sunlit interior with natural materials and considered furniture"
            fetchPriority="high"
          />
          <div className="field-image-caption">
            <span>THE EVERYDAY EDIT</span>
            <span>01 / A slower kind of living</span>
          </div>
        </div>
      </section>
      <section className="field-values" aria-label="Our approach">
        <p>
          <span>01</span> Made to be kept
        </p>
        <p>
          <span>02</span> Thoughtfully selected
        </p>
        <p>
          <span>03</span> Delivered with care
        </p>
      </section>
    </>
  )
}
