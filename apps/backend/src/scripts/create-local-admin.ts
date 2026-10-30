import type { ExecArgs } from "@medusajs/framework/types"
import { Modules, MedusaError } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

export default async function createLocalAdmin({ container }: ExecArgs) {
  if (process.env.NODE_ENV === "production")
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Local admin creation is development only"
    )
  const file = path.resolve(process.cwd(), "../../.local/admin.json")
  if (fs.existsSync(file)) return
  const email = "admin@ecomstarter.local"
  const password = crypto.randomBytes(24).toString("base64url")
  const {
    result: [user],
  } = await createUsersWorkflow(container).run({
    input: { users: [{ email }] },
  })
  const auth = container.resolve(Modules.AUTH)
  const result = await auth.register("emailpass", { body: { email, password } })
  if (!result.authIdentity)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Unable to create local admin identity"
    )
  await auth.updateAuthIdentities({
    id: result.authIdentity.id,
    app_metadata: { user_id: user.id },
  })
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ email, password }, null, 2))
  console.log(
    "Local admin created. Credentials saved in ignored .local/admin.json"
  )
}
