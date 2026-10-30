import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/email",
            id: "email",
            options: {
              channels: ["email"],
              mode: process.env.EMAIL_MODE ?? "log",
              apiKey: process.env.RESEND_API_KEY,
              from: process.env.EMAIL_FROM ?? "Store <onboarding@resend.dev>",
            },
          },
        ],
      },
    },
    ...(process.env.PEACH_ENABLED === "true"
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: [
                {
                  resolve: "medusa-payment-peach-payments/providers/peach",
                  id: "peach",
                  options: {
                    mode: process.env.PEACH_MODE ?? "sandbox",
                    clientId: process.env.PEACH_CLIENT_ID,
                    clientSecret: process.env.PEACH_CLIENT_SECRET,
                    merchantId: process.env.PEACH_MERCHANT_ID,
                    entityId: process.env.PEACH_ENTITY_ID,
                    secretToken: process.env.PEACH_SECRET_TOKEN,
                    referer: process.env.STOREFRONT_URL,
                    notificationUrl: process.env.PEACH_NOTIFICATION_URL,
                    shopperResultUrl: process.env.PEACH_SHOPPER_RESULT_URL,
                    defaultCurrency: "ZAR",
                    defaultCountryCode: "ZA",
                    paymentType: "DB",
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
