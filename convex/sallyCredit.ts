import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { writerOrCookArgs } from "./lib/access";
import { requireWriterOrCookQuery } from "./lib/access";
import { requireWriterToken } from "./lib/writer";

const SALLY_HOSTS = new Set([
  "sallysbakingaddiction.com",
  "www.sallysbakingaddiction.com",
]);

export const assertWriter = internalQuery({
  args: writerOrCookArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.writerToken) {
      await requireWriterToken(ctx, args.writerToken);
      return null;
    }
    await requireWriterOrCookQuery(ctx, args);
    return null;
  },
});

export const lookupCredit = action({
  args: {
    ...writerOrCookArgs,
    url: v.string(),
  },
  returns: v.object({
    hostOk: v.boolean(),
    title: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.sallyCredit.assertWriter, {
      writerToken: args.writerToken,
      kitchenId: args.kitchenId,
    });

    let parsed: URL;
    try {
      parsed = new URL(args.url.trim());
    } catch {
      return { hostOk: false, title: null };
    }

    if (!SALLY_HOSTS.has(parsed.hostname.toLowerCase())) {
      return { hostOk: false, title: null };
    }

    try {
      const response = await fetch(parsed.toString(), {
        redirect: "follow",
        headers: {
          Accept: "text/html",
        },
      });
      if (!response.ok) {
        return { hostOk: true, title: null };
      }
      const html = (await response.text()).slice(0, 80_000);
      return { hostOk: true, title: titleFromHtml(html) };
    } catch {
      return { hostOk: true, title: null };
    }
  },
});

function titleFromHtml(html: string): string | null {
  const og =
    html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    );
  const tag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const raw = og?.[1] ?? tag?.[1];
  if (!raw) {
    return null;
  }
  const cleaned = decodeEntities(raw)
    .replace(/\s*[|\-–—]\s*Sally'?s Baking.*$/i, "")
    .replace(/\s*\([^)]*recipe[^)]*\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code)),
    );
}
