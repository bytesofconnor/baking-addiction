import { Link } from "react-router";
import type { Id } from "../../convex/_generated/dataModel";
import { useFamily } from "@/lib/family";
import { DESK_PATH } from "@/lib/desk";
import { cn } from "@/lib/utils";

export function RecipeEdit({
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

  if (!user || !ownerId || ownerId !== user._id) {
    return null;
  }

  return (
    <Link
      to={`${DESK_PATH}?edit=${bakeId}`}
      className={cn("book-press book-press-text recipe-edit", className)}
      aria-label={`Edit ${title}`}
    >
      Edit
    </Link>
  );
}
