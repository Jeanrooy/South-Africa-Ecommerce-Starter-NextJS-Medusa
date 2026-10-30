"use client"
import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"
export default function CheckoutStep({
  step,
  number,
  complete,
  children,
}: {
  step: string
  number: string
  complete: boolean
  children: ReactNode
}) {
  const active = useSearchParams().get("step") === step
  return (
    <section
      className={`checkout-step ${active ? "checkout-step-active" : ""} ${complete ? "checkout-step-complete" : ""}`}
      data-step={step}
      data-number={complete && !active ? "✓" : number}
    >
      {children}
    </section>
  )
}
