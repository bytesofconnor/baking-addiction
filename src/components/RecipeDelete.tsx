import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useFamily } from "@/lib/family";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast";

export function RecipeDelete({
  bakeId,
  title,
  ownerId,
  className,
}: {
  bakeId: Id<"bakes">;
  title: string;
  ownerId?: Id<"users">;
  className?: string;
}) {
  const { user } = useFamily();
  const removeMine = useMutation(api.bakes.removeMine);
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const toast = useToast();

  if (!user || !ownerId || ownerId !== user._id) {
    return null;
  }

  async function remove() {
    if (pending) {
      return;
    }
    const ok = window.confirm(
      `Delete “${title}” from the book? This can’t be undone.`,
    );
    if (!ok) {
      return;
    }
    setPending(true);
    try {
      await removeMine({ bakeId });
      toast.success("Recipe removed from the book.");
      navigate("/", { replace: true });
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Couldn’t delete that recipe.",
      );
      setPending(false);
    }
  }

  return (
    <div className={cn("recipe-delete-wrap", className)}>
      <button
        type="button"
        className="book-press book-press-text recipe-delete"
        disabled={pending}
        aria-busy={pending}
        aria-label={`Delete ${title}`}
        onClick={() => void remove()}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
