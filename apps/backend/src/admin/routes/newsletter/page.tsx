import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Subscriber = {
  id: string
  email: string
  consentAt: string
  confirmedAt: string | null
}
const NewsletterPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [error, setError] = useState("")
  useEffect(() => {
    fetch("/admin/subscribers", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Unable to load subscribers")
        setSubscribers((await r.json()).subscribers)
      })
      .catch((e) => setError(e.message))
  }, [])
  const download = () => {
    const csv =
      "email,confirmed_at\n" +
      subscribers
        .filter((s) => s.confirmedAt)
        .map((s) => `"${s.email.replace(/"/g, '""')}",${s.confirmedAt}`)
        .join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "confirmed-subscribers.csv"
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Container className="p-8">
      <div className="flex justify-between mb-6">
        <Heading level="h1">Newsletter subscribers</Heading>
        <Button onClick={download} disabled={!subscribers.length}>
          Export confirmed subscribers
        </Button>
      </div>
      <p className="text-ui-fg-subtle mb-6">
        Latest 500 signups. Only confirmed subscribers should receive marketing
        messages.
      </p>
      {error && <p role="alert">{error}</p>}
      {!subscribers.length && !error && <p>No subscribers yet.</p>}
      {subscribers.map((s) => (
        <div key={s.id} className="flex justify-between border-b py-4">
          <span>{s.email}</span>
          <Badge color={s.confirmedAt ? "green" : "grey"}>
            {s.confirmedAt ? "Confirmed" : "Pending"}
          </Badge>
        </div>
      ))}
    </Container>
  )
}
export const config = defineRouteConfig({ label: "Newsletter" })
export default NewsletterPage
