import { Password } from "@convex-dev/auth/providers/Password";

// Only enable password provider on local deployments for testing
const isLocalDeployment =
  process.env.CONVEX_SITE_URL?.startsWith("http://127.0.0.1") ||
  process.env.CONVEX_SITE_URL?.startsWith("http://localhost") ||
  !process.env.CONVEX_CLOUD_URL ||
  process.env.CONVEX_CLOUD_URL.startsWith("http://127.0.0.1") ||
  process.env.CONVEX_CLOUD_URL.startsWith("http://localhost");

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL ?? "http://127.0.0.1:3211",
      applicationID: "convex",
    },
    ...(isLocalDeployment
      ? [
          Password({
            id: "password-local-test",
            // Only for local test verification - cannot be enabled on prod
          }),
        ]
      : []),
  ],
};
