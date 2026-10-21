import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    WRITER_PASSWORD: v.optional(v.string()),
    AI_GATEWAY_API_KEY: v.optional(v.string()),
    JWT_PRIVATE_KEY: v.optional(v.string()),
  },
});
