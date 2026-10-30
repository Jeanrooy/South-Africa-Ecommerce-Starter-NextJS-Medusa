import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
  batchVariantImagesWorkflow,
} from "@medusajs/medusa/core-flows"
import { createBuilderConfig } from "@ecom/page-builder"
import React from "react"
import { cms } from "../lib/cms"

const img = (id: string, crop = "center") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=85&crop=${crop}`
const images = {
  living: img("photo-1600210492486-724fe5c67fb0"),
  chair: img("photo-1567538096630-e0c55bd6374c"),
  chair2: img("photo-1598300042247-d088f8ab3a91"),
  ceramic: img("photo-1610701596007-11502861dcfa"),
  cup: img("photo-1514228742587-6b1558fcca3d"),
  vase: img("photo-1687191883721-257d8cad5b54"),
  lamp: img("photo-1507473885765-e6ed057f782c"),
  bag: img("photo-1544816155-12df9643f363"),
  backpack: img("photo-1553062407-98eeb64c6a62"),
  desk: img("photo-1449247709967-d4461a6a6103"),
  textile: img("photo-1600166898405-da9535204843"),
  candle: img("photo-1603006905003-be475563bc59"),
  coffee: img("photo-1495474472287-4d71bcdd2085"),
  room: img("photo-1586023492125-27b2c045efd7"),
}
const catalog = [
  {
    title: "Sunday Lounge Chair",
    handle: "sunday-lounge-chair",
    category: "home",
    amount: 4290,
    image: images.chair,
    second: images.chair2,
    colors: ["Sand", "Olive"],
    material: "Timber frame with woven upholstery",
    body: "A comfortable place to pause. An open silhouette and soft upholstery bring a little calm to reading corners and relaxed living spaces.",
    care: "Vacuum gently with a soft upholstery attachment. Blot spills with a clean, dry cloth. Keep out of strong direct sunlight.",
    weight: 8200,
    length: 76,
    width: 69,
    height: 81,
  },
  {
    title: "Everyday Stoneware Mug",
    handle: "everyday-stoneware-mug",
    category: "rituals",
    amount: 245,
    image: images.cup,
    second: images.ceramic,
    colors: ["Oat", "Charcoal"],
    material: "Glazed stoneware",
    body: "For the first coffee and the last cup of tea. A generous, comforting mug with a softly rounded handle and tactile glazed finish.",
    care: "Wash before first use. Hand washing will help preserve the glazed finish. Avoid sudden temperature changes.",
    weight: 340,
    length: 11,
    width: 9,
    height: 10,
  },
  {
    title: "Gather Ceramic Vase",
    handle: "gather-ceramic-vase",
    category: "home",
    amount: 590,
    image: images.vase,
    second: images.cup,
    colors: ["Natural", "Clay"],
    material: "Textured ceramic",
    body: "A sculptural home for a few stems, or a quiet object in its own right. Organic texture meets an uncomplicated silhouette.",
    care: "Wipe with a soft damp cloth. Avoid abrasive cleaners.",
    weight: 850,
    length: 15,
    width: 15,
    height: 24,
  },
  {
    title: "Arc Reading Lamp",
    handle: "arc-reading-lamp",
    category: "home",
    amount: 1690,
    image: images.lamp,
    second: images.desk,
    colors: ["Cream", "Black"],
    material: "Powder-coated metal and timber",
    body: "A warm pool of light for the end of the day. A simple reading companion for desks, bedside tables and a favourite armchair.",
    care: "Unplug before cleaning. Wipe with a dry cloth. Refer to the included electrical and bulb instructions.",
    weight: 1600,
    length: 25,
    width: 20,
    height: 45,
  },
  {
    title: "Slow Morning Candle",
    handle: "slow-morning-candle",
    category: "rituals",
    amount: 320,
    image: images.candle,
    second: images.ceramic,
    colors: ["Natural", "Terracotta"],
    material: "Wax blend in a reusable vessel",
    body: "Make an ordinary evening feel like a small occasion. A considered vessel to keep long after the candle has burned.",
    care: "Never leave a burning candle unattended. Keep away from children, pets and drafts. Trim the wick before lighting.",
    weight: 430,
    length: 9,
    width: 9,
    height: 10,
  },
  {
    title: "Weekender Canvas Bag",
    handle: "weekender-canvas-bag",
    category: "carry",
    amount: 890,
    image: images.bag,
    second: images.desk,
    colors: ["Sand", "Forest"],
    material: "Heavy cotton canvas",
    body: "Room for a change of scene. An easy everyday carry for market mornings, short getaways and everything in between.",
    care: "Spot clean with cool water and mild soap. Air dry naturally.",
    weight: 650,
    length: 42,
    width: 18,
    height: 36,
  },
  {
    title: "Woven Cotton Throw",
    handle: "woven-cotton-throw",
    category: "textiles",
    amount: 790,
    image: images.textile,
    second: images.room,
    colors: ["Oat", "Olive"],
    material: "Woven cotton",
    body: "An extra layer for slow starts and cooler evenings. Soft texture and a generous drape bring warmth to a bed, sofa or reading chair.",
    care: "Gentle cold wash. Reshape while damp and air dry. Do not bleach.",
    weight: 780,
    length: 180,
    width: 130,
    height: 1,
  },
  {
    title: "Linen Cushion Cover",
    handle: "linen-cushion-cover",
    category: "textiles",
    amount: 390,
    image: images.room,
    second: images.textile,
    colors: ["Natural", "Terracotta"],
    material: "Linen blend; cover only",
    body: "A little texture changes a room. An understated cover with a soft hand and a lived-in character. Cushion insert sold separately.",
    care: "Cold hand wash or a gentle machine cycle. Dry in shade. Warm iron if desired.",
    weight: 190,
    length: 50,
    width: 50,
    height: 1,
  },
  {
    title: "Ritual Pour-over Set",
    handle: "ritual-pour-over-set",
    category: "rituals",
    amount: 650,
    image: images.coffee,
    second: images.cup,
    colors: ["Cream", "Charcoal"],
    material: "Ceramic dripper and serving vessel",
    body: "A few unhurried minutes and a better morning. Make space for the ritual of coffee with a simple pour-over companion.",
    care: "Rinse after use. Hand wash gently. Allow to cool before cleaning.",
    weight: 680,
    length: 15,
    width: 15,
    height: 22,
  },
  {
    title: "Market Day Tote",
    handle: "market-day-tote",
    category: "carry",
    amount: 290,
    image: images.bag,
    second: images.room,
    colors: ["Natural", "Black"],
    material: "Cotton canvas",
    body: "From the corner shop to a day out. A useful everyday tote with room for the little things you pick up along the way.",
    care: "Spot clean or gently hand wash. Air dry flat.",
    weight: 260,
    length: 38,
    width: 12,
    height: 40,
  },
  {
    title: "Hearth Woven Rug",
    handle: "hearth-woven-rug",
    category: "textiles",
    amount: 2290,
    image: images.textile,
    second: images.living,
    colors: ["Sand", "Charcoal"],
    material: "Woven natural-fibre blend",
    body: "The foundation of a calmer room. A tactile weave that brings warmth, rhythm and a sense of home underfoot.",
    care: "Vacuum on a low setting. Rotate periodically. For spills, blot immediately. Professional cleaning recommended.",
    weight: 3100,
    length: 200,
    width: 140,
    height: 1,
  },
  {
    title: "Still Life Table Lamp",
    handle: "still-life-table-lamp",
    category: "home",
    amount: 1190,
    image: images.lamp,
    second: images.living,
    colors: ["Natural", "Clay"],
    material: "Ceramic-inspired base and fabric shade",
    body: "Soft light, strong character. A quietly expressive lamp for corners that deserve a little attention.",
    care: "Unplug before cleaning. Dust with a soft cloth. See supplied fitting instructions.",
    weight: 1500,
    length: 24,
    width: 24,
    height: 43,
  },
  {
    title: "Daily Essentials Pouch",
    handle: "daily-essentials-pouch",
    category: "carry",
    amount: 225,
    image: images.bag,
    second: images.desk,
    colors: ["Sand", "Navy"],
    material: "Cotton canvas with zip closure",
    body: "A small home for everyday odds and ends. Keep charging cables, stationery or travel essentials together.",
    care: "Spot clean gently. Do not tumble dry.",
    weight: 110,
    length: 22,
    width: 6,
    height: 14,
  },
  {
    title: "Gather Serving Bowl",
    handle: "gather-serving-bowl",
    category: "rituals",
    amount: 490,
    image: images.ceramic,
    second: images.cup,
    colors: ["Cream", "Clay"],
    material: "Glazed stoneware",
    body: "For meals that become memories. A generous bowl for sharing, serving or leaving out with the season's fruit.",
    care: "Hand wash with mild detergent. Avoid thermal shock.",
    weight: 920,
    length: 26,
    width: 26,
    height: 9,
  },
  {
    title: "Sunday Linen Napkins",
    handle: "sunday-linen-napkins",
    category: "textiles",
    amount: 345,
    image: images.textile,
    second: images.coffee,
    colors: ["Natural", "Olive"],
    material: "Linen blend; set of two",
    body: "Dress an everyday table with a softer touch. A reusable pair that becomes more familiar with every meal.",
    care: "Gentle cold wash with similar colours. Line dry. Do not bleach.",
    weight: 120,
    length: 45,
    width: 45,
    height: 1,
  },
  {
    title: "Field Notes Backpack",
    handle: "field-notes-backpack",
    category: "carry",
    amount: 1090,
    image: images.backpack,
    second: images.desk,
    colors: ["Forest", "Black"],
    material: "Durable woven canvas",
    body: "Keep the day close at hand. An uncomplicated backpack for the workday, a train ride or an unexpected detour.",
    care: "Spot clean with a damp cloth. Allow to air dry fully before storage.",
    weight: 780,
    length: 30,
    width: 15,
    height: 43,
  },
]

export default async function expandStore({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id"],
  })
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  })
  const collections: { id: string; handle: string }[] = existingCollections.map(
    (c) => ({ id: c.id, handle: c.handle ?? "" })
  )
  for (const [handle, title] of [
    ["home", "Home & living"],
    ["rituals", "Objects & rituals"],
    ["carry", "Everyday carry"],
    ["textiles", "Soft living"],
  ]) {
    if (!collections.some((c) => c.handle === handle)) {
      const { result } = await createCollectionsWorkflow(container).run({
        input: { collections: [{ title, handle }] },
      })
      collections.push(...result.map((c) => ({ id: c.id, handle: c.handle })))
    }
  }
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  for (const [index, item] of catalog.entries()) {
    if (existing.some((p) => p.handle === item.handle)) continue
    const photos = [
      item.image,
      item.image.replace("crop=center", "crop=left"),
      item.second,
      item.second.replace("crop=center", "crop=right"),
    ]
    const collection = collections.find((c) => c.handle === item.category)!
    const {
      result: [product],
    } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: item.title,
            handle: item.handle,
            description: item.body,
            subtitle: "Considered design. Everyday purpose.",
            status: ProductStatus.PUBLISHED,
            collection_id: collection.id,
            shipping_profile_id: profiles[0].id,
            weight: item.weight,
            length: item.length,
            width: item.width,
            height: item.height,
            material: item.material,
            thumbnail: item.image,
            images: photos.map((url) => ({ url })),
            options: [
              { title: "Color", values: item.colors },
              { title: "Size", values: ["Standard", "Large"] },
            ],
            metadata: {
              category: item.category,
              category_label: (
                {
                  home: "Home & living",
                  rituals: "Objects & rituals",
                  carry: "Everyday carry",
                  textiles: "Soft living",
                } as Record<string, string>
              )[item.category],
              short_description: item.body.split(". ")[0] + ".",
              materials: item.material,
              care: item.care,
              badge: index < 4 ? "THE EVERYDAY EDIT" : "",
              demo_catalog: true,
            },
            variants: item.colors.flatMap((color, colorIndex) =>
              ["Standard", "Large"].map((size, sizeIndex) => ({
                title: `${color} / ${size}`,
                sku: `FF-${index + 1}-${color.toUpperCase()}-${size.toUpperCase()}`,
                options: { Color: color, Size: size },
                manage_inventory: true,
                prices: [
                  {
                    currency_code: "zar",
                    amount: item.amount + sizeIndex * 100 + colorIndex * 30,
                  },
                  {
                    currency_code: "eur",
                    amount: Math.round(item.amount / 20) + sizeIndex * 5,
                  },
                  {
                    currency_code: "usd",
                    amount: Math.round(item.amount / 18) + sizeIndex * 6,
                  },
                ],
              }))
            ),
            sales_channels: [{ id: stores[0].default_sales_channel_id! }],
          },
        ],
      },
    })
    const {
      data: [created],
    } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "images.*",
        "variants.*",
        "variants.options.*",
        "variants.inventory_items.*",
      ],
      filters: { id: product.id },
    })
    for (const variant of created.variants ?? []) {
      const colorIndex = item.colors.findIndex((color) =>
        variant.title.startsWith(color)
      )
      const matched =
        created.images?.filter((image) =>
          photos.slice(colorIndex * 2, colorIndex * 2 + 2).includes(image.url)
        ) ?? []
      await batchVariantImagesWorkflow(container).run({
        input: {
          variant_id: variant.id,
          add: matched.map((image) => image.id),
        },
      })
    }
  }
  const { data: inventory } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku", "location_levels.*"],
  })
  const missing = inventory.filter(
    (item) => item.sku?.startsWith("FF-") && !item.location_levels?.length
  )
  if (missing.length)
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: missing.map((item, index) => ({
          inventory_item_id: item.id,
          location_id: locations[0].id,
          stocked_quantity: index === 3 ? 0 : 20 + (index % 9),
        })),
      },
    })

  // Connect the upstream apparel demo's existing photos to its native variants.
  const { data: apparel } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "options.*",
      "images.*",
      "variants.*",
      "variants.options.*",
      "variants.images.*",
    ],
    filters: { handle: ["t-shirt", "sweatshirt", "sweatpants", "shorts"] },
  })
  for (const product of apparel) {
    const colorOption = product.options?.find((option) =>
      /colou?r/i.test(option.title)
    )
    for (const variant of product.variants ?? []) {
      if (variant.images?.length) continue
      const color = variant.options
        ?.find((option) => option.option_id === colorOption?.id)
        ?.value.toLowerCase()
      const photos =
        product.images?.filter(
          (image) => !color || image.url.toLowerCase().includes(color)
        ) ?? []
      if (photos.length)
        await batchVariantImagesWorkflow(container).run({
          input: {
            variant_id: variant.id,
            add: photos.map((image) => image.id),
          },
        })
    }
  }

  const config = createBuilderConfig(React)
  let nodeId = 0
  const node = (type: string, props: Record<string, unknown> = {}) => ({
    type,
    props: {
      ...config.components[type].defaultProps,
      ...props,
      id: `${type}-seed-${++nodeId}`,
    },
  })
  const layout = (...content: ReturnType<typeof node>[]) => ({
    root: { props: { title: "Form & Field" } },
    content,
  })
  const pages = [
    {
      slug: "home",
      title: "Objects for slower living",
      layout: layout(
        node("Hero", {
          title: "Objects for\nslower living.",
          eyebrow: "THE EVERYDAY EDIT / VOL. 01",
          body: "A collection of useful, beautiful things. Chosen with care for the spaces you make and the life you live.",
          image: images.living,
          label: "Find your everyday favourite",
        }),
        node("Features"),
        node("Cards", {
          title: "A little more at home.",
          eyebrow: "EXPLORE YOUR EVERYDAY",
          items: [
            {
              title: "Home & living",
              image: images.chair,
              body: "Make room for the good things.",
              href: "/collections/home",
            },
            {
              title: "Objects & rituals",
              image: images.ceramic,
              body: "Small moments, well considered.",
              href: "/collections/rituals",
            },
            {
              title: "Soft living",
              image: images.textile,
              body: "Texture. Warmth. A softer pace.",
              href: "/collections/textiles",
            },
          ],
        }),
        node("Products", { title: "Your next everyday favourite.", limit: 8 }),
        node("Story", {
          title: "Good things.\nFor the long run.",
          image: images.desk,
          body: "A useful object can make an ordinary day feel a little different. We look for natural textures, honest details and the kind of design you grow to appreciate more over time.",
          label: "Meet Form & Field",
        }),
        node("Products", {
          eyebrow: "OUT INTO THE EVERYDAY",
          title: "Take the good things with you.",
          category: "carry",
          limit: 4,
        }),
        node("Quote", {
          body: "A home isn't made in a day.\nIt's made in the everyday.",
          title: "THE FORM & FIELD WAY",
        }),
        node("Journal", { limit: 3 }),
        node("Banner", {
          title: "A good gift feels personal.",
          body: "For new homes, familiar faces and small celebrations. Discover the gift edit.",
        })
      ),
    },
    {
      slug: "gift-guide",
      title: "The art of thoughtful giving",
      cover: images.ceramic,
      layout: layout(
        node("Hero", {
          title: "Something\nthoughtful.",
          eyebrow: "THE GIFT EDIT",
          body: "Good gifts have a way of becoming part of someone's everyday. Explore objects for slow mornings, new beginnings and just because.",
          image: images.ceramic,
          label: "Shop objects & rituals",
          href: "/collections/rituals",
        }),
        node("Products", {
          category: "rituals",
          title: "Small gestures. Lasting favourites.",
          limit: 4,
        }),
        node("Story", {
          title: "For a softer landing.",
          body: "A throw for their favourite chair. A soft layer for a new home. Choose gifts that feel like an invitation to settle in.",
          image: images.textile,
          href: "/collections/textiles",
          label: "Explore soft living",
          reverse: "right",
        }),
        node("Products", {
          category: "textiles",
          limit: 4,
          title: "A little warmth goes a long way.",
        })
      ),
    },
    {
      slug: "craft-and-materials",
      title: "Materials with a story",
      cover: images.ceramic,
      layout: layout(
        node("Heading", {
          title: "Good design starts\nwith honest materials.",
          eyebrow: "CRAFT & CHARACTER",
          align: "center",
        }),
        node("Story", {
          title: "The beauty of the imperfect.",
          image: images.ceramic,
          body: "Texture makes an object feel alive. The subtle differences in a glaze, a visible weave, a grain that catches the light: these are the details we look for.",
          href: "/collections/rituals",
          label: "Explore the object collection",
        }),
        node("Text", {
          title: "Choose with a little curiosity.",
          body: "Get to know what something is made from, how to care for it and how it fits your day. Our product pages bring those details together, so you can make a considered choice.\n\nProduct materials, dimensions and care information are listed individually. Reach out before ordering if you need a detail we haven't covered.",
        }),
        node("FAQ", {
          title: "A few material notes.",
          items: [
            {
              title: "Why can textures and colours vary?",
              body: "Natural materials and photographic lighting can create variations in appearance. Check the specific product information and ask us if matching an existing item is important.",
            },
            {
              title: "Where do I find care information?",
              body: "Open the care guide on the product page and follow the label supplied with your item.",
            },
          ],
        })
      ),
    },
    {
      slug: "care-guide",
      title: "Keep the good things good",
      cover: images.textile,
      layout: layout(
        node("Heading", {
          title: "A little care.\nA longer story.",
          eyebrow: "THE CARE GUIDE",
          align: "center",
        }),
        node("Story", {
          title: "Make it last.",
          image: images.textile,
          body: "The things we use every day deserve a little attention. Follow the product's own care instructions first; these notes are a starting point.",
          label: "Explore the collection",
          href: "/store",
        }),
        node("FAQ", {
          title: "Everyday care, by material.",
          items: [
            {
              title: "Ceramics & stoneware",
              body: "Wash gently using mild detergent. Avoid sudden temperature changes and abrasive cleaning products. Follow each product's specific guidance.",
            },
            {
              title: "Cotton & linen",
              body: "Use a gentle, cool wash where the label permits. Air dry naturally and keep darker colours separate.",
            },
            {
              title: "Upholstery & woven textures",
              body: "Vacuum gently and blot spills promptly. Test cleaning products in an inconspicuous area and seek professional care for difficult marks.",
            },
            {
              title: "Lighting & electrical items",
              body: "Disconnect from the power before cleaning. Use the specified bulb and follow the supplied electrical instructions.",
            },
          ],
        })
      ),
    },
    {
      slug: "faqs",
      title: "A little help goes a long way",
      layout: layout(
        node("Heading", {
          title: "A few things\nyou might wonder.",
          eyebrow: "HERE TO HELP",
          align: "center",
        }),
        node("FAQ", {
          title: "Orders & your account",
          items: [
            {
              title: "Do I need an account to place an order?",
              body: "You can check out as a guest. An account lets you save your details and view your order history.",
            },
            {
              title: "Where can I see my order?",
              body: "Sign in to your account and open your orders. Your confirmation page also contains the details of your purchase.",
            },
            {
              title: "Can I change a placed order?",
              body: "Contact the store as soon as possible with your order number. Changes depend on the order's fulfillment status.",
            },
          ],
        }),
        node("FAQ", {
          title: "Delivery, returns & payment",
          items: [
            {
              title: "Where do you deliver?",
              body: "Choose your country from the store menu. Available delivery methods are calculated at checkout for your address.",
            },
            {
              title: "How do returns work?",
              body: "Read the returns page for your selected region and contact the store to arrange a return. Eligibility depends on the item and order.",
            },
            {
              title: "Which payment methods can I use?",
              body: "Checkout shows the payment providers enabled for your selected region.",
            },
          ],
        }),
        node("Banner", {
          title: "Still have a question?",
          body: "We're here to help you choose well.",
          label: "Contact the store",
          href: "/contact",
        })
      ),
    },
    {
      slug: "contact",
      title: "Let's talk",
      layout: layout(
        node("Heading", {
          eyebrow: "HERE TO HELP",
          title: "A human touch.\nA little guidance.",
          align: "center",
        }),
        node("Text", {
          title: "We'd love to help.",
          body: "For a question about a product, delivery or an existing order, use your store's published customer service contact. Include the product name or order number so we can help you efficiently.\n\nThis is a demonstration storefront. The merchant should add their real email, phone number and operating hours here before launch.",
        }),
        node("Cards", {
          title: "A good place to start.",
          columns: "2",
          items: [
            {
              title: "Order history",
              image: images.desk,
              body: "All the details of your recent purchases.",
              href: "/account/orders",
            },
            {
              title: "Common questions",
              image: images.ceramic,
              body: "A little help with the everyday.",
              href: "/pages/faqs",
            },
          ],
        })
      ),
    },
  ]
  for (const page of pages)
    await cms.content.upsert({
      where: { kind_slug: { kind: "page", slug: page.slug } },
      update: {},
      create: {
        kind: "page",
        ...page,
        layout: page.layout,
        published: true,
        publishedAt: new Date(),
      },
    })
  const articles = [
    {
      slug: "a-home-in-the-everyday",
      title: "A home in the everyday",
      cover: images.living,
      excerpt:
        "The small rituals and familiar objects that make a space feel like yours.",
      heading: "Start with how you live",
      body: "A home is more than a collection of objects. It's where we make the first cup, leave a book open and return at the end of the day.\n\nThe best spaces grow around the way we actually live. Start with what you reach for often. Give those moments a little room, and let the rest follow.",
    },
    {
      slug: "the-beauty-of-a-slower-morning",
      title: "The beauty of a slower morning",
      cover: images.coffee,
      excerpt:
        "Make a little room for the first cup, a quiet corner and a day that begins with intention.",
      heading: "A ritual worth keeping",
      body: "You don't need a perfect routine to enjoy a slower start. Sometimes all it takes is an extra minute with your coffee and a familiar cup.\n\nChoose objects that make simple tasks enjoyable. A good mug, a comfortable seat, a light that feels warm: little details add up to a more considered everyday.",
    },
    {
      slug: "living-with-natural-textures",
      title: "Living with natural textures",
      cover: images.textile,
      excerpt:
        "Linen, ceramic and woven surfaces bring warmth to a room without asking for attention.",
      heading: "Let texture do the talking",
      body: "A quiet colour palette doesn't have to feel flat. Combine the cool touch of ceramic with a loose weave and the grain of timber.\n\nStart with one or two materials you enjoy, then build slowly. A room with a little contrast feels more natural than a collection of perfectly matching pieces.",
    },
    {
      slug: "a-thoughtful-gift",
      title: "What makes a thoughtful gift?",
      cover: images.ceramic,
      excerpt:
        "Look to the everyday for the things someone will love using, again and again.",
      heading: "Think about their day",
      body: "A good gift says you've noticed. The coffee they make carefully, the reading corner they return to, the bag that goes everywhere with them.\n\nChoose something that belongs in that rhythm. A useful object with a little character can mean more than something made only for an occasion.",
    },
  ]
  for (const article of articles) {
    const { heading, body, ...fields } = article
    await cms.content.upsert({
      where: { kind_slug: { kind: "post", slug: article.slug } },
      update: {},
      create: {
        kind: "post",
        ...fields,
        published: true,
        publishedAt: new Date(),
        blocks: [
          { type: "text", heading, body },
          {
            type: "cta",
            heading: "Explore a more considered everyday.",
            body: "Good things, chosen with care.",
            label: "Shop the collection",
            href: "/store",
          },
        ],
      },
    })
  }
  console.log(
    "Expanded demo catalog: 16 products, 64 variants, 4 collections, 7 designed pages and 4 journal stories. Existing content preserved."
  )
  await cms.$disconnect()
}
