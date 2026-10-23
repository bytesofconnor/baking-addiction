import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    WRITER_PASSWORD: v.string(),
    AI_GATEWAY_API_KEY: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
  },
});
