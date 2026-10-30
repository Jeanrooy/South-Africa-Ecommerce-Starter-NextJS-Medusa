import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  if (!collections.length) {
    const {
      response: { products },
    } = await listProducts({ regionId: region.id, queryParams: { limit: 4 } })
    return (
      <li className="content-container">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
        {!products.length && (
          <p className="text-sm text-gray-600">
            Our next collection is on its way.
          </p>
        )}
      </li>
    )
  }
  return collections.map((collection) => (
    <li key={collection.id}>
      <ProductRail collection={collection} region={region} />
    </li>
  ))
}
