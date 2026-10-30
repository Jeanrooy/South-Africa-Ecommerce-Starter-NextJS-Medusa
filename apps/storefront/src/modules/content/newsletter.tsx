"use client"
import { sdk } from "@lib/config"
import { useState } from "react"

export default function Newsletter() {
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="field-newsletter"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        setMessage("")
        const form = event.currentTarget
        const values = new FormData(form)
        try {
          const response = await sdk.client.fetch<{ message: string }>(
            "/store/newsletter",
            {
              method: "POST",
              body: {
                email: values.get("email"),
                consent: values.get("consent") === "on",
              },
            }
          )
          setMessage(response.message)
          form.reset()
        } catch {
          setMessage("We couldn't save your signup. Please try again.")
        } finally {
          setBusy(false)
        }
      }}
    >
      <label htmlFor="newsletter-email" className="field-eyebrow">
        A little inspiration, occasionally.
      </label>
      <div className="flex border-b border-current py-3 mt-3">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Your email address"
          required
          autoComplete="email"
          className="bg-transparent min-w-0 flex-1 outline-none"
        />
        <button
          disabled={busy}
          className="px-3"
          aria-label="Subscribe to newsletter"
        >
          {busy ? "…" : "↗"}
        </button>
      </div>
      <label className="flex gap-2 text-xs mt-4">
        <input type="checkbox" name="consent" required />
        I&apos;d like stories, new arrivals and store updates.
      </label>
      <p role="status" className="text-sm mt-3">
        {message}
      </p>
    </form>
  )
}
