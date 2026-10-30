import {
  configureStoreSearch,
  defineMiddlewares,
} from "@medusajs/framework/http"
import { rateLimit } from "express-rate-limit"

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/newsletter*",
      middlewares: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          limit: 10,
          standardHeaders: "draft-8",
          legacyHeaders: false,
          message: { message: "Too many requests. Please try again later." },
        }),
      ],
    },
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
  ],
})
