import type { Config, Data, Field, Slot } from "@puckeditor/core"
import type { createElement } from "react"

export type BuilderData = Data
export type Card = {
  id: string
  title: string
  image: string
  href: string
  subtitle?: string
  price?: string
  category?: string
  badge?: string
}
export type BuilderContext = {
  prefix?: string
  products?: Card[]
  articles?: Card[]
}
export const widgetNames = [
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
] as const
export const emptyLayout: Data = {
  root: { props: { title: "Untitled page" } },
  content: [],
}
const photo =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85"
const text = (label: string): Field => ({ type: "text", label })
const number = (label: string, min = 0, max = 160): Field => ({
  type: "number",
  label,
  min,
  max,
})
const select = (label: string, values: string[]): Field => ({
  type: "select",
  label,
  options: values.map((value) => ({ label: value, value })),
})
const appearance: Record<string, Field> = {
  tone: select("Colour palette", ["paper", "white", "forest", "sand"]),
  align: select("Text alignment", ["left", "center", "right"]),
  padding: number("Vertical spacing (px)", 0, 160),
  width: select("Content width", ["wide", "reading", "full"]),
  visibility: select("Show on", ["all", "desktop", "mobile"]),
}
const defaultStyle = {
  tone: "white",
  align: "left",
  padding: 64,
  width: "wide",
  visibility: "all",
}
type Appearance = {
  tone?: string
  align?: string
  padding?: number
  width?: string
  visibility?: string
  [key: string]: unknown
}
type Item = {
  title: string
  body?: string
  image?: string
  href?: string
  label?: string
}

// React is supplied by each host. Medusa Admin uses React 18 and Next uses 19;
// keeping this module free of runtime React imports prevents a second React copy.
export function createBuilderConfig(
  runtime: { createElement: typeof createElement },
  context: BuilderContext = {}
): Config {
  const h = runtime.createElement
  const href = (value = "/store") =>
    value.startsWith("/") && !value.startsWith("//")
      ? `${context.prefix ?? "/za"}${value}`
      : value
  const style = (props: Appearance) => ({
    className: `pb-section pb-${props.tone ?? "white"} pb-width-${props.width ?? "wide"} pb-only-${props.visibility ?? "all"}`,
    style: {
      textAlign: props.align as "left" | "center" | "right",
      paddingTop: props.padding ?? 64,
      paddingBottom: props.padding ?? 64,
    },
  })
  const eyebrow = (value?: string) =>
    value ? h("p", { className: "pb-eyebrow" }, value) : null
  const button = (label?: string, url?: string, secondary = false) =>
    label
      ? h(
          "a",
          { href: href(url), className: secondary ? "pb-link" : "pb-button" },
          label,
          h("span", { "aria-hidden": true }, "↗")
        )
      : null
  const heading = (title: string, size = "large") =>
    h("h2", { className: `pb-heading pb-heading-${size}` }, title)
  const image = (src: string, alt = "", className?: string) =>
    h("img", { src, alt, className, loading: "lazy" })
  const cards = (items: Card[], columns = 4, product = false) =>
    h(
      "div",
      { className: `pb-grid pb-grid-${columns}` },
      ...items.map((item) =>
        h(
          "a",
          {
            key: item.id,
            href: href(item.href),
            className: `pb-card ${product ? "pb-product" : ""}`,
          },
          h(
            "div",
            { className: "pb-card-image" },
            image(item.image, item.title),
            item.badge ? h("span", { className: "pb-badge" }, item.badge) : null
          ),
          h(
            "div",
            { className: "pb-card-meta" },
            h(
              "div",
              null,
              item.subtitle
                ? h("p", { className: "pb-eyebrow" }, item.subtitle)
                : null,
              h("h3", null, item.title)
            ),
            item.price
              ? h("span", null, item.price)
              : h("span", { "aria-hidden": true }, "↗")
          )
        )
      )
    )
  const itemField: Field = {
    type: "array",
    label: "Items",
    arrayFields: {
      title: text("Title"),
      body: { type: "textarea", label: "Description" },
      image: text("Image URL"),
      href: text("Link"),
      label: text("Link label"),
    },
    defaultItemProps: {
      title: "New item",
      body: "Add a description",
      image: photo,
      href: "/store",
      label: "Explore",
    },
    getItemSummary: (item: Item) => item.title,
  }
  return {
    root: {
      fields: { title: text("Page label") },
      render: ({ children }: { children: import("react").ReactNode }) =>
        h("div", { className: "pb-page" }, children),
    },
    categories: {
      layout: { title: "Layout", components: ["Section", "Columns", "Space"] },
      essentials: {
        title: "Essentials",
        components: ["Heading", "Text", "RichText", "Image", "Button"],
      },
      editorial: {
        title: "Editorial",
        components: ["Hero", "Story", "Cards", "Quote", "Banner"],
      },
      commerce: {
        title: "Commerce & information",
        components: ["Products", "Journal", "Features", "FAQ"],
      },
    },
    components: {
      RichText: {
        label: "Rich text / inline editor",
        fields: {
          richText: { type: "richtext", contentEditable: true },
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          width: "reading",
          richText:
            "<h2>A story worth telling.</h2><p>Choose your words. Add emphasis, links and lists.</p>",
        },
        render: ({ richText, ...props }) =>
          h(
            "section",
            {
              ...style(props),
              className: `${style(props).className} pb-richtext`,
            },
            richText
          ),
      },
      Hero: {
        label: "Hero / campaign",
        fields: {
          eyebrow: text("Eyebrow"),
          title: text("Headline"),
          body: { type: "textarea", label: "Description" },
          image: text("Image URL"),
          alt: text("Image description"),
          label: text("Button label"),
          href: text("Button link"),
          layout: select("Layout", ["split", "overlay"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          tone: "paper",
          eyebrow: "THE CONSIDERED COLLECTION",
          title: "Room for the everyday.",
          body: "Objects with purpose. Materials with character. Discover a more considered way of living.",
          image: photo,
          alt: "A thoughtfully furnished home",
          label: "Explore the collection",
          href: "/store",
          layout: "split",
          padding: 0,
        },
        render: ({
          eyebrow: kicker,
          title,
          body,
          image: src,
          alt,
          label,
          href: url,
          layout,
          ...props
        }) =>
          h(
            "section",
            {
              ...style(props),
              className: `${style(props).className} pb-hero pb-hero-${layout}`,
            },
            h(
              "div",
              { className: "pb-hero-copy" },
              eyebrow(kicker),
              h("h1", null, title),
              h("p", { className: "pb-body" }, body),
              button(label, url),
              h(
                "p",
                { className: "pb-hero-foot" },
                "Fewer things. Better stories."
              )
            ),
            h(
              "div",
              { className: "pb-hero-visual" },
              image(src, alt),
              h(
                "span",
                { className: "pb-image-label" },
                "FORM & FIELD / EVERYDAY OBJECTS"
              )
            )
          ),
      },
      Heading: {
        fields: {
          eyebrow: text("Eyebrow"),
          title: text("Heading"),
          size: select("Size", ["large", "medium", "small"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          title: "A considered everyday.",
          eyebrow: "FORM & FIELD",
          size: "large",
          padding: 40,
        },
        render: ({ eyebrow: kicker, title, size, ...props }) =>
          h("section", style(props), eyebrow(kicker), heading(title, size)),
      },
      Text: {
        fields: {
          title: text("Heading"),
          body: {
            type: "textarea",
            label: "Paragraphs (separate with a blank line)",
          },
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          title: "Made for real life",
          body: "Useful, beautiful things that become part of your everyday.",
          width: "reading",
          padding: 40,
        },
        render: ({ title, body, ...props }) =>
          h(
            "section",
            style(props),
            title ? heading(title, "medium") : null,
            ...String(body)
              .split(/\n\s*\n/)
              .map((p, i) => h("p", { key: i, className: "pb-body" }, p))
          ),
      },
      Image: {
        fields: {
          image: text("Image URL"),
          alt: text("Image description"),
          caption: text("Caption"),
          ratio: select("Aspect ratio", ["wide", "square", "portrait"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          image: photo,
          alt: "A calm interior",
          caption: "A slower kind of living.",
          ratio: "wide",
          padding: 24,
        },
        render: ({ image: src, alt, caption, ratio, ...props }) =>
          h(
            "figure",
            style(props),
            image(src, alt, `pb-feature-image pb-ratio-${ratio}`),
            caption ? h("figcaption", null, caption) : null
          ),
      },
      Button: {
        fields: {
          label: text("Label"),
          href: text("Link"),
          variant: select("Style", ["solid", "text"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          label: "Discover more",
          href: "/store",
          variant: "solid",
          padding: 24,
        },
        render: ({ label, href: url, variant, ...props }) =>
          h("div", style(props), button(label, url, variant === "text")),
      },
      Story: {
        label: "Image & story",
        fields: {
          eyebrow: text("Eyebrow"),
          title: text("Heading"),
          body: { type: "textarea", label: "Story" },
          image: text("Image URL"),
          alt: text("Image description"),
          label: text("Link label"),
          href: text("Link"),
          reverse: select("Image position", ["left", "right"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          tone: "paper",
          eyebrow: "OUR POINT OF VIEW",
          title: "Good things.\nFor the long run.",
          body: "The pieces we surround ourselves with should earn their place. That's why we choose natural materials, honest details and enduring design.",
          image: photo,
          alt: "Natural materials in a warm interior",
          label: "Our story",
          href: "/pages/our-story",
          reverse: "left",
          padding: 0,
        },
        render: ({
          eyebrow: kicker,
          title,
          body,
          image: src,
          alt,
          label,
          href: url,
          reverse,
          ...props
        }) =>
          h(
            "section",
            {
              ...style(props),
              className: `${style(props).className} pb-story pb-story-${reverse}`,
            },
            image(src, alt),
            h(
              "div",
              { className: "pb-story-copy" },
              eyebrow(kicker),
              heading(title),
              h("p", { className: "pb-body" }, body),
              button(label, url, true)
            )
          ),
      },
      Features: {
        label: "Benefits / icon cards",
        fields: {
          items: itemField,
          columns: select("Columns", ["2", "3", "4"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          padding: 30,
          columns: "3",
          items: [
            {
              title: "Made to be kept",
              body: "Enduring materials, considered details.",
            },
            {
              title: "A personal touch",
              body: "Here to help you find your everyday favourite.",
            },
            {
              title: "Delivered with care",
              body: "Thoughtfully packed, from us to your door.",
            },
          ],
        },
        render: ({ items, columns, ...props }) =>
          h(
            "section",
            {
              ...style(props),
              className: `${style(props).className} pb-features`,
            },
            h(
              "div",
              { className: `pb-grid pb-grid-${columns}` },
              ...(items as Item[]).map((item, i) =>
                h(
                  "div",
                  { key: i },
                  h("span", { className: "pb-feature-number" }, `0${i + 1}`),
                  h("h3", null, item.title),
                  h("p", null, item.body)
                )
              )
            )
          ),
      },
      Cards: {
        label: "Categories / image cards",
        fields: {
          eyebrow: text("Eyebrow"),
          title: text("Heading"),
          items: itemField,
          columns: select("Columns", ["2", "3", "4"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          eyebrow: "FIND YOUR EVERYDAY",
          title: "A place for everything.",
          columns: "3",
          items: [
            { title: "Home & living", image: photo, href: "/store" },
            { title: "Objects & rituals", image: photo, href: "/store" },
            { title: "Everyday carry", image: photo, href: "/store" },
          ],
        },
        render: ({ eyebrow: kicker, title, items, columns, ...props }) =>
          h(
            "section",
            style(props),
            eyebrow(kicker),
            heading(title),
            cards(
              (items as Item[]).map((item, i) => ({
                id: String(i),
                title: item.title,
                image: item.image ?? photo,
                href: item.href ?? "/store",
                subtitle: item.body,
              })),
              Number(columns)
            )
          ),
      },
      Products: {
        label: "Live product collection",
        fields: {
          eyebrow: text("Eyebrow"),
          title: text("Heading"),
          category: select("Collection", [
            "all",
            "home",
            "rituals",
            "carry",
            "textiles",
          ]),
          limit: number("Product count", 1, 12),
          columns: select("Columns", ["2", "3", "4"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          eyebrow: "THE EVERYDAY EDIT",
          title: "Good company for your everyday.",
          category: "all",
          limit: 4,
          columns: "4",
        },
        render: ({
          eyebrow: kicker,
          title,
          category,
          limit,
          columns,
          ...props
        }) => {
          const products = (context.products ?? [])
            .filter((p) => category === "all" || p.category === category)
            .slice(0, Number(limit))
          return h(
            "section",
            style(props),
            h(
              "div",
              { className: "pb-section-head" },
              h("div", null, eyebrow(kicker), heading(title)),
              button(
                "Shop the collection",
                category === "all" ? "/store" : `/collections/${category}`,
                true
              )
            ),
            products.length
              ? cards(products, Number(columns), true)
              : h(
                  "p",
                  { className: "pb-empty" },
                  "Products will appear here when this collection is available."
                )
          )
        },
      },
      Journal: {
        label: "Live journal stories",
        fields: {
          eyebrow: text("Eyebrow"),
          title: text("Heading"),
          limit: number("Story count", 1, 6),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          eyebrow: "FIELD NOTES",
          title: "A little inspiration, a slower pace.",
          limit: 3,
        },
        render: ({ eyebrow: kicker, title, limit, ...props }) =>
          h(
            "section",
            style(props),
            h(
              "div",
              { className: "pb-section-head" },
              h("div", null, eyebrow(kicker), heading(title)),
              button("Read the journal", "/blog", true)
            ),
            cards((context.articles ?? []).slice(0, Number(limit)), 3)
          ),
      },
      FAQ: {
        label: "Frequently asked questions",
        fields: { title: text("Heading"), items: itemField, ...appearance },
        defaultProps: {
          ...defaultStyle,
          title: "A few things you might wonder.",
          width: "reading",
          items: [
            {
              title: "Where do you deliver?",
              body: "Available destinations and delivery options are shown at checkout.",
            },
            {
              title: "Can I return an item?",
              body: "Visit our returns page for the store's current policy.",
            },
          ],
        },
        render: ({ title, items, ...props }) =>
          h(
            "section",
            style(props),
            heading(title),
            ...(items as Item[]).map((item, i) =>
              h(
                "details",
                { key: i, className: "pb-faq" },
                h("summary", null, item.title),
                h("p", { className: "pb-body" }, item.body)
              )
            )
          ),
      },
      Quote: {
        label: "Quote / brand statement",
        fields: {
          body: { type: "textarea", label: "Quote" },
          title: text("Attribution"),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          tone: "sand",
          align: "center",
          body: "Buy less. Choose well. Make it last.",
          title: "A guiding principle",
        },
        render: ({ body, title, ...props }) =>
          h(
            "section",
            style(props),
            h("blockquote", { className: "pb-quote" }, body),
            h("p", { className: "pb-eyebrow" }, title)
          ),
      },
      Banner: {
        label: "Call to action",
        fields: {
          eyebrow: text("Eyebrow"),
          title: text("Heading"),
          body: { type: "textarea", label: "Description" },
          label: text("Button label"),
          href: text("Link"),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          tone: "forest",
          align: "center",
          eyebrow: "THE ART OF GIVING",
          title: "Something thoughtful.",
          body: "A good gift is something they'll reach for every day.",
          label: "Explore the gift edit",
          href: "/pages/gift-guide",
        },
        render: ({
          eyebrow: kicker,
          title,
          body,
          label,
          href: url,
          ...props
        }) =>
          h(
            "section",
            style(props),
            eyebrow(kicker),
            heading(title),
            h("p", { className: "pb-body" }, body),
            button(label, url)
          ),
      },
      Space: {
        label: "Spacer / divider",
        fields: {
          height: number("Height", 0, 200),
          line: select("Divider", ["none", "line"]),
        },
        defaultProps: { height: 40, line: "none" },
        render: ({ height, line }) =>
          h("div", {
            className: "pb-spacer",
            style: {
              height,
              borderBottom: line === "line" ? "1px solid #deded5" : "none",
            },
          }),
      },
      Columns: {
        label: "Two columns",
        fields: {
          left: { type: "slot" },
          right: { type: "slot" },
          ratio: select("Column ratio", ["equal", "wide-left", "wide-right"]),
          ...appearance,
        },
        defaultProps: {
          ...defaultStyle,
          left: [] as Slot,
          right: [] as Slot,
          ratio: "equal",
          padding: 24,
        },
        render: ({ left: Left, right: Right, ratio, ...props }) =>
          h(
            "section",
            style(props),
            h(
              "div",
              { className: `pb-columns pb-columns-${ratio}` },
              h(Left, {}),
              h(Right, {})
            )
          ),
      },
      Section: {
        label: "Section container",
        fields: { content: { type: "slot" }, ...appearance },
        defaultProps: { ...defaultStyle, content: [] as Slot, padding: 24 },
        render: ({ content: Content, ...props }) =>
          h("section", style(props), h(Content, {})),
      },
    },
  }
}

export function legacyToLayout(
  blocks: {
    type: string
    heading?: string
    body?: string
    src?: string
    alt?: string
    caption?: string
    href?: string
    label?: string
  }[]
): Data {
  return {
    root: { props: {} },
    content: blocks.map((b, i) =>
      b.type === "image"
        ? {
            type: "Image",
            props: {
              ...defaultStyle,
              id: `legacy-${i}`,
              image: b.src,
              alt: b.alt,
              caption: b.caption,
              ratio: "wide",
            },
          }
        : b.type === "cta"
          ? {
              type: "Banner",
              props: {
                ...defaultStyle,
                id: `legacy-${i}`,
                title: b.heading,
                body: b.body,
                href: b.href,
                label: b.label,
                tone: "paper",
              },
            }
          : {
              type: "Text",
              props: {
                ...defaultStyle,
                id: `legacy-${i}`,
                title: b.heading,
                body: b.body,
                width: "reading",
              },
            }
    ),
  }
}
