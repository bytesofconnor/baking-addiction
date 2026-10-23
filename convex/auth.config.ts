import { env } from "./_generated/server";

export default {
  providers: [
    {
      domain: env.CONVEX_SITE_URL ?? "http://127.0.0.1:3211",
      applicationID: "convex",
    },
  ],
};
