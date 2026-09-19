import type { SourceKind } from "../../convex/lib/sources";
import { inferSourceKind, SOURCE_KINDS } from "../../convex/lib/sources";

export type { SourceKind };
export { inferSourceKind, SOURCE_KINDS };

export const SOURCE_LABELS: Record<SourceKind, string> = {
  original: "Mine",
  family: "Family",
  friend: "A friend",
  book: "Another book",
  sally: "From Sally",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

export function sourceLine(kind: SourceKind, sourceTitle?: string) {
  const note = sourceTitle?.trim() ?? "";
  if (kind === "sally") {
    return note ? `Started from Sally's ${note}` : "Started from Sally";
  }
  if (kind === "family") {
    return note ? `A family recipe from ${note}` : "A family recipe";
  }
  if (kind === "friend") {
    return note ? `From ${note}` : "From a friend";
  }
  if (kind === "book") {
    return note ? `From ${note}` : "From another book";
  }
  if (kind === "tiktok") {
    return note ? `From TikTok — ${note}` : "From TikTok";
  }
  if (kind === "pinterest") {
    return note ? `From Pinterest — ${note}` : "From Pinterest";
  }
  return "From this kitchen";
}

export function sourceNote(kind: SourceKind): {
  label: string;
  placeholder: string;
} | null {
  if (kind === "friend") {
    return { label: "Who?", placeholder: "Aunt Marie" };
  }
  if (kind === "book") {
    return { label: "Which book?", placeholder: "The red Joy of Cooking" };
  }
  if (kind === "family") {
    return { label: "Whose card?", placeholder: "Nana" };
  }
  if (kind === "tiktok") {
    return { label: "Who posted it, if you know", placeholder: "@someone" };
  }
  if (kind === "pinterest") {
    return { label: "What the pin called it", placeholder: "The brownies everyone saves" };
  }
  return null;
}

export function sourceLink(kind: SourceKind): {
  label: string;
  placeholder: string;
} | null {
  if (kind === "sally") {
    return {
      label: "Sally's link",
      placeholder: "https://sallysbakingaddiction.com/…",
    };
  }
  if (kind === "tiktok") {
    return { label: "TikTok link", placeholder: "https://www.tiktok.com/…" };
  }
  if (kind === "pinterest") {
    return { label: "Pinterest link", placeholder: "https://www.pinterest.com/…" };
  }
  return null;
}
