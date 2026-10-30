"use client"
import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
const steps = [
  { id: "address", title: "Your details" },
  { id: "delivery", title: "Delivery" },
  { id: "payment", title: "Payment" },
  { id: "review", title: "Review" },
]
export default function CheckoutProgress({ unlocked }: { unlocked: number }) {
  const query = useSearchParams()
  const active = Math.max(
    0,
    steps.findIndex((step) => step.id === query.get("step"))
  )
  return (
    <nav className="checkout-progress" aria-label="Checkout progress">
      <ol>
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={
              index === active ? "active" : index < active ? "complete" : ""
            }
          >
            {index <= unlocked ? (
              <LocalizedClientLink
                href={`/checkout?step=${step.id}`}
                aria-current={index === active ? "step" : undefined}
              >
                <span>{index < active ? "✓" : `0${index + 1}`}</span>
                {step.title}
              </LocalizedClientLink>
            ) : (
              <span aria-disabled="true">
                <span>{`0${index + 1}`}</span>
                {step.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
