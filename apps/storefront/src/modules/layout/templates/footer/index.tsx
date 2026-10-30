import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Newsletter from "@modules/content/newsletter"
export default function Footer() {
  return (
    <footer className="field-footer">
      <div className="content-container">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_2fr] gap-12 py-16">
          <div>
            <LocalizedClientLink href="/" className="field-wordmark text-3xl">
              form & field®
            </LocalizedClientLink>
            <p className="mt-5 text-sm max-w-52 opacity-75">
              Thoughtful things.
              <br />
              Everyday living.
            </p>
          </div>
          <div>
            <h2 className="field-eyebrow mb-5">Explore</h2>
            {[
              ["Shop all", "/store"],
              ["The journal", "/blog"],
              ["Our story", "/pages/our-story"],
              ["Craft & materials", "/pages/craft-and-materials"],
              ["The gift edit", "/pages/gift-guide"],
              ["Your account", "/account"],
            ].map(([label, href]) => (
              <LocalizedClientLink
                key={href}
                href={href}
                className="block text-sm mb-3 opacity-80 hover:opacity-100"
              >
                {label}
              </LocalizedClientLink>
            ))}
          </div>
          <div>
            <h2 className="field-eyebrow mb-5">Here to help</h2>
            {[
              ["Contact", "/contact"],
              ["Common questions", "/pages/faqs"],
              ["Care guide", "/pages/care-guide"],
              ["Shipping", "/shipping"],
              ["Returns", "/returns"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
            ].map(([label, href]) => (
              <LocalizedClientLink
                key={href}
                href={href}
                className="block text-sm mb-3 opacity-80 hover:opacity-100"
              >
                {label}
              </LocalizedClientLink>
            ))}
          </div>
          <Newsletter />
        </div>
        <div className="border-t border-white/20 py-6 text-xs flex flex-wrap justify-between gap-4">
          <span>© {new Date().getFullYear()} Form & Field</span>
          <span>Considered design. Everyday purpose.</span>
        </div>
      </div>
    </footer>
  )
}
