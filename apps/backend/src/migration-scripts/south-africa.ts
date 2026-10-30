import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  createShippingOptionsWorkflow,
  updateStoresWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function southAfrica({
  container,
}: {
  container: MedusaContainer
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const { data: existing } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  })
  if (existing.some((r) => r.name === "South Africa")) return
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.*"],
  })
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: stores[0].id },
      update: {
        supported_currencies: [
          { currency_code: "zar", is_default: true },
          { currency_code: "eur", is_default: false },
          { currency_code: "usd", is_default: false },
        ],
      },
    },
  })
  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "South Africa",
          currency_code: "zar",
          countries: ["za"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "za", provider_id: "tp_system" }],
  })
  const { data: sets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "service_zones.*"],
  })
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const zone = await fulfillment.createServiceZones({
    name: "South Africa",
    fulfillment_set_id: sets[0].id,
    geo_zones: [{ country_code: "za", type: "country" }],
  })
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "South Africa standard delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zone.id,
        shipping_profile_id: profiles[0].id,
        type: {
          label: "Standard",
          description: "Demo rate. Configure your carrier before launch.",
          code: "za-standard",
        },
        prices: [
          { currency_code: "zar", amount: 95 },
          { region_id: region.id, amount: 95 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "prices.*"],
  })
  await updateProductVariantsWorkflow(container).run({
    input: {
      product_variants: variants.map((variant) => ({
        id: variant.id,
        prices: [
          ...(
            (
              variant as unknown as {
                prices: { currency_code: string; amount: number }[]
              }
            ).prices ?? []
          )
            .filter((p) => p.currency_code !== "zar")
            .map((p) => ({
              currency_code: p.currency_code,
              amount: Number(p.amount),
            })),
          { currency_code: "zar", amount: 349 },
        ],
      })),
    },
  })
}
