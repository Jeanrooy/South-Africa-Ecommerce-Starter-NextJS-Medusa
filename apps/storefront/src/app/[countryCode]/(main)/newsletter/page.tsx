"use client"
import { sdk } from "@lib/config"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function Confirm() {
  const token = useSearchParams().get("token")
  const unsubscribe = useSearchParams().get("unsubscribe") === "true"
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <div className="content-container py-24">
      <h1 className="field-display mb-8">
        {unsubscribe ? "Time to say goodbye?" : "You're almost on the list."}
      </h1>
      <p className="mb-8">
        {unsubscribe
          ? "Confirm below to remove your newsletter subscription."
          : "Confirm your subscription to receive occasional notes from Form & Field."}
      </p>
      <button
        className="field-button"
        disabled={!token || busy}
        onClick={async () => {
          setBusy(true)
          try {
            const result = await sdk.client.fetch<{ message: string }>(
              unsubscribe
                ? "/store/newsletter/unsubscribe"
                : "/store/newsletter/confirm",
              { method: "POST", body: { token } }
            )
            setMessage(result.message)
          } catch {
            setMessage(
              "This link is invalid. Please contact the store for help."
            )
          } finally {
            setBusy(false)
          }
        }}
      >
        {unsubscribe ? "Unsubscribe" : "Confirm subscription"}
      </button>
      <p role="status" className="mt-6">
        {message}
      </p>
    </div>
  )
}
export default function NewsletterConfirmation() {
  return (
    <Suspense fallback={<p className="p-12">Loading…</p>}>
      <Confirm />
    </Suspense>
  )
}
