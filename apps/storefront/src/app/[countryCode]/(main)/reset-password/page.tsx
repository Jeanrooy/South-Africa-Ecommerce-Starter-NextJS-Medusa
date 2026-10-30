"use client"
import { sdk } from "@lib/config"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

function ResetPassword() {
  const token = useSearchParams().get("token")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="field-eyebrow">Your account</p>
      <h1 className="font-serif text-4xl my-6">
        {token ? "Choose a new password" : "Forgot your password?"}
      </h1>
      <p className="mb-8 text-sm text-gray-600">
        {token
          ? "Use at least 10 characters for your new password."
          : "Enter your email and we'll send you a reset link."}
      </p>
      <form
        className="flex flex-col gap-5"
        onSubmit={async (event) => {
          event.preventDefault()
          setBusy(true)
          setMessage("")
          const values = new FormData(event.currentTarget)
          try {
            if (token) {
              await sdk.auth.updateProvider(
                "customer",
                "emailpass",
                { password: String(values.get("password")) },
                token
              )
              setMessage("Your password has been updated. You can now sign in.")
            } else {
              await sdk.auth.resetPassword("customer", "emailpass", {
                identifier: String(values.get("email")),
              })
              setMessage(
                "If an account exists for this email, you'll receive a password reset link."
              )
            }
          } catch {
            setMessage(
              token
                ? "This link may have expired. Request a new password reset."
                : "We couldn't process your request. Please try again."
            )
          } finally {
            setBusy(false)
          }
        }}
      >
        <label className="text-sm">
          {token ? "New password" : "Email address"}
          <input
            className="w-full border p-3 mt-2"
            name={token ? "password" : "email"}
            type={token ? "password" : "email"}
            required
            minLength={token ? 10 : undefined}
            autoComplete={token ? "new-password" : "email"}
          />
        </label>
        <button className="field-button" disabled={busy}>
          {busy
            ? "Please wait…"
            : token
              ? "Update password"
              : "Send reset link"}
        </button>
      </form>
      <p role="status" className="my-6 text-sm">
        {message}
      </p>
      <LocalizedClientLink href="/account" className="underline text-sm">
        Back to sign in
      </LocalizedClientLink>
    </div>
  )
}
export default function Page() {
  return (
    <Suspense fallback={<p className="p-12">Loading…</p>}>
      <ResetPassword />
    </Suspense>
  )
}
