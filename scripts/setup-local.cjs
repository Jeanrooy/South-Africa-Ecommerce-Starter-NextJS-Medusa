const fs = require("node:fs")
const crypto = require("node:crypto")
// Creates ignored local configuration; existing files are never overwritten.
const backend = "apps/backend/.env"
const storefront = "apps/storefront/.env.local"
if (!fs.existsSync(backend))
  fs.writeFileSync(
    backend,
    [
      "DATABASE_URL=postgres://medusa:local-development-only@localhost:5432/ecomstarter",
      "CMS_DATABASE_URL=postgresql://medusa:local-development-only@localhost:5432/ecomstarter?schema=cms",
      "STORE_CORS=http://localhost:8000",
      "ADMIN_CORS=http://localhost:9000,http://localhost:5173",
      "AUTH_CORS=http://localhost:8000,http://localhost:9000,http://localhost:5173",
      `JWT_SECRET=${crypto.randomBytes(48).toString("hex")}`,
      `COOKIE_SECRET=${crypto.randomBytes(48).toString("hex")}`,
      "STOREFRONT_URL=http://localhost:8000",
      "DEFAULT_COUNTRY=za",
      "EMAIL_MODE=log",
      "PEACH_ENABLED=false",
      "",
    ].join("\n")
  )
if (!fs.existsSync(storefront))
  fs.writeFileSync(
    storefront,
    [
      "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000",
      "NEXT_PUBLIC_BASE_URL=http://localhost:8000",
      "NEXT_PUBLIC_DEFAULT_REGION=za",
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=",
      "",
    ].join("\n")
  )
console.log("Local environment files ready. Run database migrations next.")
