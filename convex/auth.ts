import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/* eslint-disable @convex-dev/no-process-env */
function siteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:4821";
}

// Only enable password provider on local deployments for testing
const isLocalDeployment =
  process.env.CONVEX_SITE_URL?.startsWith("http://127.0.0.1") ||
  process.env.CONVEX_SITE_URL?.startsWith("http://localhost") ||
  !process.env.CONVEX_CLOUD_URL ||
  process.env.CONVEX_CLOUD_URL.startsWith("http://127.0.0.1") ||
  process.env.CONVEX_CLOUD_URL.startsWith("http://localhost");
/* eslint-enable @convex-dev/no-process-env */

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    ...(isLocalDeployment ? [Password({ id: "password-local-test" })] : []),
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      const fallback = siteUrl();
      try {
        const next = new URL(redirectTo, fallback);
        if (next.origin === new URL(fallback).origin) {
          return next.toString();
        }
      } catch {
        // Fall through to the book.
      }
      return fallback;
    },
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get("users", userId);
      if (!user) {
        return;
      }
      const called =
        user.called?.trim() ||
        user.name?.trim().split(/\s+/)[0] ||
        user.email?.split("@")[0] ||
        "Family";
      if (user.called !== called) {
        await ctx.db.patch("users", userId, { called });
      }
    },
  },
});
