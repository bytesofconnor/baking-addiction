import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast";

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
  const toast = useToast();
  const [state, setState] = useState<"idle" | "working">("idle");

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
          toast.success("Recipe shared.");
          setState("idle");
          return;
        } catch (caught: unknown) {
          if (caught instanceof DOMException && caught.name === "AbortError") {
            setState("idle");
            return;
          }
        }
      }
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied.");
      setState("idle");
    } catch {
      toast.error("Couldn’t share that recipe. Try once more.");
      setState("idle");
    }
  }

  const spoken = state === "working" ? "Making a share slip" : `Share ${title}`;
  const label = state === "working" ? "One moment" : "Share";

  return (
    <>
      <button
        type="button"
        className={cn("book-press recipe-share", className)}
        aria-label={spoken}
        aria-busy={state === "working"}
        onClick={() => void share()}
      >
        <span className="recipe-share-deck" aria-hidden="true" data-state={state}>
          <span className="recipe-share-card recipe-share-card-back" />
          <span className="recipe-share-card recipe-share-card-front" />
        </span>
        <span className="recipe-share-words">{label}</span>
      </button>
    </>
  );
}
