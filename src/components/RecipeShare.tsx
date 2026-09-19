import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export function RecipeShare({
  bakeId,
  title,
  className,
}: {
  bakeId: Id<"bakes">;
  title: string;
  className?: string;
}) {
  const createSlip = useMutation(api.slips.create);
  const [state, setState] = useState<"idle" | "working" | "copied" | "error">(
    "idle",
  );

  async function share() {
    if (state === "working") {
      return;
    }
    setState("working");
    try {
      const { token } = await createSlip({ bakeId });
      const url = `${window.location.origin}/slip/${token}`;
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ url, title, text: title });
          setState("copied");
          window.setTimeout(() => setState("idle"), 2400);
          return;
        } catch (caught: unknown) {
          if (caught instanceof DOMException && caught.name === "AbortError") {
            setState("idle");
            return;
          }
        }
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2400);
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 2800);
    }
  }

  const spoken =
    state === "copied"
      ? "Link copied"
      : state === "error"
        ? "Couldn’t copy that link"
        : state === "working"
          ? "Making a share slip"
          : `Share ${title}`;
  const label =
    state === "copied"
      ? "Copied"
      : state === "error"
        ? "Try again"
        : state === "working"
          ? "One moment"
          : "Share";

  return (
    <button
      type="button"
      className={cn("book-press recipe-share", className)}
      aria-label={spoken}
      aria-busy={state === "working"}
      onClick={() => void share()}
    >
      {state === "copied" ? (
        <svg
          className="recipe-share-check"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
        </svg>
      ) : (
        <span className="recipe-share-deck" aria-hidden="true" data-state={state}>
          <span className="recipe-share-card recipe-share-card-back" />
          <span className="recipe-share-card recipe-share-card-front" />
        </span>
      )}
      <span className="recipe-share-words">{label}</span>
    </button>
  );
}
