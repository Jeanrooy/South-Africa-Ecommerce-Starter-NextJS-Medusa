import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import EmailProvider from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [EmailProvider],
})
