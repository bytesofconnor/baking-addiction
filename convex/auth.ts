import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { env } from "./_generated/server";

function siteUrl(): string {
  return env.SITE_URL ?? "http://localhost:4821";
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
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
