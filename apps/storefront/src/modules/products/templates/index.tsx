import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductDetail from "@modules/products/components/product-detail"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

export default function ProductTemplate({
  product,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  return (
    <>
      <div className="content-container">
        <Suspense fallback={<p className="py-20">Loading product…</p>}>
          <ProductDetail product={product} countryCode={countryCode} />
        </Suspense>
      </div>
      <div
        className="content-container my-24"
        data-testid="related-products-container"
      >
        <p className="field-eyebrow">A LITTLE MORE TO LOVE</p>
        <h2 className="font-serif text-4xl my-6">
          Good things, in good company.
        </h2>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}
