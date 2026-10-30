import { defineRouteConfig } from "@medusajs/admin-sdk"
import VisualEditor from "../../components/visual-editor"
const ContentPage = () => <VisualEditor />
export const config = defineRouteConfig({ label: "Content studio" })
export default ContentPage
